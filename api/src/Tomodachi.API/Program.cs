using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.EntityFrameworkCore;
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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseCors();
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
