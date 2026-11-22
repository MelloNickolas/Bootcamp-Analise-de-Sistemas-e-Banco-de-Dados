-- Atualização para bancos que já existiam: clientes (empresas) e o vínculo com a gravação.
-- Pode rodar mais de uma vez (não apaga nem repete nada). Bancos novos já recebem isto no 01-schema.sql.

CREATE TABLE IF NOT EXISTS cliente (
    id    serial PRIMARY KEY,
    nome  text NOT NULL UNIQUE,
    cor   text NOT NULL DEFAULT '#D6BD87' CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'),
    logo  text
);

-- A gravação pode ter um cliente. Se o cliente for apagado, a gravação continua, sem cliente.
ALTER TABLE evento_gravacao
    ADD COLUMN IF NOT EXISTS cliente_id integer REFERENCES cliente (id) ON DELETE SET NULL;
