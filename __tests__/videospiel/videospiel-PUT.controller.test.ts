import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { HttpStatus } from '@nestjs/common';
import { MAX_RATING } from '../../src/videospiel/service/jsonSchema.js';
import { type VideospielUpdateDTO } from '../../src/videospiel/rest/videospiel-write.controller.js';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const geaendertesVideospiel: VideospielUpdateDTO = {
    titel: 'Geaendert',
    rating: 1,
    platform: 'Windows',
    publisher: 'EA',
    preis: 44.4,
    rabatt: 0.044,
    datum: '2022-02-03',
    speicherplatz: 32.8,
    homepage: 'https://test.te',
};
const idVorhanden = '00000000-0000-0000-0000-000000000040';

const geaenderteVideospielIdNichtVorhanden: VideospielUpdateDTO = {
    titel: 'Nichtvorhanden',
    rating: 1,
    platform: 'Windows',
    publisher: 'EA',
    preis: 44.4,
    rabatt: 0.044,
    datum: '2022-02-04',
    speicherplatz: 32.9,
    homepage: 'https://test.te',
};
const idNichtVorhanden = '99999999-9999-9999-9999-999999999999';

const geaendertesVideospielInvalid: Record<string, unknown> = {
    titel: '?!$',
    rating: -1,
    platform: 'UNSICHTBAR',
    publisher: 'NO_PUBLISHER',
    preis: 0.01,
    rabatt: 2,
    datum: '12345-123-123',
    speicherplatz: 26.8,
};

const veraltesVideospiel: VideospielUpdateDTO = {
    titel: 'Veraltet',
    rating: 1,
    platform: 'Windows',
    publisher: 'EA',
    preis: 44.4,
    rabatt: 0.044,
    datum: '2022-02-03',
    speicherplatz: 12.5,
    homepage: 'https://test.te',
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('PUT /:id', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();

        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            headers,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Vorhandenes Videospiel aendern', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesVideospiel,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NO_CONTENT);
        expect(data).toBe('');
    });

    test('Nicht-vorhandenes Videospiel aendern', async () => {
        // given
        const url = `/${idNichtVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaenderteVideospielIdNichtVorhanden,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_FAILED);
        expect(data).toBe(
            `Es gibt kein Videospiel mit der ID "${idNichtVorhanden}".`,
        );
    });

    test('Vorhandenes Videospiel aendern, aber mit ungueltigen Daten', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesVideospielInvalid,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(data).toEqual(
            expect.arrayContaining([
                'Ein Videospieltitel muss mit einem Buchstaben, einer Ziffer oder _ beginnen.',
                `Eine Bewertung muss zwischen 0 und ${MAX_RATING} liegen.`,
                'Die Platform eines Videospiels muss Windows, Android oder IOS sein.',
                'Der Publisher eines Videospiels muss EA, Activision oder Bethesda sein.',
                'Der Rabatt muss ein Wert zwischen 0 und 1 sein.',
                'Das Datum muss im Format yyyy-MM-dd sein.',
                'Die Speicherplatz ist nicht ausreichend.',
            ]),
        );
    });

    test('Vorhandenes Videospiel aendern, aber ohne Versionsnummer', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        delete headers['If-Match'];

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesVideospiel,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_REQUIRED);
        expect(data).toBe('Header "If-Match" fehlt');
    });

    test('Vorhandenes Videospiel aendern, aber mit alter Versionsnummer', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"-1"';

        // when
        const response: AxiosResponse<string> = await client.put(
            url,
            veraltesVideospiel,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_FAILED);
        expect(data).toEqual(expect.stringContaining('Die Versionsnummer'));
    });

    test('Vorhandenes Videospiel aendern, aber ohne Token', async () => {
        // given
        const url = `/${idVorhanden}`;
        delete headers.Authorization;
        headers['If-Match'] = '"0"';

        // when
        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaendertesVideospiel,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Vorhandenes Videospiel aendern, aber mit falschem Token', async () => {
        // given
        const url = `/${idVorhanden}`;
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        // when
        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaendertesVideospiel,
            { headers },
        );

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
});
