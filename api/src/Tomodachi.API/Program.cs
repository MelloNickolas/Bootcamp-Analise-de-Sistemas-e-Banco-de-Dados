using System.Text;
using System.Threading.RateLimiting;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Tomodachi.Application.Applications;
using Tomodachi.Application.Interfaces;
using Tomodachi.Repository.Context;
using Tomodachi.Repository.Helpers;
using Tomodachi.Repository.Interfaces;
using Tomodachi.Repository.Repositories;
using Tomodachi.Services.Interfaces;
using Tomodachi.Services.Services;

CarregarEnv();
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// BANCO (o esquema é criado pelos scripts de database/, sem migrations)
var conexao = ConexaoHelper.Normalizar(builder.Configuration["CONNECTION_STRING"]);
builder.Services.AddDbContext<TomodachiDbContext>(opcoes => opcoes.UseNpgsql(conexao));

// DI: 1 linha por repository e por application
builder.Services.AddScoped<ILocalRepository, LocalRepository>();
builder.Services.AddScoped<ILocalApplication, LocalApplication>();
builder.Services.AddScoped<IEquipamentoRepository, EquipamentoRepository>();
builder.Services.AddScoped<IEquipamentoApplication, EquipamentoApplication>();
builder.Services.AddScoped<IEventoRepository, EventoRepository>();
builder.Services.AddScoped<IEventoApplication, EventoApplication>();
builder.Services.AddScoped<IVideoRepository, VideoRepository>();
builder.Services.AddScoped<IVideoApplication, VideoApplication>();
builder.Services.AddScoped<INotificacaoRepository, NotificacaoRepository>();
builder.Services.AddScoped<INotificacaoApplication, NotificacaoApplication>();
builder.Services.AddScoped<IDispositivoRepository, DispositivoRepository>();
builder.Services.AddScoped<IDispositivoApplication, DispositivoApplication>();
builder.Services.AddScoped<ICategoriaRepository, CategoriaRepository>();
builder.Services.AddScoped<ICategoriaApplication, CategoriaApplication>();
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IClienteApplication, ClienteApplication>();
builder.Services.AddScoped<IConfiguracaoRepository, ConfiguracaoRepository>();
builder.Services.AddScoped<IConfiguracaoApplication, ConfiguracaoApplication>();

// PUSH: Firebase se houver credencial no .env; senão, só simula no log.
// FIREBASE_CREDENTIALS_PATH = caminho do arquivo JSON (fora do repositório) ou FIREBASE_CREDENTIALS_JSON = conteúdo do JSON.
var caminhoFirebase = builder.Configuration["FIREBASE_CREDENTIALS_PATH"];
var jsonFirebase = builder.Configuration["FIREBASE_CREDENTIALS_JSON"];
if (!string.IsNullOrWhiteSpace(caminhoFirebase) || !string.IsNullOrWhiteSpace(jsonFirebase))
{
  var credencial = !string.IsNullOrWhiteSpace(jsonFirebase)
    ? CredentialFactory.FromJson<ServiceAccountCredential>(jsonFirebase).ToGoogleCredential()
    : CredentialFactory.FromFile<ServiceAccountCredential>(caminhoFirebase!).ToGoogleCredential();
  FirebaseApp.Create(new AppOptions { Credential = credencial });
  builder.Services.AddSingleton(FirebaseMessaging.DefaultInstance);
  builder.Services.AddScoped<IPushService, FcmPushService>();
}
else
{
  builder.Services.AddScoped<IPushService, PushConsoleService>();
}

// CORS (origens do .env, separadas por vírgula)
var origens = (builder.Configuration["CORS_ORIGINS"] ?? "http://localhost:5173")
  .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(opcoes => opcoes.AddDefaultPolicy(politica => politica.WithOrigins(origens).AllowAnyHeader().AllowAnyMethod()));

// LOGIN: senha única da equipe (APP_PASSWORD) e token JWT assinado com JWT_SECRET
var senhaDaEquipe = builder.Configuration["APP_PASSWORD"];
var segredoJwt = builder.Configuration["JWT_SECRET"];
if (string.IsNullOrWhiteSpace(senhaDaEquipe))
  throw new Exception("Defina APP_PASSWORD no arquivo .env (veja api/.env.example).");
if (string.IsNullOrWhiteSpace(segredoJwt) || segredoJwt.Length < 32)
  throw new Exception("Defina JWT_SECRET com pelo menos 32 caracteres no arquivo .env (veja api/.env.example).");

var diasDoToken = int.TryParse(builder.Configuration["JWT_DIAS"], out var dias) && dias > 0 ? dias : 30;
builder.Services.AddSingleton<ITokenService>(new TokenService(segredoJwt, diasDoToken));
builder.Services.AddScoped<IAuthApplication>(sp => new AuthApplication(senhaDaEquipe, sp.GetRequiredService<ITokenService>()));

builder.Services
  .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(opcoes => opcoes.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuer = false,
    ValidateAudience = false,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(segredoJwt)),
    ClockSkew = TimeSpan.FromMinutes(1)
  });
builder.Services.AddAuthorization();

// No máximo 5 tentativas de login por minuto para cada endereço
builder.Services.AddRateLimiter(opcoes =>
{
  opcoes.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
  opcoes.AddPolicy("login", contexto => RateLimitPartition.GetFixedWindowLimiter(
    contexto.Connection.RemoteIpAddress?.ToString() ?? "desconhecido",
    _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1) }));
});

// O Render fica na frente da API: lê o endereço real de quem chamou
builder.Services.Configure<ForwardedHeadersOptions>(opcoes =>
{
  opcoes.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
  opcoes.KnownNetworks.Clear();
  opcoes.KnownProxies.Clear();
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opcoes =>
{
  opcoes.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
  {
    Name = "Authorization",
    Type = SecuritySchemeType.Http,
    Scheme = "bearer",
    BearerFormat = "JWT",
    In = ParameterLocation.Header,
    Description = "Cole o token devolvido pelo /Auth/Login."
  });
  opcoes.AddSecurityRequirement(new OpenApiSecurityRequirement
  {
    { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() }
  });
});

var app = builder.Build();

app.UseForwardedHeaders();

// Swagger só no desenvolvimento, ou em produção quando SWAGGER_ENABLED=true
if (app.Environment.IsDevelopment() || builder.Configuration["SWAGGER_ENABLED"] == "true")
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" })); // keep-alive, sem banco

app.Run();

// Procura o .env subindo as pastas a partir de onde a API roda.
// Em produção não existe .env: as variáveis vêm do próprio servidor.
static void CarregarEnv()
{
  var pasta = new DirectoryInfo(AppContext.BaseDirectory);
  while (pasta != null)
  {
    var caminho = Path.Combine(pasta.FullName, ".env");
    if (File.Exists(caminho))
    {
      DotNetEnv.Env.Load(caminho);
      return;
    }
    pasta = pasta.Parent;
  }
}
