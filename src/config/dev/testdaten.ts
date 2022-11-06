/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
        rabatt: 95,
        datum: new Date('2011-11-25'),
        speicherplatz: 35,
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
        rabatt: 0,
        datum: new Date('2014-09-02'),
        speicherplatz: 10,
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
        rabatt: 0,
        datum: new Date('2016-09-11'),
        speicherplatz: 12,
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
        version: 0,
        titel: 'Call of Duty: Mobile',
        rating: 4,
        platform: 'IOS',
        publisher: 'Activision',
        preis: 9.99,
        rabatt: 0,
        datum: new Date('2013-09-11'),
        speicherplatz: 12,
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
        rabatt: 0,
        datum: new Date('2010-09-11'),
        speicherplatz: 12,
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
        rabatt: 0,
        datum: new Date('2017-09-11'),
        speicherplatz: 12,
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
        schlagwort: 'Shooter',
    },
    {
        id: '00000000-0000-0000-0000-020000000001',
        videospiel: videospiele[1],
        schlagwort: 'Simulation',
    },
    {
        id: '00000000-0000-0000-0000-030000000001',
        videospiel: videospiele[2],
        schlagwort: 'FPS',
    },
    {
        id: '00000000-0000-0000-0000-030000000002',
        videospiel: videospiele[3],
        schlagwort: 'Mobile',
    },
    {
        id: '00000000-0000-0000-0000-500000000001',
        videospiel: videospiele[4],
        schlagwort: 'Rollenspiel',
    },
    {
        id: '00000000-0000-0000-0000-600000000001',
        videospiel: videospiele[5],
        schlagwort: 'Open World',
    },
];

videospiele[0]!.schlagwoerter.push(schlagwoerter[0]!);
videospiele[1]!.schlagwoerter.push(schlagwoerter[1]!);
videospiele[2]!.schlagwoerter.push(schlagwoerter[2]!, schlagwoerter[3]!);
videospiele[4]!.schlagwoerter.push(schlagwoerter[4]!);
videospiele[5]!.schlagwoerter.push(schlagwoerter[5]!);

/* eslint-enable @typescript-eslint/no-non-null-assertion */
