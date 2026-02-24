using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IAdditionalServiceRepository
{
    Task<AdditionalService?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> NameExistsAsync(string name, Guid? excludeId = null, CancellationToken ct = default);
    Task AddAsync(AdditionalService service, CancellationToken ct = default);
    void Update(AdditionalService service);
}
