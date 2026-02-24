using System.Net;
using System.Text.Json;
using FluentValidation;
using HotelManagement.Domain.Exceptions;

namespace HotelManagement.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errors) = exception switch
        {
            ValidationException vex => (
                HttpStatusCode.BadRequest,
                "Validation failed.",
                vex.Errors.Select(e => e.ErrorMessage).ToList()
            ),
            DomainException dex => (
                HttpStatusCode.BadRequest,
                dex.Message,
                (List<string>?)null
            ),
            NotFoundException nex => (
                HttpStatusCode.NotFound,
                nex.Message,
                (List<string>?)null
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred.",
                (List<string>?)null
            )
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            status = (int)statusCode,
            message,
            errors
        };

        return context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
    }
}
