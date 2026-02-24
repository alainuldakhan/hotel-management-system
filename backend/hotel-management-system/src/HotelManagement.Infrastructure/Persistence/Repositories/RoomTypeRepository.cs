using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class RoomTypeRepository : BaseRepository<RoomType>, IRoomTypeRepository
{
    public RoomTypeRepository(ApplicationDbContext context) : base(context) { }

    public new async Task<RoomType?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FindAsync([id], ct);

    public async Task<bool> NameExistsAsync(string name, Guid? excludeId = null, CancellationToken ct = default)
        => await _dbSet.AnyAsync(
            rt => rt.Name == name && rt.IsActive && (excludeId == null || rt.Id != excludeId.Value),
            ct);

    public async Task<bool> HasRoomsAsync(Guid roomTypeId, CancellationToken ct = default)
        => await _context.Set<Room>().AnyAsync(r => r.RoomTypeId == roomTypeId && r.IsActive, ct);

    public new async Task AddAsync(RoomType roomType, CancellationToken ct = default)
        => await _dbSet.AddAsync(roomType, ct);

    public new void Update(RoomType roomType)
        => _dbSet.Update(roomType);
}
