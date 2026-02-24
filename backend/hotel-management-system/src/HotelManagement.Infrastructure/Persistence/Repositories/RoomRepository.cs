using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class RoomRepository : BaseRepository<Room>, IRoomRepository
{
    public RoomRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Room?> GetByNumberAsync(string number, CancellationToken ct = default)
        => await _dbSet
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.Number == number, ct);

    public async Task<Room?> GetByIdWithTypeAsync(Guid id, CancellationToken ct = default)
        => await _dbSet
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<bool> ExistsAsync(string number, CancellationToken ct = default)
        => await _dbSet.AnyAsync(r => r.Number == number, ct);
}
