-- Testes das regras do banco. Cada bloco marca o resultado esperado.

-- 1) DEVE FALHAR: a câmera (equipamento 1) já está no evento 1 (09:00 às 12:00).
--    Um novo evento das 10:00 às 11:00 não pode reservar a mesma câmera.
INSERT INTO evento_gravacao (titulo, local_id, inicio, fim)
VALUES ('Evento em conflito', 1, '2026-11-20 10:00-03', '2026-11-20 11:00-03');

INSERT INTO reserva_equipamento (evento_id, equipamento_id)
VALUES (currval('evento_gravacao_id_seq'), 1);
-- Esperado: ERROR: conflicting key value violates exclusion constraint "ex_reserva_sem_conflito"

-- 2) DEVE FUNCIONAR: outro equipamento, no mesmo horário, sem conflito.
INSERT INTO reserva_equipamento (evento_id, equipamento_id)
VALUES (currval('evento_gravacao_id_seq'), 2);

-- 3) DEVE FUNCIONAR: cancelar o evento libera os equipamentos.
UPDATE evento_gravacao SET status = 'cancelado' WHERE id = currval('evento_gravacao_id_seq');
SELECT e.titulo, r.equipamento_id, r.ativa
  FROM reserva_equipamento r JOIN evento_gravacao e ON e.id = r.evento_id
 WHERE e.status = 'cancelado';

-- 4) DEVE FALHAR: notificação sem origem (nem evento, nem vídeo).
INSERT INTO notificacao (tipo, proximo_envio) VALUES ('gravacao', now());
-- Esperado: ERROR: violates check constraint "ck_notificacao_origem"

-- 5) DEVE FALHAR: status de vídeo inválido.
UPDATE video SET status = 'pronto' WHERE id = 1;
-- Esperado: ERROR: violates check constraint "video_status_check"
