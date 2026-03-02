namespace HotelManagement.Application.Common;

/// <summary>
/// Централизованные ключи Redis-кэша — единственное место для изменения key-schema.
/// Конвенция: "hotel:{сущность}:{уточнение}"
/// </summary>
public static class CacheKeys
{
    // ── Аналитика ──────────────────────────────────────────────────────────────
    /// <summary>Дашборд статистика. TTL: 60 сек.</summary>
    public const string DashboardStats = "hotel:analytics:dashboard";

    /// <summary>KPI за период. Используй KpiStats(from, to). TTL: 5 мин.</summary>
    public const string KpiPrefix = "hotel:analytics:kpi:";
    public static string KpiStats(DateTime from, DateTime to)
        => $"{KpiPrefix}{from:yyyyMMdd}_{to:yyyyMMdd}";

    // ── Справочники (редко меняются) ───────────────────────────────────────────
    /// <summary>Список всех типов номеров. TTL: 10 мин.</summary>
    public const string RoomTypesAll = "hotel:room-types:all";

    /// <summary>Список всех доп. услуг. TTL: 15 мин.</summary>
    public const string ServicesAll = "hotel:services:all";

    /// <summary>Список всех правил ценообразования. TTL: 5 мин.</summary>
    public const string PricingRulesAll = "hotel:pricing-rules:all";
}
