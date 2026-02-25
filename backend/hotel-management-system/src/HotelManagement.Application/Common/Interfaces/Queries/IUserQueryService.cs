using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IUserQueryService
{
    Task<IEnumerable<UserListItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<UserListItemDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default);
}
