using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IUserQueryService
{
    Task<PagedResultDto<UserListItemDto>> GetAllAsync(
        string? role = null, string? search = null,
        int page = 1, int pageSize = 20,
        CancellationToken ct = default);
    Task<UserListItemDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default);
}
