using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities;

public class RoomType : BaseEntity
{
    public string Name { get; private set; } = string.Empty;          // Standard, Deluxe, Suite, Apartment
    public string? Description { get; private set; }
    public int MaxOccupancy { get; private set; }
    public decimal BasePrice { get; private set; }                    // Базовая цена за ночь
    public decimal Area { get; private set; }                         // Площадь в м²
    public List<string> Amenities { get; private set; } = new();      // Wi-Fi, TV, Mini-bar и т.д.
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public ICollection<Room> Rooms { get; private set; } = new List<Room>();
    public ICollection<PricingRule> PricingRules { get; private set; } = new List<PricingRule>();

    protected RoomType() { }

    public static RoomType Create(string name, string? description, int maxOccupancy,
        decimal basePrice, decimal area, List<string>? amenities = null)
    {
        return new RoomType
        {
            Name = name,
            Description = description,
            MaxOccupancy = maxOccupancy,
            BasePrice = basePrice,
            Area = area,
            Amenities = amenities ?? new List<string>()
        };
    }

    public void Update(string name, string? description, int maxOccupancy,
        decimal basePrice, decimal area, List<string>? amenities)
    {
        Name = name;
        Description = description;
        MaxOccupancy = maxOccupancy;
        BasePrice = basePrice;
        Area = area;
        Amenities = amenities ?? new List<string>();
        SetUpdatedAt();
    }

    public void SetImage(string imageUrl)
    {
        ImageUrl = imageUrl;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }
}
