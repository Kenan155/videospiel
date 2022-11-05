-- docker compose exec postgres bash
-- psql --dbname=videospiel --username=videospiel --file=/scripts/create-table-videospiel.sql

-- https://www.postgresql.org/docs/devel/app-psql.html
-- https://www.postgresql.org/docs/current/ddl-schemas.html
-- https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-CREATE
-- "user-private schema" (Default-Schema: public)
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION videospiel;

ALTER ROLE videospiel SET search_path = 'videopsiel';

-- https://www.postgresql.org/docs/current/sql-createtable.html
-- https://www.postgresql.org/docs/current/datatype.html
CREATE TABLE IF NOT EXISTS videospiel (
                  -- https://www.postgresql.org/docs/current/datatype-uuid.html
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS
                  -- impliziter Index fuer Primary Key
                  -- TypeORM unterstuetzt nicht BINARY(16) fuer UUID
    id            char(36) PRIMARY KEY USING INDEX TABLESPACE videospielspace,
                  -- https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-INT
    version       integer NOT NULL DEFAULT 0,
                  -- impliziter Index als B-Baum durch UNIQUE
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS
    titel         varchar(40) NOT NULL UNIQUE USING INDEX TABLESPACE videospielspace,
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#id-1.5.4.6.6
                  -- https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS
    rating        integer NOT NULL CHECK (rating >= 0 AND rating <= 5),
                  -- https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-POSIX-REGEXP
    platform      varchar(12) NOT NULL CHECK (platform ~ 'ANDROID|IOS|WINDOWS'),
    publisher     varchar(12) NOT NULL CHECK (publisher ~ 'ACTIVISION|BETHESDA|EA'),
                  -- https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL
                  -- 10 Stellen, davon 2 Nachkommastellen
    preis         decimal(8,2) NOT NULL,
    rabatt        decimal(4,3) NOT NULL,
                  -- https://www.postgresql.org/docs/current/datatype-datetime.html
    datum         date,
    speicherplatz decimal(4,3) NOT NULL,
    homepage      varchar(40),
                  -- https://www.postgresql.org/docs/current/datatype-datetime.html
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
) TABLESPACE videospielspace;

CREATE TABLE IF NOT EXISTS schlagwort (
    id            char(36) PRIMARY KEY USING INDEX TABLESPACE viedoepsielspace,
    videopsiel_id char(36) NOT NULL REFERENCES videopsiel,
    schlagwort    varchar(16) NOT NULL
) TABLESPACE videospielspace;

-- default: btree
CREATE INDEX IF NOT EXISTS schlagwort_videospiel_idx ON schlagwort(videospiel_id) TABLESPACE videospielspace;
