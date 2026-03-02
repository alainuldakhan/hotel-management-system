using FluentValidation;
using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.PricingRules.Commands;

public record UpdatePricingRuleCommand(
    Guid Id,
    string Name,
    decimal Multiplier,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    int[]? ApplicableDays = null,
    int? MinOccupancyPercent = null,
    int? MaxDaysBeforeCheckIn = null,
    Guid? RoomTypeId = null
) : IRequest;

public class UpdatePricingRuleCommandValidator : AbstractValidator<UpdatePricingRuleCommand>
{
    public UpdatePricingRuleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Multiplier).GreaterThan(0).LessThanOrEqualTo(5);
    }
}

public class UpdatePricingRuleCommandHandler : IRequestHandler<UpdatePricingRuleCommand>
{
    private readonly IPricingRuleRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;

    public UpdatePricingRuleCommandHandler(
        IPricingRuleRepository repository,
        IUnitOfWork unitOfWork,
        ICacheService cache)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _cache = cache;
    }

    public async Task Handle(UpdatePricingRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(PricingRule), request.Id);

        rule.Update(
            request.Name, request.Multiplier,
            request.StartDate, request.EndDate,
            request.ApplicableDays?.Select(d => (DayOfWeek)d).ToArray(),
            request.MinOccupancyPercent, request.MaxDaysBeforeCheckIn,
            request.RoomTypeId
        );

        _repository.Update(rule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _cache.RemoveAsync(CacheKeys.PricingRulesAll);
    }
}
