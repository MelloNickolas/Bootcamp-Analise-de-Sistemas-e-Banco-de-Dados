-- Consultas que a API vai usar. Os exemplos usam as datas dos dados de exemplo
-- (20 e 21/11/2026); na API, as datas e o "agora" entram como parâmetros.

-- 1) Agenda do dia, com os equipamentos de cada evento
SELECT e.id,
       e.titulo,
       l.nome AS local,
       to_char(e.inicio AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') AS inicio,
       to_char(e.fim    AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') AS fim,
       e.status,
       string_agg(q.nome, ', ' ORDER BY q.nome) AS equipamentos
  FROM evento_gravacao e
  JOIN local l ON l.id = e.local_id
  LEFT JOIN reserva_equipamento r ON r.evento_id = e.id
  LEFT JOIN equipamento q ON q.id = r.equipamento_id
 WHERE (e.inicio AT TIME ZONE 'America/Sao_Paulo')::date = DATE '2026-11-20'
   AND e.status <> 'cancelado'
 GROUP BY e.id, l.nome
 ORDER BY e.inicio;

-- 2) Agenda da semana (segunda a domingo da semana de 20/11/2026)
SELECT to_char(e.inicio AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI') AS quando,
       e.titulo,
       l.nome AS local,
       e.status
  FROM evento_gravacao e
  JOIN local l ON l.id = e.local_id
 WHERE (e.inicio AT TIME ZONE 'America/Sao_Paulo')::date
       BETWEEN date_trunc('week', DATE '2026-11-20')::date
           AND date_trunc('week', DATE '2026-11-20')::date + 6
   AND e.status <> 'cancelado'
 ORDER BY e.inicio;

-- 3) Equipamentos livres em um horário (20/11 das 10:00 às 11:00)
SELECT q.id, q.nome
  FROM equipamento q
 WHERE q.ativo
   AND NOT EXISTS (
       SELECT 1
         FROM reserva_equipamento r
        WHERE r.equipamento_id = q.id
          AND r.ativa
          AND r.periodo && tstzrange('2026-11-20 10:00-03', '2026-11-20 11:00-03', '[)')
   )
 ORDER BY q.nome;

-- 4) Vídeos pendentes por situação, com o prazo mais próximo de cada uma
SELECT status,
       count(*) AS quantidade,
       min(prazo_entrega) AS proxima_entrega
  FROM video
 WHERE status <> 'entregue'
 GROUP BY status
 ORDER BY proxima_entrega;

-- 5) Vídeos com a entrega atrasada em relação a um dia de referência
SELECT titulo, status, prazo_entrega
  FROM video
 WHERE status <> 'entregue'
   AND prazo_entrega < timestamptz '2026-12-01 00:00-03'
 ORDER BY prazo_entrega;

-- 6) Busca por parte do título
SELECT id, titulo, inicio
  FROM evento_gravacao
 WHERE titulo ILIKE '%institucional%'
 ORDER BY inicio;

-- 7) Notificações que devem ser enviadas agora (agora = 18/11/2026 10:00)
SELECT n.id,
       n.tipo,
       COALESCE(e.titulo, v.titulo) AS item,
       n.proximo_envio,
       n.repete
  FROM notificacao n
  LEFT JOIN evento_gravacao e ON e.id = n.evento_id
  LEFT JOIN video v ON v.id = n.video_id
 WHERE n.confirmada_em IS NULL
   AND n.proximo_envio <= timestamptz '2026-11-18 10:00-03'
 ORDER BY n.proximo_envio;

-- 8) Depois de enviar: repetir daqui a 2 horas (se repete) e confirmar quando o item for concluído.
--    Roda dentro de uma transação desfeita, para não alterar os dados de exemplo.
BEGIN;

UPDATE notificacao
   SET proximo_envio = proximo_envio + interval '2 hours'
 WHERE id = 1 AND repete AND confirmada_em IS NULL;

UPDATE notificacao
   SET confirmada_em = now()
 WHERE id = 1;

SELECT id, tipo, proximo_envio, confirmada_em FROM notificacao WHERE id = 1;

ROLLBACK;

-- 9) Quantas vezes cada equipamento foi reservado (só reservas ativas)
SELECT q.nome, count(r.id) AS reservas
  FROM equipamento q
  LEFT JOIN reserva_equipamento r ON r.equipamento_id = q.id AND r.ativa
 GROUP BY q.id
 ORDER BY reservas DESC, q.nome;
