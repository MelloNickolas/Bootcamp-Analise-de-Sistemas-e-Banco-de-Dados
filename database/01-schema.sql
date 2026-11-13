-- Agenda de Gravações e Edições da Tomodachi
-- Esquema do banco (PostgreSQL 14 ou mais novo)

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Locais de gravação
CREATE TABLE local (
    id        serial PRIMARY KEY,
    nome      text NOT NULL UNIQUE,
    endereco  text
);

-- Equipamentos disponíveis para reserva
CREATE TABLE equipamento (
    id         serial PRIMARY KEY,
    nome       text NOT NULL UNIQUE,
    descricao  text,
    ativo      boolean NOT NULL DEFAULT true
);

-- Eventos de gravação
CREATE TABLE evento_gravacao (
    id        serial PRIMARY KEY,
    titulo    text NOT NULL,
    local_id  integer NOT NULL REFERENCES local (id),
    inicio    timestamptz NOT NULL,
    fim       timestamptz NOT NULL,
    status    text NOT NULL DEFAULT 'agendado'
              CHECK (status IN ('agendado', 'realizado', 'cancelado')),
    CONSTRAINT ck_evento_periodo CHECK (fim > inicio)
);

-- Reserva de equipamento por evento (N:N entre evento e equipamento)
-- "periodo" e "ativa" são copiados do evento pelo gatilho abaixo.
CREATE TABLE reserva_equipamento (
    id              serial PRIMARY KEY,
    evento_id       integer NOT NULL REFERENCES evento_gravacao (id) ON DELETE CASCADE,
    equipamento_id  integer NOT NULL REFERENCES equipamento (id),
    periodo         tstzrange NOT NULL,
    ativa           boolean NOT NULL DEFAULT true,
    CONSTRAINT uq_reserva_evento_equipamento UNIQUE (evento_id, equipamento_id),
    -- O mesmo equipamento não pode estar em dois eventos ativos ao mesmo tempo
    CONSTRAINT ex_reserva_sem_conflito
        EXCLUDE USING gist (equipamento_id WITH =, periodo WITH &&) WHERE (ativa)
);

-- Vídeos a editar (o evento de origem é opcional)
CREATE TABLE video (
    id             serial PRIMARY KEY,
    titulo         text NOT NULL,
    evento_id      integer REFERENCES evento_gravacao (id) ON DELETE SET NULL,
    status         text NOT NULL DEFAULT 'a_editar'
                   CHECK (status IN ('a_editar', 'em_edicao', 'entregue')),
    prazo_edicao   timestamptz NOT NULL,
    prazo_entrega  timestamptz NOT NULL,
    CONSTRAINT ck_video_prazos CHECK (prazo_entrega >= prazo_edicao)
);

-- Notificações: cada linha vem de um evento ou de um vídeo, nunca dos dois
CREATE TABLE notificacao (
    id             serial PRIMARY KEY,
    evento_id      integer REFERENCES evento_gravacao (id) ON DELETE CASCADE,
    video_id       integer REFERENCES video (id) ON DELETE CASCADE,
    tipo           text NOT NULL
                   CHECK (tipo IN ('gravacao', 'prazo_edicao', 'prazo_entrega', 'aviso_equipamento')),
    proximo_envio  timestamptz NOT NULL,
    repete         boolean NOT NULL DEFAULT true,
    confirmada_em  timestamptz,
    CONSTRAINT ck_notificacao_origem CHECK (num_nonnulls(evento_id, video_id) = 1)
);

CREATE INDEX ix_notificacao_pendentes ON notificacao (proximo_envio) WHERE confirmada_em IS NULL;

-- Aparelhos que recebem as notificações (todos recebem)
CREATE TABLE dispositivo (
    id             serial PRIMARY KEY,
    token_fcm      text NOT NULL UNIQUE,
    nome_aparelho  text
);

-- Gatilhos: mantêm o período e a situação da reserva iguais aos do evento
CREATE FUNCTION fn_reserva_copia_evento() RETURNS trigger AS $$
BEGIN
    SELECT tstzrange(e.inicio, e.fim, '[)'), e.status <> 'cancelado'
      INTO NEW.periodo, NEW.ativa
      FROM evento_gravacao e
     WHERE e.id = NEW.evento_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_reserva_copia_evento
    BEFORE INSERT ON reserva_equipamento
    FOR EACH ROW EXECUTE FUNCTION fn_reserva_copia_evento();

CREATE FUNCTION fn_evento_sincroniza_reservas() RETURNS trigger AS $$
BEGIN
    UPDATE reserva_equipamento
       SET periodo = tstzrange(NEW.inicio, NEW.fim, '[)'),
           ativa   = (NEW.status <> 'cancelado')
     WHERE evento_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_evento_sincroniza_reservas
    AFTER UPDATE OF inicio, fim, status ON evento_gravacao
    FOR EACH ROW EXECUTE FUNCTION fn_evento_sincroniza_reservas();
