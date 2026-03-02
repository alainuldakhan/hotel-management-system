using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class RoomBlockRepository : IRoomBlockRepository
{
    private readonly ApplicationDbContext _context;

    public RoomBlockRepository(ApplicationDbContext context)
        => _context = context;

    public async Task<RoomBlock?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.RoomBlocks.FindAsync([id], ct);

    public async Task AddAsync(RoomBlock block, CancellationToken ct = default)
        => await _context.RoomBlocks.AddAsync(block, ct);

    public void Update(RoomBlock block)
        => _context.RoomBlocks.Update(block);

    public async Task<bool> HasActiveBlockAsync(
        Guid roomId, DateTime from, DateTime to, CancellationToken ct = default)
        => await _context.RoomBlocks.AnyAsync(
            b => b.RoomId == roomId
              && b.IsActive
              && b.BlockedFrom < to
              && b.BlockedTo   > from,
            ct);
}
