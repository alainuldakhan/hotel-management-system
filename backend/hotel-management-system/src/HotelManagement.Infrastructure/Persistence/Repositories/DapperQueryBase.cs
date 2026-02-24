using Dapper;
using HotelManagement.Application.Common.Interfaces;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Базовый класс для Dapper Query-репозиториев — используется для Queries (Read).
/// Принимает IDbConnectionFactory и предоставляет удобные методы QueryAsync / QueryFirstAsync.
/// </summary>
public abstract class DapperQueryBase
{
    protected readonly IDbConnectionFactory _connectionFactory;

    protected DapperQueryBase(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    protected async Task<IEnumerable<T>> QueryAsync<T>(
        string sql, object? param = null, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<T>(
            new CommandDefinition(sql, param, cancellationToken: ct));
    }

    protected async Task<T?> QueryFirstOrDefaultAsync<T>(
        string sql, object? param = null, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<T>(
            new CommandDefinition(sql, param, cancellationToken: ct));
    }

    protected async Task<T> QuerySingleAsync<T>(
        string sql, object? param = null, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<T>(
            new CommandDefinition(sql, param, cancellationToken: ct));
    }

    protected async Task<int> ExecuteAsync(
        string sql, object? param = null, CancellationToken ct = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteAsync(
            new CommandDefinition(sql, param, cancellationToken: ct));
    }
}
