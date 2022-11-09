/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-extra-non-null-assertion */

import { type GraphQLRequest, type GraphQLResponse } from 'apollo-server-types';
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
import { type VideospielDTO } from '../../src/videospiel/graphql/videospiel-query.resolver.js';
import each from 'jest-each';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
];

const titelVorhanden = ['Skyrim', 'Sims 4', 'Battlefield 3'];

const teilTitelVorhanden = ['a', 't', 'y'];

const teilTitelNichtVorhanden = ['Xyz', 'abc'];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GraphQL Queries', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    each(idVorhanden).test(
        'Videospiel zu vorhandener ID %s',
        async (id: string) => {
            // given
            const body: GraphQLRequest = {
                query: `
                {
                    videospiel(id: "${id}") {
                        titel
                        platform
                        version
                    }
                }
            `,
            };

            // when
            const response: AxiosResponse<GraphQLResponse> = await client.post(
                graphqlPath,
                body,
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data.errors).toBeUndefined();
            expect(data.data).toBeDefined();

            const { videospiel } = data.data!;
            const result: VideospielDTO = videospiel;

            expect(result.titel).toMatch(/^\w/u);
            expect(result.version).toBeGreaterThan(-1);
            expect(result.id).toBeUndefined();
        },
    );

    test('Videospiel zu nicht-vorhandener ID', async () => {
        // given
        const id = '999999999999999999999999';
        const body: GraphQLRequest = {
            query: `
                {
                    videospiel(id: "${id}") {
                        titel
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.videospiel).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error!;

        expect(message).toBe(
            `Es wurde kein Videospiel mit der ID ${id} gefunden.`,
        );
        expect(path).toBeDefined();
        expect(path!![0]).toBe('videospiel');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    each(titelVorhanden).test(
        'Videospiel zu vorhandenem Titel %s',
        async (titel: string) => {
            // given
            const body: GraphQLRequest = {
                query: `
                    {
                        videospiele(titel: "${titel}") {
                            titel
                            platform
                        }
                    }
                `,
            };

            // when
            const response: AxiosResponse<GraphQLResponse> = await client.post(
                graphqlPath,
                body,
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data.errors).toBeUndefined();

            expect(data.data).toBeDefined();

            const { videospiele } = data.data!;

            expect(videospiele).not.toHaveLength(0);

            const videospieleArray: VideospielDTO[] = videospiele;

            expect(videospieleArray).toHaveLength(1);

            const [videospiel] = videospieleArray;

            expect(videospiel!.titel).toBe(titel);
        },
    );

    each(teilTitelVorhanden).test(
        'Videospiel zu vorhandenem Teil-Titel %s',
        async (teilTitel: string) => {
            // given
            const body: GraphQLRequest = {
                query: `
                    {
                        videospiele(titel: "${teilTitel}") {
                            titel
                            platform
                        }
                    }
                `,
            };

            // when
            const response: AxiosResponse<GraphQLResponse> = await client.post(
                graphqlPath,
                body,
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data.errors).toBeUndefined();
            expect(data.data).toBeDefined();

            const { videospiele } = data.data!;

            expect(videospiele).not.toHaveLength(0);

            const videospieleArray: VideospielDTO[] = videospiele;
            videospieleArray
                .map((videospiel) => videospiel.titel)
                .forEach((titel: string) =>
                    expect(titel.toLowerCase()).toEqual(
                        expect.stringContaining(teilTitel),
                    ),
                );
        },
    );

    each(teilTitelNichtVorhanden).test(
        'Videospiel zu nicht vorhandenem Titel %s',
        async (teilTitel: string) => {
            // given
            const body: GraphQLRequest = {
                query: `
                    {
                        videospiele(titel: "${teilTitel}") {
                            titel
                            platform
                        }
                    }
                `,
            };

            // when
            const response: AxiosResponse<GraphQLResponse> = await client.post(
                graphqlPath,
                body,
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data.data!.videospiele).toBeNull();

            const { errors } = data;

            expect(errors).toHaveLength(1);

            const [error] = errors!;
            const { message, path, extensions } = error!;

            expect(message).toBe('Es wurden keine Videospiele gefunden.');
            expect(path).toBeDefined();
            expect(path!![0]).toBe('videospiele');
            expect(extensions).toBeDefined();
            expect(extensions!.code).toBe('BAD_USER_INPUT');
        },
    );
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-extra-non-null-assertion */
