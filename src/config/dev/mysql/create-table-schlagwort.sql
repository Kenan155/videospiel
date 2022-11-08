CREATE TABLE IF NOT EXISTS schlagwort (
    id         CHAR(36) NOT NULL PRIMARY KEY,
    buch_id    CHAR(36) NOT NULL REFERENCES buch,
    schlagwort VARCHAR(16) NOT NULL CHECK (schlagwort = 'JAVASCRIPT' OR schlagwort = 'TYPESCRIPT'),

    INDEX schlagwort_buch_idx(buch_id)
) TABLESPACE buchspace ROW_FORMAT=COMPACT;
