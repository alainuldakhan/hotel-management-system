using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.AdditionalServices.Commands;

public record UpdateAdditionalServiceCommand(Guid Id, string Name, string Description, decimal Price) : IRequest;

public class UpdateAdditionalServiceCommandValidator : AbstractValidator<UpdateAdditionalServiceCommand>
{
    public UpdateAdditionalServiceCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Price).GreaterThan(0);
    }
}

public class UpdateAdditionalServiceCommandHandler : IRequestHandler<UpdateAdditionalServiceCommand>
{
    private readonly IAdditionalServiceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAdditionalServiceCommandHandler(IAdditionalServiceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateAdditionalServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(AdditionalService), request.Id);

        if (await _repository.NameExistsAsync(request.Name, excludeId: request.Id, ct: cancellationToken))
            throw new DomainException($"Additional service '{request.Name}' already exists.");

        service.Update(request.Name, request.Description, request.Price);
        _repository.Update(service);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
