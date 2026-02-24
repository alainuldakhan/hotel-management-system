using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities;

/// <summary>
/// Правило динамического ценообразования.
/// Система применяет правила автоматически при расчёте стоимости бронирования.
/// </summary>
public class PricingRule : BaseEntity
{
    public string Name { get; private set; } = string.Empty;       // "Weekend Surcharge", "High Season"
    public decimal Multiplier { get; private set; }                // 1.2 = +20%, 0.85 = -15%
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public DayOfWeek[]? ApplicableDays { get; private set; }       // null = все дни
    public int? MinOccupancyPercent { get; private set; }          // Срабатывает при заполненности > X%
    public int? MaxDaysBeforeCheckIn { get; private set; }         // Срабатывает если заезд < X дней
    public bool IsActive { get; private set; } = true;

    // FK
    public Guid? RoomTypeId { get; private set; }                  // null = применяется ко всем типам

    // Navigation
    public RoomType? RoomType { get; private set; }

    protected PricingRule() { }

    public static PricingRule Create(string name, decimal multiplier)
    {
        return new PricingRule
        {
            Name = name,
            Multiplier = multiplier
        };
    }

    public void Update(
        string name, decimal multiplier,
        DateTime? startDate, DateTime? endDate,
        DayOfWeek[]? applicableDays,
        int? minOccupancyPercent, int? maxDaysBeforeCheckIn,
        Guid? roomTypeId)
    {
        Name = name;
        Multiplier = multiplier;
        StartDate = startDate;
        EndDate = endDate;
        ApplicableDays = applicableDays;
        MinOccupancyPercent = minOccupancyPercent;
        MaxDaysBeforeCheckIn = maxDaysBeforeCheckIn;
        RoomTypeId = roomTypeId;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public bool IsApplicable(DateTime checkInDate, int? occupancyPercent = null)
    {
        if (!IsActive) return false;

        if (StartDate.HasValue && checkInDate < StartDate.Value) return false;
        if (EndDate.HasValue && checkInDate > EndDate.Value) return false;

        if (ApplicableDays != null && !ApplicableDays.Contains(checkInDate.DayOfWeek))
            return false;

        if (MinOccupancyPercent.HasValue && occupancyPercent.HasValue
            && occupancyPercent.Value < MinOccupancyPercent.Value)
            return false;

        if (MaxDaysBeforeCheckIn.HasValue)
        {
            var daysUntilCheckIn = (checkInDate.Date - DateTime.UtcNow.Date).Days;
            if (daysUntilCheckIn > MaxDaysBeforeCheckIn.Value) return false;
        }

        return true;
    }
}
