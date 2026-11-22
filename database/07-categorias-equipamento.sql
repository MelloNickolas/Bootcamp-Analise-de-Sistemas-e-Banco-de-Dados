-- Atualização para bancos que já existiam: categorias de equipamento.
-- Pode rodar mais de uma vez (não apaga nem repete nada). Bancos novos já recebem isto no 01-schema.sql.

CREATE TABLE IF NOT EXISTS categoria_equipamento (
    id    serial PRIMARY KEY,
    nome  text NOT NULL UNIQUE
);

-- Se a categoria for apagada, o equipamento continua, sem categoria.
ALTER TABLE equipamento
    ADD COLUMN IF NOT EXISTS categoria_id integer REFERENCES categoria_equipamento (id) ON DELETE SET NULL;
