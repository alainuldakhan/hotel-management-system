using System.Data;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Фабрика соединений с БД для Dapper (Query-сторона CQRS).
/// Реализация находится в Infrastructure, интерфейс — в Application.
/// </summary>
public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
