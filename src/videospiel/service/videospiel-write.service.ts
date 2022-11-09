/**
 * Das Modul besteht aus der Klasse {@linkcode VideospielWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import {
    type CreateError,
    type TitelExists,
    type UpdateError,
    type VersionInvalid,
    type VersionOutdated,
    type VideospielNotExists,
} from './errors.js';
import { type DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { MailService } from '../../mail/mail.service.js';
import RE2 from 're2';
import { Schlagwort } from '../entity/schlagwort.entity.js';
import { Videospiel } from '../entity/videospiel.entity.js';
import { VideospielReadService } from './videospiel-read.service.js';
import { VideospielValidationService } from './videospiel-validation.service.js';
import { getLogger } from '../../logger/logger.js';
import { v4 as uuid } from 'uuid';

/**
 * Die Klasse `VideospielWriteService` implementiert den Anwendungskern für das
 * Schreiben von Videospielen und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class VideospielWriteService {
    private static readonly VERSION_PATTERN = new RE2('^"\\d*"');

    readonly #repo: Repository<Videospiel>;

    readonly #readService: VideospielReadService;

    readonly #validationService: VideospielValidationService;

    readonly #mailService: MailService;

    readonly #logger = getLogger(VideospielWriteService.name);

    // eslint-disable-next-line max-params
    constructor(
        @InjectRepository(Videospiel) repo: Repository<Videospiel>,
        readService: VideospielReadService,
        validationService: VideospielValidationService,
        mailService: MailService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
        this.#validationService = validationService;
        this.#mailService = mailService;
    }

    /**
     * Ein neues Videospiel soll angelegt werden.
     * @param videospiel Das neu anzulegende Videospiel
     * @returns Die ID des neu angelegten Videospiels oder im Fehlerfall
     * [CreateError](../types/videospiel_service_errors.CreateError.html)
     */
    async create(videospiel: Videospiel): Promise<CreateError | string> {
        this.#logger.debug('create: videospiel=%o', videospiel);
        const validateResult = await this.#validateCreate(videospiel);
        if (validateResult !== undefined) {
            return validateResult;
        }

        videospiel.id = uuid(); // eslint-disable-line require-atomic-updates
        videospiel.schlagwoerter.forEach((schlagwort) => {
            schlagwort.id = uuid();
        });

        // implizite Transaktion
        const videospielDb = await this.#repo.save(videospiel); // implizite Transaktion
        this.#logger.debug('create: videospielDb=%o', videospielDb);

        await this.#sendmail(videospielDb);

        return videospielDb.id!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Ein vorhandenes Videospiel soll aktualisiert werden.
     * @param videospiel Das zu aktualisierende Videospiel
     * @param id ID des zu aktualisierenden Videospiels
     * @param version Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     *  oder im Fehlerfall [UpdateError](../types/videospiel_service_errors.UpdateError.html)
     */
    async update(
        id: string | undefined,
        videospiel: Videospiel,
        version: string,
    ): Promise<UpdateError | number> {
        this.#logger.debug(
            'update: id=%s, videospiel=%o, version=%s',
            id,
            videospiel,
            version,
        );
        if (id === undefined || !this.#validationService.validateId(id)) {
            this.#logger.debug('update: Keine gueltige ID');
            return { type: 'VideospielNotExists', id };
        }

        const validateResult = await this.#validateUpdate(
            videospiel,
            id,
            version,
        );
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Videospiel)) {
            return validateResult;
        }

        const videospielNeu = validateResult;
        const updated = await this.#repo.save(videospielNeu); // implizite Transaktion
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Ein Videospiel wird asynchron anhand seiner ID gelöscht.
     *
     * @param id ID des zu löschenden Videospiels
     * @returns true, falls das Videospiel vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(id: string) {
        this.#logger.debug('delete: id=%s', id);
        if (!this.#validationService.validateId(id)) {
            this.#logger.debug('delete: Keine gueltige ID');
            return false;
        }

        const videospiel = await this.#readService.findById(id);
        if (videospiel === undefined) {
            return false;
        }

        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
            // Das Videospiel zur gegebenen ID asynchron loeschen
            const { schlagwoerter } = videospiel;
            const schlagwoerterIds = schlagwoerter.map(
                (schlagwort) => schlagwort.id,
            );
            const deleteResultSchlagwoerter = await transactionalMgr.delete(
                Schlagwort,
                schlagwoerterIds,
            );
            this.#logger.debug(
                'delete: deleteResultSchlagwoerter=%o',
                deleteResultSchlagwoerter,
            );
            deleteResult = await transactionalMgr.delete(Videospiel, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #validateCreate(
        videospiel: Videospiel,
    ): Promise<CreateError | undefined> {
        const validateResult = this.#validationService.validate(videospiel);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateCreate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const { titel } = videospiel;
        const videospiele = await this.#readService.find({ titel: titel }); // eslint-disable-line object-shorthand
        if (videospiele.length > 0) {
            return { type: 'TitelExists', titel };
        }

        this.#logger.debug('#validateCreate: ok');
        return undefined;
    }

    async #sendmail(videospiel: Videospiel) {
        const subject = `Neues Videospiel ${videospiel.id}`;
        const body = `Das Videospiel mit dem Titel <strong>${videospiel.titel}</strong> ist angelegt`;
        await this.#mailService.sendmail(subject, body);
    }

    async #validateUpdate(
        videospiel: Videospiel,
        id: string,
        versionStr: string,
    ): Promise<UpdateError | Videospiel> {
        const result = this.#validateVersion(versionStr);
        if (typeof result !== 'number') {
            return result;
        }

        const version = result;
        this.#logger.debug(
            '#validateUpdate: videospiel=%o, version=%s',
            videospiel,
            version,
        );

        const validateResult = this.#validationService.validate(videospiel);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateUpdate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const resultTitel = await this.#checkTitelExists(videospiel);
        if (resultTitel !== undefined && resultTitel.id !== id) {
            return resultTitel;
        }

        const resultFindById = await this.#findByIdAndCheckVersion(id, version);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): VersionInvalid | number {
        if (
            version === undefined ||
            !VideospielWriteService.VERSION_PATTERN.test(version)
        ) {
            const error: VersionInvalid = { type: 'VersionInvalid', version };
            this.#logger.debug('#validateVersion: VersionInvalid=%o', error);
            return error;
        }

        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #checkTitelExists(
        videospiel: Videospiel,
    ): Promise<TitelExists | undefined> {
        const { titel } = videospiel;

        const videospiele = await this.#readService.find({ titel: titel }); // eslint-disable-line object-shorthand
        if (videospiele.length > 0) {
            const [gefundenesVideospiel] = videospiele;
            const { id } = gefundenesVideospiel!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            this.#logger.debug('#checkTitelExists: id=%s', id);
            return { type: 'TitelExists', titel, id: id! }; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }

        this.#logger.debug('#checkTitelExists: ok');
        return undefined;
    }

    async #findByIdAndCheckVersion(
        id: string,
        version: number,
    ): Promise<VersionOutdated | Videospiel | VideospielNotExists> {
        const videospielDb = await this.#readService.findById(id);
        if (videospielDb === undefined) {
            const result: VideospielNotExists = {
                type: 'VideospielNotExists',
                id,
            };
            this.#logger.debug(
                '#checkIdAndVersion: VideospielNotExists=%o',
                result,
            );
            return result;
        }

        // nullish coalescing
        const versionDb = videospielDb.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        if (version < versionDb) {
            const result: VersionOutdated = {
                type: 'VersionOutdated',
                id,
                version,
            };
            this.#logger.debug(
                '#checkIdAndVersion: VersionOutdated=%o',
                result,
            );
            return result;
        }

        return videospielDb;
    }
}
