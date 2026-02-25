# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY HotelManagement.slnx .
COPY src/ src/

RUN dotnet restore src/HotelManagement.API/HotelManagement.API.csproj
RUN dotnet publish src/HotelManagement.API/HotelManagement.API.csproj \
    -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5151
EXPOSE 5151

ENTRYPOINT ["dotnet", "HotelManagement.API.dll"]
