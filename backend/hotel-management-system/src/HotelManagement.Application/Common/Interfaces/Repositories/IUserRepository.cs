using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Interfaces;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

/// <summary>
/// EF Core-репозиторий для User — только команды (Write).
/// </summary>
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
}
