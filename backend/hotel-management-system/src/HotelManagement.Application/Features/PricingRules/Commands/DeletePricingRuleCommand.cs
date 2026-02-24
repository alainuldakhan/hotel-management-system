using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.PricingRules.Commands;

public record DeletePricingRuleCommand(Guid Id) : IRequest;

public class DeletePricingRuleCommandHandler : IRequestHandler<DeletePricingRuleCommand>
{
    private readonly IPricingRuleRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeletePricingRuleCommandHandler(IPricingRuleRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeletePricingRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(PricingRule), request.Id);

        rule.Deactivate();
        _repository.Update(rule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
