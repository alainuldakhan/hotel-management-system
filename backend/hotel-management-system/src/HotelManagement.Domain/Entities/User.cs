using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string? PhoneNumber { get; private set; }
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }

    // DNR (Do Not Rent) — гость в чёрном списке
    public bool IsDnr { get; private set; }
    public string? DnrReason { get; private set; }
    public DateTime? DnrFlaggedAt { get; private set; }
    public Guid? DnrFlaggedByUserId { get; private set; }

    // Navigation
    public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; private set; } = new List<MaintenanceRequest>();

    protected User() { }

    public static User Create(string firstName, string lastName, string email,
        string passwordHash, UserRole role, string? phoneNumber = null)
    {
        return new User
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            Role = role,
            PhoneNumber = phoneNumber
        };
    }

    public void UpdateProfile(string firstName, string lastName, string? phoneNumber)
    {
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        SetUpdatedAt();
    }

    public void SetRefreshToken(string refreshToken, DateTime expiryTime)
    {
        RefreshToken = refreshToken;
        RefreshTokenExpiryTime = expiryTime;
        SetUpdatedAt();
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryTime = null;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void FlagDnr(string reason, Guid flaggedByUserId)
    {
        IsDnr              = true;
        DnrReason          = reason;
        DnrFlaggedAt       = DateTime.UtcNow;
        DnrFlaggedByUserId = flaggedByUserId;
        SetUpdatedAt();
    }

    public void UnflagDnr()
    {
        IsDnr              = false;
        DnrReason          = null;
        DnrFlaggedAt       = null;
        DnrFlaggedByUserId = null;
        SetUpdatedAt();
    }

    public void UpdateRole(UserRole newRole)
    {
        Role = newRole;
        SetUpdatedAt();
    }

    public string FullName => $"{FirstName} {LastName}";
}
