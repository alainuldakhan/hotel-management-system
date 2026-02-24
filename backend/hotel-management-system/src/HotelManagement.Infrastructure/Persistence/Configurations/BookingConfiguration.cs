using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasColumnName("id");

        builder.Property(b => b.CheckInDate).HasColumnName("check_in_date").IsRequired();
        builder.Property(b => b.CheckOutDate).HasColumnName("check_out_date").IsRequired();
        builder.Property(b => b.GuestsCount).HasColumnName("guests_count").IsRequired();

        builder.Property(b => b.Status).HasColumnName("status").IsRequired();
        builder.Property(b => b.PaymentStatus).HasColumnName("payment_status").IsRequired();

        builder.Property(b => b.TotalAmount)
            .HasColumnName("total_amount")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(b => b.PaidAmount)
            .HasColumnName("paid_amount")
            .HasPrecision(10, 2);

        builder.Property(b => b.QrCodeToken)
            .HasColumnName("qr_code_token")
            .HasMaxLength(64);

        builder.HasIndex(b => b.QrCodeToken).IsUnique();

        builder.Property(b => b.SpecialRequests).HasColumnName("special_requests").HasMaxLength(1000);
        builder.Property(b => b.ActualCheckIn).HasColumnName("actual_check_in");
        builder.Property(b => b.ActualCheckOut).HasColumnName("actual_check_out");

        builder.Property(b => b.RoomId).HasColumnName("room_id");
        builder.Property(b => b.GuestId).HasColumnName("guest_id");
        builder.Property(b => b.CreatedAt).HasColumnName("created_at");
        builder.Property(b => b.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(b => b.Room)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Guest)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.GuestId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
