using HotelManagement.Application.Common.Interfaces;
using System.Security.Claims;

namespace HotelManagement.API.Services;

/// <summary>
/// Реализация ICurrentUserService — читает sub-клейм из JWT через IHttpContextAccessor.
/// Регистрируется в API-слое, где доступен Microsoft.AspNetCore.Http.
/// </summary>
public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    public Guid? UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?
                .User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? _httpContextAccessor.HttpContext?
                    .User.FindFirstValue("sub");

            return Guid.TryParse(value, out var id) ? id : null;
        }
    }
}
