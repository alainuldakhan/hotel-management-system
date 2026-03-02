namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Предоставляет ID текущего аутентифицированного пользователя.
/// Реализуется в API-слое через IHttpContextAccessor.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
}
