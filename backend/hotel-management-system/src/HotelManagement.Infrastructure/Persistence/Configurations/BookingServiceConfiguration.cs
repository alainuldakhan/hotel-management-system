using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class BookingServiceConfiguration : IEntityTypeConfiguration<BookingService>
{
    public void Configure(EntityTypeBuilder<BookingService> builder)
    {
        builder.ToTable("booking_services");

        builder.HasKey(bs => bs.Id);
        builder.Property(bs => bs.Id).HasColumnName("id");

        builder.Property(bs => bs.Quantity).HasColumnName("quantity").IsRequired();

        builder.Property(bs => bs.UnitPrice)
            .HasColumnName("unit_price")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(bs => bs.BookingId).HasColumnName("booking_id");
        builder.Property(bs => bs.AdditionalServiceId).HasColumnName("additional_service_id");
        builder.Property(bs => bs.CreatedAt).HasColumnName("created_at");
        builder.Property(bs => bs.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(bs => bs.Booking)
            .WithMany(b => b.BookingServices)
            .HasForeignKey(bs => bs.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(bs => bs.AdditionalService)
            .WithMany(s => s.BookingServices)
            .HasForeignKey(bs => bs.AdditionalServiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
