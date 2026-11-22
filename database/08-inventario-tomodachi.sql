-- Inventário de equipamentos da Tomodachi Productions (conforme o PDF "Inventário de equipamentos").
-- Rode depois do 07-categorias-equipamento.sql (ou do 01-schema.sql em bancos novos).
-- Pode rodar mais de uma vez: o que já existe pelo nome é mantido.
--
-- Equipamentos com mais de uma unidade viram um item por unidade ("Bastão LED 1", "Bastão LED 2"),
-- porque o banco impede reservar o mesmo item em duas gravações ao mesmo tempo.
-- Os itens com quantidade "Não confirmada" entram desativados, para a equipe ativar quando confirmar.

INSERT INTO categoria_equipamento (nome) VALUES
    ('Câmeras e celular'),
    ('Lentes'),
    ('Áudio'),
    ('Iluminação'),
    ('Estabilização e suportes'),
    ('Acessórios e energia')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO equipamento (nome, descricao, ativo, categoria_id)
SELECT v.nome, v.descricao, v.ativo, c.id
  FROM (VALUES
    ('Sony A6300',                         NULL,                                                    true,  'Câmeras e celular'),
    ('Nikon D5100',                        NULL,                                                    true,  'Câmeras e celular'),
    ('iPhone 15 Pro',                      NULL,                                                    true,  'Câmeras e celular'),

    ('Sony 16-50 mm',                      NULL,                                                    true,  'Lentes'),
    ('Nikon 18-55 mm',                     NULL,                                                    true,  'Lentes'),
    ('Nikon 55-200 mm VR',                 NULL,                                                    true,  'Lentes'),
    ('Nikon 50 mm',                        NULL,                                                    true,  'Lentes'),

    ('Hollyland LARK M2',                  '1 kit',                                                 true,  'Áudio'),
    ('Hollyland LARK MAX 2',               '1 kit: 4 lapelas e fones de monitoramento',             true,  'Áudio'),

    ('Bastão LED 1',                       NULL,                                                    true,  'Iluminação'),
    ('Bastão LED 2',                       NULL,                                                    true,  'Iluminação'),
    ('Painel LED',                         NULL,                                                    true,  'Iluminação'),
    ('LED compacto 1',                     NULL,                                                    true,  'Iluminação'),
    ('LED compacto 2',                     NULL,                                                    true,  'Iluminação'),
    ('Lanterna Ulanzi',                    NULL,                                                    true,  'Iluminação'),

    ('Gimbal FeiyuTech SCORP-C',           NULL,                                                    true,  'Estabilização e suportes'),
    ('Tripé profissional K&F Concept laranja', NULL,                                                true,  'Estabilização e suportes'),
    ('Outros tripés',                      'Quantidade não confirmada. Ative quando confirmar.',    false, 'Estabilização e suportes'),
    ('Gaiolas',                            'Quantidade não confirmada. Ative quando confirmar.',    false, 'Estabilização e suportes'),

    ('Teleprompter',                       NULL,                                                    true,  'Acessórios e energia'),
    ('Power bank 1',                       NULL,                                                    true,  'Acessórios e energia'),
    ('Power bank 2',                       NULL,                                                    true,  'Acessórios e energia'),
    ('Power bank 3',                       NULL,                                                    true,  'Acessórios e energia'),
    ('Power bank 4',                       NULL,                                                    true,  'Acessórios e energia')
  ) AS v (nome, descricao, ativo, categoria)
  JOIN categoria_equipamento c ON c.nome = v.categoria
ON CONFLICT (nome) DO NOTHING;
