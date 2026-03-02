using FluentValidation;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Users.Commands;

// ── Flag DNR ──────────────────────────────────────────────────────────────────

public record FlagGuestDnrCommand(Guid UserId, string Reason, Guid FlaggedByUserId) : IRequest;

public class FlagGuestDnrCommandValidator : AbstractValidator<FlagGuestDnrCommand>
{
    public FlagGuestDnrCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.FlaggedByUserId).NotEmpty();
    }
}

public class FlagGuestDnrCommandHandler : IRequestHandler<FlagGuestDnrCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public FlagGuestDnrCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork     = unitOfWork;
    }

    public async Task Handle(FlagGuestDnrCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        user.FlagDnr(request.Reason, request.FlaggedByUserId);
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

// ── Unflag DNR ────────────────────────────────────────────────────────────────

public record UnflagGuestDnrCommand(Guid UserId) : IRequest;

public class UnflagGuestDnrCommandHandler : IRequestHandler<UnflagGuestDnrCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UnflagGuestDnrCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork     = unitOfWork;
    }

    public async Task Handle(UnflagGuestDnrCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        user.UnflagDnr();
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
