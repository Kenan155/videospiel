/* eslint-disable max-lines, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-extra-non-null-assertion */

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
import { ID_PATTERN } from '../../src/videospiel/service/videospiel-validation.service.js';
import each from 'jest-each';
import { loginGraphQL } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idsLoeschen = ['00000000-0000-0000-0000-000000000003'];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GraphQL Mutations', () => {
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

    // -------------------------------------------------------------------------
    test('Neues Videospiel', async () => {
        // given
        const token = await loginGraphQL(client);
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLRequest = {
            query: `
                mutation {
                    create(
                        input: {
                            titel: "Testgraphql",
                            rating: 1,
                            platform: Windows,
                            publisher: Activision,
                            preis: 99.99,
                            rabatt: 0.099,
                            datum: "2022-02-28",
                            speicherplatz: 36.8,
                            homepage: "http://test.de/",
                            schlagwoerter: ["Shooter"]
                        }
                    )
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data).toBeDefined();

        const { create } = data.data!;

        // Der Wert der Mutation ist die generierte ObjectID
        expect(create).toBeDefined();
        expect(ID_PATTERN.test(create as string)).toBe(true);
    });

    // -------------------------------------------------------------------------
    test('Neues Videospiel nur als "admin"/"mitarbeiter"', async () => {
        // given
        const token = await loginGraphQL(client, 'dirk.delta', 'p');
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLRequest = {
            query: `
                mutation {
                    create(
                        input: {
                            titel: "Nichtadmin",
                            rating: 1,
                            platform: Windows,
                            publisher: EA,
                            preis: 11.1,
                            rabatt: 0.011,
                            datum: "2021-01-31",
                            speicherplatz: 33.3,
                            homepage: "http://acme.com",
                            schlagwoerter: ["JAVASCRIPT"]
                        }
                    )
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, extensions } = error!;

        expect(message).toBe('Forbidden resource');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('FORBIDDEN');
    });

    // -------------------------------------------------------------------------
    test('Videospiel aktualisieren', async () => {
        // given
        const token = await loginGraphQL(client);
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLRequest = {
            query: `
                mutation {
                    update(
                        input: {
                            id: "00000000-0000-0000-0000-000000000003",
                            version: 0,
                            titel: "Geaendert",
                            rating: 5,
                            platform: IOS,
                            publisher: EA,
                            preis: 99.99,
                            rabatt: 0.099,
                            datum: "2021-01-02",
                            speicherplatz: 44.4,
                            homepage: "https://acme.com"
                        }
                    )
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        const { update } = data.data!;

        // Der Wert der Mutation ist die neue Versionsnummer
        expect(update).toBe(1);
    });

    // -------------------------------------------------------------------------
    // eslint-disable-next-line max-lines-per-function
    test('Videospiel mit ungueltigen Werten aktualisieren', async () => {
        // given
        const token = await loginGraphQL(client);
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLRequest = {
            query: `
                mutation {
                    update(
                        input: {
                            id: "00000000-0000-0000-0000-000000000003",
                            version: 1,
                            titel: "?!$",
                            rating: 999,
                            platform: Windows,
                            publisher: FOO_PUBLISHER,
                            preis: -999,
                            rabatt: 999,
                            datum: "123",
                            speicherplatz: 22.2,
                            homepage: "?!$",
                        }
                    )
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.update).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error!;

        expect(message).toEqual(expect.stringContaining(' Videospieltitel '));
        expect(message).toEqual(
            expect.stringContaining(
                'Eine Bewertung muss zwischen 0 und 5 liegen.',
            ),
        );
        expect(message).toEqual(
            expect.stringContaining('Der Preis darf nicht negativ sein.'),
        );
        expect(message).toEqual(
            expect.stringContaining(
                'Der Rabatt muss ein Wert zwischen 0 und 1 sein.',
            ),
        );
        expect(message).toEqual(
            expect.stringContaining(
                'Das Datum muss im Format yyyy-MM-dd sein.',
            ),
        );
        expect(message).toEqual(
            expect.stringContaining('Der Speicherplatz reicht nicht aus.'),
        );
        expect(message).toEqual(
            expect.stringContaining('Die Homepage ist nicht korrekt.'),
        );
        expect(path).toBeDefined();
        expect(path![0]).toBe('update');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    // -------------------------------------------------------------------------
    test('Nicht-vorhandenes Videospiel aktualisieren', async () => {
        // given
        const token = await loginGraphQL(client);
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const id = '99999999-9999-9999-9999-999999999999';
        const body: GraphQLRequest = {
            query: `
                mutation {
                    update(
                        input: {
                            id: "${id}",
                            version: 0,
                            titel: "Nichtvorhanden",
                            rating: 5,
                            platform: Android,
                            publisher: Activision,
                            preis: 99.99,
                            rabatt: 0.099,
                            datum: "2021-01-02",
                            speicherplatz: 11.1,
                            homepage: "https://acme.com",
                        }
                    )
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.update).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error!;

        expect(message).toBe(
            `Es gibt kein Videospiel mit der ID ${id.toLowerCase()}`,
        );
        expect(path).toBeDefined();
        expect(path!![0]).toBe('update');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    // -------------------------------------------------------------------------
    each(idsLoeschen).test('Videospiel loeschen %s', async (id: string) => {
        // given
        const token = await loginGraphQL(client);
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLRequest = {
            query: `
                mutation {
                    delete(id: "${id}")
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        const deleteMutation = data.data!.delete;

        // Der Wert der Mutation ist true (falls geloescht wurde) oder false
        expect(deleteMutation).toBe(true);
    });
});
/* eslint-enable max-lines, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-extra-non-null-assertion */
