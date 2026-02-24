using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.AdditionalServices.Commands;

public record CreateAdditionalServiceCommand(
    string Name,
    string Description,
    decimal Price
) : IRequest<Guid>;

public class CreateAdditionalServiceCommandValidator : AbstractValidator<CreateAdditionalServiceCommand>
{
    public CreateAdditionalServiceCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price must be greater than 0.");
    }
}

public class CreateAdditionalServiceCommandHandler : IRequestHandler<CreateAdditionalServiceCommand, Guid>
{
    private readonly IAdditionalServiceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAdditionalServiceCommandHandler(IAdditionalServiceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateAdditionalServiceCommand request, CancellationToken cancellationToken)
    {
        if (await _repository.NameExistsAsync(request.Name, ct: cancellationToken))
            throw new DomainException($"Additional service '{request.Name}' already exists.");

        var service = AdditionalService.Create(request.Name, request.Description, request.Price);

        await _repository.AddAsync(service, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return service.Id;
    }
}
