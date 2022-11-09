// https://json-schema.org/implementations.html

/**
 * Das Modul besteht aus der Klasse {@linkcode VideospielValidationService}.
 * @packageDocumentation
 */

// Ajv wird auch von Fastify genutzt
// Ajv hat ca 75 Mio Downloads/Woche, classvalidator (Nest, aehnlich Hibernate Validator) nur 1,5 Mio
// https://ajv.js.org/guide/schema-language.html#draft-2019-09-and-draft-2012-12
// https://github.com/ajv-validator/ajv/blob/master/docs/validation.md
import Ajv2020 from 'ajv/dist/2020.js';
import { Injectable } from '@nestjs/common';
import RE2 from 're2';
import { type Videospiel } from '../entity/videospiel.entity.js';
import ajvErrors from 'ajv-errors';
import formatsPlugin from 'ajv-formats';
import { getLogger } from '../../logger/logger.js';
import { jsonSchema } from './jsonSchema.js';

export const ID_PATTERN = new RE2(
    '^[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}$',
);
@Injectable()
export class VideospielValidationService {
    #ajv = new Ajv2020({
        allowUnionTypes: true,
        allErrors: true,
    });

    readonly #logger = getLogger(VideospielValidationService.name);

    constructor() {
        // https://github.com/ajv-validator/ajv-formats#formats
        formatsPlugin(this.#ajv, ['date', 'email', 'uri']);
        ajvErrors(this.#ajv);
    }

    validateId(id: string) {
        return ID_PATTERN.test(id);
    }

    /**
     * Funktion zur Validierung, wenn neue Videospiele angelegt oder vorhandene Videospiele
     * aktualisiert bzw. überschrieben werden sollen.
     */
    validate(videospiel: Videospiel) {
        this.#logger.debug('validate: videospiel=%o', videospiel);
        const validate = this.#ajv.compile<Videospiel>(jsonSchema);
        validate(videospiel);

        // nullish coalescing
        const errors = validate.errors ?? [];
        const messages = errors
            .map((error) => error.message)
            .filter((msg) => msg !== undefined);
        this.#logger.debug(
            'validate: errors=%o, messages=%o',
            errors,
            messages,
        );
        return messages.length > 0 ? (messages as string[]) : undefined;
    }
}
