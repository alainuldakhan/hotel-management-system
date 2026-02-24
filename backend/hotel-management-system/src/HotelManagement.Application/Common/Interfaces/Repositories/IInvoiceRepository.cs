using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<int> GetCurrentYearCountAsync(CancellationToken ct = default);
    Task AddAsync(Invoice invoice, CancellationToken ct = default);
    void Update(Invoice invoice);
}
