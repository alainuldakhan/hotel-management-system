using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).HasColumnName("id");

        builder.Property(i => i.InvoiceNumber)
            .HasColumnName("invoice_number")
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(i => i.InvoiceNumber).IsUnique();

        builder.Property(i => i.Amount)
            .HasColumnName("amount")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(i => i.Status).HasColumnName("status").IsRequired();
        builder.Property(i => i.PaymentMethod).HasColumnName("payment_method").HasMaxLength(50);
        builder.Property(i => i.PaidAt).HasColumnName("paid_at");
        builder.Property(i => i.Notes).HasColumnName("notes").HasMaxLength(500);
        builder.Property(i => i.BookingId).HasColumnName("booking_id");
        builder.Property(i => i.CreatedAt).HasColumnName("created_at");
        builder.Property(i => i.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(i => i.Booking)
            .WithMany(b => b.Invoices)
            .HasForeignKey(i => i.BookingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
