-- Atualização para bancos que já existiam: guarda o horário de silêncio das notificações.
-- Pode rodar mais de uma vez (não apaga nem repete nada). Bancos novos já recebem esta tabela no 01-schema.sql.

CREATE TABLE IF NOT EXISTS configuracao_notificacao (
    id              integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    silencio_ativo  boolean NOT NULL DEFAULT true,
    silencio_inicio integer NOT NULL DEFAULT 22 CHECK (silencio_inicio BETWEEN 0 AND 23),
    silencio_fim    integer NOT NULL DEFAULT 7  CHECK (silencio_fim BETWEEN 0 AND 23)
);

INSERT INTO configuracao_notificacao (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
