using System.Text.Json;
using HotelManagement.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace HotelManagement.Infrastructure.Services;

/// <summary>
/// Redis-реализация ICacheService через StackExchange.Redis.
/// Сериализация: System.Text.Json.
/// Синглтон — IConnectionMultiplexer thread-safe.
/// </summary>
public sealed class RedisCacheService : ICacheService
{
    private readonly IDatabase _db;
    private readonly IServer _server;
    private readonly ILogger<RedisCacheService> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented        = false
    };

    public RedisCacheService(IConnectionMultiplexer multiplexer, ILogger<RedisCacheService> logger)
    {
        _db     = multiplexer.GetDatabase();
        _server = multiplexer.GetServer(multiplexer.GetEndPoints().First());
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class
    {
        try
        {
            var value = await _db.StringGetAsync(key);
            if (!value.HasValue) return null;

            return JsonSerializer.Deserialize<T>((string)value!, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis GET failed for key '{Key}'. Falling through to DB.", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan expiry, CancellationToken ct = default)
    {
        try
        {
            var json = JsonSerializer.Serialize(value, _jsonOptions);
            await _db.StringSetAsync(key, json, expiry);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis SET failed for key '{Key}'. Data not cached.", key);
        }
    }

    public async Task<T> GetOrSetAsync<T>(
        string key, Func<Task<T>> factory, TimeSpan expiry, CancellationToken ct = default) where T : class
    {
        var cached = await GetAsync<T>(key, ct);
        if (cached is not null)
            return cached;

        var result = await factory();
        await SetAsync(key, result, expiry, ct);
        return result;
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await _db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis DEL failed for key '{Key}'.", key);
        }
    }

    /// <summary>
    /// Удаляет все ключи с данным prefix через SCAN (не блокирует сервер в отличие от KEYS *).
    /// </summary>
    public async Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default)
    {
        try
        {
            var keys = _server.KeysAsync(pattern: $"{prefix}*").ToBlockingEnumerable(ct);
            foreach (var key in keys)
                await _db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis prefix-DEL failed for prefix '{Prefix}'.", prefix);
        }
    }
}
