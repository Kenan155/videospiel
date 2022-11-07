/* eslint-disable no-underscore-dangle */

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
import { type VideospieleModel } from '../../src/videospiel/rest/videospiel-get.controller.js';
import each from 'jest-each';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const titelVorhanden = ['a', 't', 'g'];
const titelNichtVorhanden = ['xx', 'yy'];
const schlagwoerterVorhanden = ['javascript', 'typescript'];
const schlagwoerterNichtVorhanden = ['csharp', 'php'];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GET /', () => {
    let baseURL: string;
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: () => true,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Alle Videospiele', async () => {
        // given

        // when
        const response: AxiosResponse<VideospieleModel> = await client.get('/');

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data).toBeDefined();

        const { videospiele } = data._embedded;

        videospiele
            .map((videospiel) => videospiel._links.self.href)
            .forEach((selfLink) => {
                // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
                expect(selfLink).toMatch(new RegExp(`^${baseURL}`, 'u'));
            });
    });

    each(titelVorhanden).test(
        'Videospiele mit einem Titel, der "%s" enthaelt',
        async (teilTitel: string) => {
            // given
            const params = { titel: teilTitel };

            // when
            const response: AxiosResponse<VideospieleModel> = await client.get(
                '/',
                { params },
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data).toBeDefined();

            const { videospiele } = data._embedded;

            // Jedes Videospiel hat einen Titel mit dem Teilstring 'a'
            videospiele
                .map((videospiel) => videospiel.titel)
                .forEach((titel: string) =>
                    expect(titel.toLowerCase()).toEqual(
                        expect.stringContaining(teilTitel),
                    ),
                );
        },
    );

    each(titelNichtVorhanden).test(
        'Keine Videospiele mit einem Titel, der "%s" enthaelt',
        async (teilTitel: string) => {
            // given
            const params = { titel: teilTitel };

            // when
            const response: AxiosResponse<string> = await client.get('/', {
                params,
            });

            // then
            const { status, data } = response;

            expect(status).toBe(HttpStatus.NOT_FOUND);
            expect(data).toMatch(/^not found$/iu);
        },
    );

    each(schlagwoerterVorhanden).test(
        'Mind. 1 Videospiel mit dem Schlagwort "%s"',
        async (schlagwort: string) => {
            // given
            const params = { [schlagwort]: 'true' };

            // when
            const response: AxiosResponse<VideospieleModel> = await client.get(
                '/',
                { params },
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            // JSON-Array mit mind. 1 JSON-Objekt
            expect(data).toBeDefined();

            const { videospiele } = data._embedded;

            // Jedes Videospiel hat im Array der Schlagwoerter z.B. "javascript"
            videospiele
                .map((videospiel) => videospiel.schlagwoerter)
                .forEach((schlagwoerter) =>
                    expect(schlagwoerter).toEqual(
                        expect.arrayContaining([schlagwort.toUpperCase()]),
                    ),
                );
        },
    );

    each(schlagwoerterNichtVorhanden).test(
        'Keine Videospiele mit dem Schlagwort "%s"',
        async (schlagwort: string) => {
            // given
            const params = { [schlagwort]: 'true' };

            // when
            const response: AxiosResponse<string> = await client.get('/', {
                params,
            });

            // then
            const { status, data } = response;

            expect(status).toBe(HttpStatus.NOT_FOUND);
            expect(data).toMatch(/^not found$/iu);
        },
    );

    test('Keine Videosiele zu einer nicht-vorhandenen Property', async () => {
        // given
        const params = { foo: 'bar' };

        // when
        const response: AxiosResponse<string> = await client.get('/', {
            params,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);
        expect(data).toMatch(/^not found$/iu);
    });
});
/* eslint-enable no-underscore-dangle */
