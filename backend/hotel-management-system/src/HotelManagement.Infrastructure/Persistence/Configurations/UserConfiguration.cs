using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");

        builder.Property(u => u.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .IsRequired();

        builder.Property(u => u.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(20);

        builder.Property(u => u.Role)
            .HasColumnName("role")
            .IsRequired();

        builder.Property(u => u.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        builder.Property(u => u.RefreshToken)
            .HasColumnName("refresh_token");

        builder.Property(u => u.RefreshTokenExpiryTime)
            .HasColumnName("refresh_token_expiry_time");

        builder.Property(u => u.IsDnr).HasColumnName("is_dnr").HasDefaultValue(false);
        builder.Property(u => u.DnrReason).HasColumnName("dnr_reason").HasMaxLength(1000);
        builder.Property(u => u.DnrFlaggedAt).HasColumnName("dnr_flagged_at");
        builder.Property(u => u.DnrFlaggedByUserId).HasColumnName("dnr_flagged_by_user_id");

        builder.Property(u => u.CreatedAt).HasColumnName("created_at");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at");
    }
}

// Добавляю DNR поля в существующую конфигурацию
