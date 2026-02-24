using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class InvoiceRepository : BaseRepository<Invoice>, IInvoiceRepository
{
    public InvoiceRepository(ApplicationDbContext context) : base(context) { }

    public new async Task<Invoice?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FindAsync([id], ct);

    public async Task<int> GetCurrentYearCountAsync(CancellationToken ct = default)
    {
        var startOfYear = new DateTime(DateTime.UtcNow.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        return await _dbSet.CountAsync(i => i.CreatedAt >= startOfYear, ct);
    }

    public new async Task AddAsync(Invoice invoice, CancellationToken ct = default)
        => await _dbSet.AddAsync(invoice, ct);

    public new void Update(Invoice invoice)
        => _dbSet.Update(invoice);
}
