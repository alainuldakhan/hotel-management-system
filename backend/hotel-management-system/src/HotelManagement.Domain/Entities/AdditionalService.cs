using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities;

public class AdditionalService : BaseEntity
{
    public string Name { get; private set; } = string.Empty;      // Breakfast, Transfer, Spa, Excursion
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string? IconUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public ICollection<BookingService> BookingServices { get; private set; } = new List<BookingService>();

    protected AdditionalService() { }

    public static AdditionalService Create(string name, string description, decimal price)
    {
        return new AdditionalService
        {
            Name = name,
            Description = description,
            Price = price
        };
    }

    public void Update(string name, string description, decimal price)
    {
        Name = name;
        Description = description;
        Price = price;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }
}
