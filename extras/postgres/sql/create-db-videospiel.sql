-- (1) PostgreSQL NICHT als user "postgres" starten, sondern implizit als "root"
--     d.h. auskommentieren in docker-compose.yaml
-- (2) docker compose exec postgres bash
-- (3) chown postgres:postgres /var/lib/postgresql/tablespace
-- (4) chown postgres:postgres /var/lib/postgresql/tablespace/videospiel
-- (5) exit
-- (6) docker compose down
-- (7) in docker-compose.yaml den User "postgres" wieder aktivieren
-- (8) docker compose up
-- (9) docker compose exec postgres bash
-- (10) psql --dbname=postgres --username=postgres --file=/sql/create-db-videospiel.sql
-- (11) exit

-- https://www.postgresql.org/docs/current/sql-createrole.html
CREATE ROLE videospiel LOGIN PASSWORD 'p';

-- https://www.postgresql.org/docs/current/sql-createdatabase.html
CREATE DATABASE videospiel;

GRANT ALL ON DATABASE videospiel TO videospiel;

-- https://www.postgresql.org/docs/10/sql-createtablespace.html
CREATE TABLESPACE videospielspace OWNER videospiel LOCATION '/var/lib/postgresql/tablespace/videospiel';
