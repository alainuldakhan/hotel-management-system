using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IAdditionalServiceQueryService
{
    Task<IEnumerable<AdditionalServiceDto>> GetAllAsync(CancellationToken ct = default);
    Task<AdditionalServiceDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
