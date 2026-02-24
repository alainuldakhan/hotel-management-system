using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IMaintenanceQueryService
{
    Task<PagedResultDto<MaintenanceRequestListItemDto>> GetPagedAsync(MaintenanceFilterDto filter, CancellationToken ct = default);
    Task<MaintenanceRequestDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
