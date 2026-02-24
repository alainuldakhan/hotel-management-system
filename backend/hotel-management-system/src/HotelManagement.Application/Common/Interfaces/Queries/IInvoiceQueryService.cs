using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Queries;

public interface IInvoiceQueryService
{
    Task<IEnumerable<InvoiceDto>> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
    Task<InvoiceDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
