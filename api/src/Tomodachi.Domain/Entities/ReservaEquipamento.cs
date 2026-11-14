namespace Tomodachi.Domain.Entities;

public class ReservaEquipamento
{
  public int ID { get; set; }
  public int EventoID { get; set; }
  public int EquipamentoID { get; set; }

  // O banco preenche "periodo" e "ativa" a partir do evento (gatilho), então a API só lê.
  public bool Ativa { get; set; }

  public EventoGravacao? Evento { get; set; }
  public Equipamento? Equipamento { get; set; }
}
