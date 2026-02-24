using FluentValidation;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Exceptions;
using HotelManagement.Domain.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Auth.Commands;

// ── Command ───────────────────────────────────────────────────────────────────

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponse>;

// ── Validator ─────────────────────────────────────────────────────────────────

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;

    public RefreshTokenCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.FindAsync(
            u => u.RefreshToken == request.RefreshToken, cancellationToken);

        var user = users.FirstOrDefault()
            ?? throw new DomainException("Invalid refresh token.");

        if (!user.IsActive)
            throw new DomainException("Account is deactivated.");

        if (user.RefreshTokenExpiryTime < DateTime.UtcNow)
            throw new DomainException("Refresh token has expired. Please login again.");

        var newRefreshToken = _jwtService.GenerateRefreshToken();
        var newRefreshExpiry = DateTime.UtcNow.AddDays(7);
        user.SetRefreshToken(newRefreshToken, newRefreshExpiry);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtService.GenerateAccessToken(user);

        return new AuthResponse(
            AccessToken: accessToken,
            RefreshToken: newRefreshToken,
            ExpiresAt: _jwtService.GetAccessTokenExpiry(),
            User: new UserInfoDto(user.Id, user.FirstName, user.LastName, user.Email, user.Role.ToString())
        );
    }
}
