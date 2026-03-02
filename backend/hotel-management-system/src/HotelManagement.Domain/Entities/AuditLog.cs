namespace HotelManagement.Domain.Entities;

/// <summary>
/// Журнал аудита — фиксирует каждое изменение доменных сущностей.
/// Заполняется автоматически через EF Core SaveChangesInterceptor.
/// </summary>
public class AuditLog
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string EntityName { get; private set; } = string.Empty;
    public string EntityId { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;     // Created / Updated / Deleted
    public string? OldValues { get; private set; }                 // JSON
    public string? NewValues { get; private set; }                 // JSON
    public Guid? ChangedBy { get; private set; }                   // userId из JWT (nullable — анонимные операции)
    public DateTime ChangedAt { get; private set; } = DateTime.UtcNow;

    protected AuditLog() { }

    public static AuditLog Create(
        string entityName,
        string entityId,
        string action,
        string? oldValues,
        string? newValues,
        Guid? changedBy)
    {
        return new AuditLog
        {
            EntityName = entityName,
            EntityId   = entityId,
            Action     = action,
            OldValues  = oldValues,
            NewValues  = newValues,
            ChangedBy  = changedBy
        };
    }
}
