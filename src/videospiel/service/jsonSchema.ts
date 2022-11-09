import { type GenericJsonSchema } from './GenericJsonSchema.js';

export const MAX_RATING = 5;

export const jsonSchema: GenericJsonSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://acme.com/videospiel.json#',
    title: 'Videospiel',
    description: 'Eigenschaften eines Videospiels: Typen und Constraints',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            pattern:
                '^[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}$',
        },
        version: {
            type: 'number',
            minimum: 0,
        },
        titel: {
            type: 'string',
            pattern: '^\\w.*',
        },
        rating: {
            type: 'number',
            minimum: 0,
            maximum: MAX_RATING,
        },
        platform: {
            type: 'string',
            enum: ['Windows', 'Android', 'IOS', ''],
        },
        publisher: {
            type: 'string',
            enum: ['Activision', 'Bethesda', 'EA', ''],
        },
        preis: {
            type: 'number',
            minimum: 0,
        },
        rabatt: {
            type: 'number',
            exclusiveMinimum: 0,
            exclusiveMaximum: 1,
        },
        datum: { type: 'string', format: 'date' },
        speicherplatz: {
            type: 'number',
            minimum: 0,
        },
        homepage: { type: 'string', format: 'uri' },
        schlagwoerter: {
            type: 'array',
            items: { type: 'object' },
        },
        erzeugt: { type: ['string', 'null'] },
        aktualisiert: { type: ['string', 'null'] },
    },
    required: ['titel', 'publisher', 'preis'],
    additionalProperties: false,
    errorMessage: {
        properties: {
            version: 'Die Versionsnummer muss mindestens 0 sein.',
            titel: 'Ein Videospieltitel muss mit einem Buchstaben, einer Ziffer oder _ beginnen.',
            rating: 'Eine Bewertung muss zwischen 0 und 5 liegen.',
            platform:
                'Die Platform eines Videospiels muss Windows, Android oder IOS sein.',
            publisher:
                'Der Publisher eines Videospiels muss Activision, Bethesda oder EA sein.',
            preis: 'Der Preis darf nicht negativ sein.',
            rabatt: 'Der Rabatt muss ein Wert zwischen 0 und 1 sein.',
            datum: 'Das Datum muss im Format yyyy-MM-dd sein.',
            speicherplatz: 'Der Speicherplatz darf nicht negativ sein.',
            homepage: 'Die Homepage ist nicht korrekt.',
        },
    },
};
