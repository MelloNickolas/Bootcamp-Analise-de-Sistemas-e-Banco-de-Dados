-- Dados de exemplo para testar o banco (nomes baseados nas telas da identidade visual)

INSERT INTO local (nome, endereco) VALUES
    ('Estúdio Tomodachi', 'A definir'),
    ('Externa', 'Local do cliente');

INSERT INTO equipamento (nome, descricao) VALUES
    ('Câmera principal', 'Câmera de cinema para as gravações'),
    ('Lente 24-70mm', 'Lente zoom padrão'),
    ('Kit de iluminação', 'Três refletores com tripé'),
    ('Microfone de lapela', 'Sem fio'),
    ('Estabilizador', 'Gimbal de três eixos');

INSERT INTO evento_gravacao (titulo, local_id, inicio, fim, status) VALUES
    ('Vídeo institucional', 1, '2026-11-20 09:00-03', '2026-11-20 12:00-03', 'agendado'),
    ('Ensaio fotográfico',  2, '2026-11-20 14:00-03', '2026-11-20 17:00-03', 'agendado'),
    ('Vídeo promocional',   1, '2026-11-21 10:00-03', '2026-11-21 13:00-03', 'agendado');

-- Reservas sem sobreposição: a câmera é usada em horários diferentes
INSERT INTO reserva_equipamento (evento_id, equipamento_id) VALUES
    (1, 1), (1, 3), (1, 4),
    (2, 1), (2, 5),
    (3, 1), (3, 2);

INSERT INTO video (titulo, evento_id, status, prazo_edicao, prazo_entrega) VALUES
    ('Vídeo institucional', 1, 'a_editar',  '2026-11-25 18:00-03', '2026-11-27 18:00-03'),
    ('Vídeo promocional',   3, 'em_edicao', '2026-11-28 18:00-03', '2026-11-30 18:00-03');

-- Avisos começam 48 horas antes e repetem a cada 2 horas até a confirmação
INSERT INTO notificacao (evento_id, tipo, proximo_envio, repete) VALUES
    (1, 'gravacao', '2026-11-18 09:00-03', true);
INSERT INTO notificacao (video_id, tipo, proximo_envio, repete) VALUES
    (1, 'prazo_entrega', '2026-11-25 18:00-03', true);
INSERT INTO notificacao (evento_id, tipo, proximo_envio, repete) VALUES
    (2, 'aviso_equipamento', '2026-11-19 14:00-03', false);
