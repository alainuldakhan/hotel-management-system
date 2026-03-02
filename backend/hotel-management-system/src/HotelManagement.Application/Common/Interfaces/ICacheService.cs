namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Абстракция кэша — не зависит от Redis, легко мокируется в тестах.
/// Реализуется в Infrastructure через StackExchange.Redis.
/// </summary>
public interface ICacheService
{
    /// <summary>Получить объект из кэша. Вернёт null если ключ не найден или истёк.</summary>
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class;

    /// <summary>Записать объект в кэш с заданным TTL.</summary>
    Task SetAsync<T>(string key, T value, TimeSpan expiry, CancellationToken ct = default);

    /// <summary>
    /// Cache-aside паттерн: вернуть из кэша если есть, иначе выполнить factory, сохранить и вернуть.
    /// </summary>
    Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan expiry, CancellationToken ct = default) where T : class;

    /// <summary>Удалить ключ из кэша (инвалидация при записи).</summary>
    Task RemoveAsync(string key, CancellationToken ct = default);

    /// <summary>Удалить все ключи начинающиеся с prefix (например "hotel:kpi:*").</summary>
    Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default);
}
