using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IHousekeepingQueryService
{
    Task<PagedResultDto<HousekeepingTaskListItemDto>> GetPagedAsync(HousekeepingFilterDto filter, CancellationToken ct = default);
    Task<HousekeepingTaskDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
