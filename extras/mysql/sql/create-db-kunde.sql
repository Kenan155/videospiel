-- (1) docker compose exec mysql sh
-- (2) mysql --user=root --password=p < /sql/create-db-kunde.sql
-- (3) exit

-- mysqlsh ist *NICHT* im Docker-Image enthalten: https://dev.mysql.com/doc/refman/8.0/en/mysql.html

-- https://dev.mysql.com/doc/refman/8.0/en/create-user.html
-- https://dev.mysql.com/doc/refman/8.0/en/role-names.html
CREATE USER IF NOT EXISTS kunde IDENTIFIED BY 'p';
GRANT USAGE ON *.* TO kunde;

-- https://dev.mysql.com/doc/refman/8.0/en/create-database.html
-- https://dev.mysql.com/doc/refman/8.0/en/charset.html
-- SHOW CHARACTER SET;
CREATE DATABASE IF NOT EXISTS kunde CHARACTER SET utf8;

GRANT ALL PRIVILEGES ON kunde.* to kunde;

-- https://dev.mysql.com/doc/refman/8.0/en/create-tablespace.html
-- .idb-Datei innerhalb vom "data"-Verzeichnis
CREATE TABLESPACE `kundespace` ADD DATAFILE 'kundespace.ibd' ENGINE=INNODB;
