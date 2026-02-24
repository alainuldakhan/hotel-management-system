namespace HotelManagement.Domain.Enums;

public enum HousekeepingTaskType
{
    /// <summary>Стандартная уборка</summary>
    General = 1,
    /// <summary>Уборка после выезда</summary>
    Checkout = 2,
    /// <summary>Вечерняя подготовка номера</summary>
    Turndown = 3,
    /// <summary>Глубокая уборка</summary>
    DeepCleaning = 4,
    /// <summary>Пополнение мини-бара / расходников</summary>
    Replenishment = 5
}
