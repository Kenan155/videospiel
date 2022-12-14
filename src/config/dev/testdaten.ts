/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type Schlagwort } from './../../videospiel/entity/schlagwort.entity.js';
import { type Videospiel } from '../../videospiel/entity/videospiel.entity.js';

// TypeORM kann keine SQL-Skripte ausfuehren

export const videospiele: Videospiel[] = [
    // -------------------------------------------------------------------------
    // L e s e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000001',
        version: 0,
        titel: 'Battlefield 3',
        rating: 5,
        platform: 'Windows',
        publisher: 'EA',
        preis: 59.99,
        rabatt: 0.055,
        datum: new Date('2011-11-25'),
        speicherplatz: 35.1,
        homepage: 'https://ea.com/battlefield',
        schlagwoerter: [],
        erzeugt: new Date('2011-11-25'),
        aktualisiert: new Date('2022-11-05'),
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        version: 0,
        titel: 'Sims 4',
        rating: 2,
        platform: 'Windows',
        publisher: 'EA',
        preis: 29.99,
        rabatt: 0.001,
        datum: new Date('2014-09-02'),
        speicherplatz: 10.1,
        homepage: 'https://ea.com/sims',
        schlagwoerter: [],
        erzeugt: new Date('2014-09-02'),
        aktualisiert: new Date('2022-11-05'),
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        version: 0,
        titel: 'Overwatch',
        rating: 1,
        platform: 'Windows',
        publisher: 'Activision',
        preis: 19.99,
        rabatt: 0.001,
        datum: new Date('2016-09-11'),
        speicherplatz: 12.1,
        homepage: 'https://activision.com/overwatch',
        schlagwoerter: [],
        erzeugt: new Date('2016-09-11'),
        aktualisiert: new Date('2022-11-05'),
    },
    // -------------------------------------------------------------------------
    // A e n d e r n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000040',
        version: 1,
        titel: 'Call of Duty: Mobile',
        rating: 4,
        platform: 'IOS',
        publisher: 'Activision',
        preis: 9.99,
        rabatt: 0.001,
        datum: new Date('2013-09-11'),
        speicherplatz: 12.1,
        homepage: 'https://activision.com/callofduty',
        schlagwoerter: [],
        erzeugt: new Date('2013-09-11'),
        aktualisiert: new Date('2022-11-05'),
    },
    // -------------------------------------------------------------------------
    // L o e s c h e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000050',
        version: 0,
        titel: 'Skyrim',
        rating: 5,
        platform: 'Windows',
        publisher: 'Bethesda',
        preis: 39.99,
        rabatt: 0.001,
        datum: new Date('2010-09-11'),
        speicherplatz: 12.1,
        homepage: 'https://bethesda.com/skyrim',
        schlagwoerter: [],
        erzeugt: new Date('2010-09-11'),
        aktualisiert: new Date('2022-11-05'),
    },
    {
        id: '00000000-0000-0000-0000-000000000060',
        version: 0,
        titel: 'Fallout Shelter',
        rating: 2,
        platform: 'Android',
        publisher: 'Bethesda',
        preis: 1.99,
        rabatt: 0.001,
        datum: new Date('2017-09-11'),
        speicherplatz: 12.1,
        homepage: 'https://activision.com/callofduty',
        schlagwoerter: [],
        erzeugt: new Date('2017-09-11'),
        aktualisiert: new Date('2022-11-05'),
    },
];

export const schlagwoerter: Schlagwort[] = [
    {
        id: '00000000-0000-0000-0000-010000000001',
        videospiel: videospiele[0],
        schlagwort: 'SHOOTER',
    },
    {
        id: '00000000-0000-0000-0000-020000000001',
        videospiel: videospiele[1],
        schlagwort: 'SHOOTER',
    },
    {
        id: '00000000-0000-0000-0000-030000000001',
        videospiel: videospiele[2],
        schlagwort: 'SHOOTER',
    },
    {
        id: '00000000-0000-0000-0000-030000000002',
        videospiel: videospiele[3],
        schlagwort: 'ROLLENSPIEL',
    },
    {
        id: '00000000-0000-0000-0000-500000000001',
        videospiel: videospiele[4],
        schlagwort: 'ROLLENSPIEL',
    },
    {
        id: '00000000-0000-0000-0000-600000000001',
        videospiel: videospiele[5],
        schlagwort: 'ROLLENSPIEL',
    },
];

videospiele[0]!.schlagwoerter.push(schlagwoerter[0]!);
videospiele[1]!.schlagwoerter.push(schlagwoerter[1]!);
videospiele[2]!.schlagwoerter.push(schlagwoerter[2]!, schlagwoerter[3]!);
videospiele[4]!.schlagwoerter.push(schlagwoerter[4]!);
videospiele[5]!.schlagwoerter.push(schlagwoerter[5]!);

/* eslint-enable @typescript-eslint/no-non-null-assertion */
