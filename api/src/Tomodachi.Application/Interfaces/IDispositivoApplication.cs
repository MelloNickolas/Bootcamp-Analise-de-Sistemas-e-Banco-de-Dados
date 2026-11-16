using Tomodachi.Domain.Entities;

namespace Tomodachi.Application.Interfaces;

public interface IDispositivoApplication
{
  Task<int> RegistrarAsync(Dispositivo dispositivo);
  Task<IEnumerable<Dispositivo>> ListarAsync();
  Task RemoverAsync(int id);
}
