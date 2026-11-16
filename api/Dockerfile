FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore Tomodachi.sln
RUN dotnet publish src/Tomodachi.API/Tomodachi.API.csproj -c Release -o /app/publish -p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Evita o erro de inotify no Render
ENV DOTNET_hostBuilder__reloadConfigOnChange=false
# O Render informa a porta pela variável PORT
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet Tomodachi.API.dll"]
