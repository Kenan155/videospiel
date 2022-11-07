/**
 * Das Modul besteht aus der Klasse {@linkcode VideospielReadService}.
 * @packageDocumentation
 */

import {
    type Platform,
    type Publisher,
    Videospiel,
} from './../entity/videospiel.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { QueryBuilder } from './query-builder.js';
import { Repository } from 'typeorm';
import { VideospielValidationService } from './videospiel-validation.service.js';
import { getLogger } from '../../logger/logger.js';

export interface Suchkriterien {
    readonly titel?: string;
    readonly rating?: number;
    readonly platfom?: Platform;
    readonly publisher?: Publisher;
    readonly preis?: number;
    readonly rabatt?: number;
    readonly datum?: string;
    readonly speicherplatz?: number;
    readonly homepage?: string;
    readonly shooter?: boolean;
    readonly rollenspiel?: boolean;
}

/**
 * Die Klasse `VideospielReadService` implementiert das Lesen für Videospiele und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class VideospielReadService {
    readonly #repo: Repository<Videospiel>;

    readonly #videospielProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #validationService: VideospielValidationService;

    readonly #logger = getLogger(VideospielReadService.name);

    constructor(
        @InjectRepository(Videospiel) repo: Repository<Videospiel>,
        queryBuilder: QueryBuilder,
        validationService: VideospielValidationService,
    ) {
        this.#repo = repo;
        const videospielDummy = new Videospiel();
        this.#videospielProps = Object.getOwnPropertyNames(videospielDummy);
        this.#queryBuilder = queryBuilder;
        this.#validationService = validationService;
    }

    // Rueckgabetyp Promise bei asynchronen Funktionen
    //    ab ES2015
    //    vergleiche Task<> bei C# und Mono<> aus Project Reactor
    // Status eines Promise:
    //    Pending: das Resultat ist noch nicht vorhanden, weil die asynchrone
    //             Operation noch nicht abgeschlossen ist
    //    Fulfilled: die asynchrone Operation ist abgeschlossen und
    //               das Promise-Objekt hat einen Wert
    //    Rejected: die asynchrone Operation ist fehlgeschlagen and das
    //              Promise-Objekt wird nicht den Status "fulfilled" erreichen.
    //              Im Promise-Objekt ist dann die Fehlerursache enthalten.

    /**
     * Ein Videospiel asynchron anhand seiner ID suchen
     * @param id ID des gesuchten Videospiels
     * @returns Das gefundene Videospiel vom Typ [Videospiel](videospiel_entity_videospiel_entity.Videospiel.html) oder undefined
     *          in einem Promise aus ES2015 (vgl.: Mono aus Project Reactor oder
     *          Future aus Java)
     */
    async findById(id: string) {
        this.#logger.debug('findById: id=%s', id);

        if (!this.#validationService.validateId(id)) {
            this.#logger.debug('findById: Ungueltige ID');
            return;
        }

        // https://typeorm.io/working-with-repository
        // Das Resultat ist undefined, falls kein Datensatz gefunden
        // Lesen: Keine Transaktion erforderlich
        const videospiel = await this.#queryBuilder.buildId(id).getOne();
        if (videospiel === null) {
            this.#logger.debug('findById: Kein Videospiel gefunden');
            return;
        }

        this.#logger.debug('findById: videospiel=%o', videospiel);
        return videospiel;
    }

    /**
     * Videospiele asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns Ein JSON-Array mit den gefundenen Videospielen. Ggf. ist das Array leer.
     */
    async find(suchkriterien?: Suchkriterien) {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return this.#findAll();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#findAll();
        }

        // Falsche Namen fuer Suchkriterien?
        if (!this.#checkKeys(keys)) {
            return [];
        }

        // QueryBuilder https://typeorm.io/select-query-builder
        // Das Resultat ist eine leere Liste, falls nichts gefunden
        // Lesen: Keine Transaktion erforderlich
        const videospiele = await this.#queryBuilder
            .build(suchkriterien)
            .getMany();
        this.#logger.debug('find: videospiele=%o', videospiele);

        return videospiele;
    }

    async #findAll() {
        const videospiele = await this.#repo.find();
        this.#logger.debug('#findAll: alle videospiele=%o', videospiele);
        return videospiele;
    }

    #checkKeys(keys: string[]) {
        // Ist jedes Suchkriterium auch eine Property von Videospiel oder "schlagwoerter"?
        let validKeys = true;
        keys.forEach((key) => {
            if (
                !this.#videospielProps.includes(key) &&
                key !== 'shooter' &&
                key !== 'rollenspiel'
            ) {
                this.#logger.debug(
                    '#find: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
