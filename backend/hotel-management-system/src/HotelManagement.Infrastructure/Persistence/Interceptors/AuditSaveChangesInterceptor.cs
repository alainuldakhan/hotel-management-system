using System.Text.Json;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace HotelManagement.Infrastructure.Persistence.Interceptors;

/// <summary>
/// EF Core interceptor — автоматически записывает в audit_logs каждое изменение доменных сущностей.
/// Фиксирует: кто изменил, что изменил, старые и новые значения (JSON).
/// </summary>
public sealed class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditSaveChangesInterceptor(ICurrentUserService currentUserService)
        => _currentUserService = currentUserService;

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            AddAuditEntries(eventData.Context);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
            AddAuditEntries(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    private void AddAuditEntries(DbContext context)
    {
        var userId = GetCurrentUserId();

        var entries = context.ChangeTracker
            .Entries<BaseEntity>()
            .Where(e => e.State is EntityState.Added
                             or EntityState.Modified
                             or EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            var action = entry.State switch
            {
                EntityState.Added    => "Created",
                EntityState.Modified => "Updated",
                EntityState.Deleted  => "Deleted",
                _                    => "Unknown"
            };

            var oldValues = entry.State == EntityState.Modified
                ? SerializeProperties(entry.OriginalValues)
                : null;

            var newValues = entry.State != EntityState.Deleted
                ? SerializeProperties(entry.CurrentValues)
                : null;

            var log = AuditLog.Create(
                entityName: entry.Entity.GetType().Name,
                entityId:   entry.Entity.Id.ToString(),
                action:     action,
                oldValues:  oldValues,
                newValues:  newValues,
                changedBy:  userId
            );

            context.Set<AuditLog>().Add(log);
        }
    }

    private Guid? GetCurrentUserId() => _currentUserService.UserId;

    private static string? SerializeProperties(Microsoft.EntityFrameworkCore.ChangeTracking.PropertyValues values)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var prop in values.Properties)
        {
            // Не логируем чувствительные поля
            if (prop.Name is "PasswordHash" or "RefreshToken")
                continue;

            dict[prop.Name] = values[prop];
        }

        return JsonSerializer.Serialize(dict);
    }
}
