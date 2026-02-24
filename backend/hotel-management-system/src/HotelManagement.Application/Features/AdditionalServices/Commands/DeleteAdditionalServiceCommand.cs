using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.AdditionalServices.Commands;

public record DeleteAdditionalServiceCommand(Guid Id) : IRequest;

public class DeleteAdditionalServiceCommandHandler : IRequestHandler<DeleteAdditionalServiceCommand>
{
    private readonly IAdditionalServiceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAdditionalServiceCommandHandler(IAdditionalServiceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteAdditionalServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(AdditionalService), request.Id);

        service.Deactivate();
        _repository.Update(service);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
