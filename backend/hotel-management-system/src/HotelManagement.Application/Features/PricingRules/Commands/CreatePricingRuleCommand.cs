using FluentValidation;
using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.PricingRules.Commands;

public record CreatePricingRuleCommand(
    string Name,
    decimal Multiplier,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    int[]? ApplicableDays = null,
    int? MinOccupancyPercent = null,
    int? MaxDaysBeforeCheckIn = null,
    Guid? RoomTypeId = null
) : IRequest<Guid>;

public class CreatePricingRuleCommandValidator : AbstractValidator<CreatePricingRuleCommand>
{
    public CreatePricingRuleCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Multiplier).GreaterThan(0).LessThanOrEqualTo(5)
            .WithMessage("Multiplier must be between 0 and 5.");
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("End date must be after start date.");
    }
}

public class CreatePricingRuleCommandHandler : IRequestHandler<CreatePricingRuleCommand, Guid>
{
    private readonly IPricingRuleRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;

    public CreatePricingRuleCommandHandler(
        IPricingRuleRepository repository,
        IUnitOfWork unitOfWork,
        ICacheService cache)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _cache = cache;
    }

    public async Task<Guid> Handle(CreatePricingRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = PricingRule.Create(request.Name, request.Multiplier);

        rule.Update(
            request.Name, request.Multiplier,
            request.StartDate, request.EndDate,
            request.ApplicableDays?.Select(d => (DayOfWeek)d).ToArray(),
            request.MinOccupancyPercent, request.MaxDaysBeforeCheckIn,
            request.RoomTypeId
        );

        await _repository.AddAsync(rule, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cache.RemoveAsync(CacheKeys.PricingRulesAll);

        return rule.Id;
    }
}
