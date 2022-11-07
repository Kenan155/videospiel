/**
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder}.
 * @packageDocumentation
 */

import { FindOptionsUtils, Repository, type SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Videospiel } from '../entity/videospiel.entity.js';
import { getLogger } from '../../logger/logger.js';
import { typeOrmModuleOptions } from '../../config/db.js';

/**
 * Die Klasse `QueryBuilder` implementiert das Lesen für Videospiele und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #videospielAlias = `${Videospiel.name
        .charAt(0)
        .toLowerCase()}${Videospiel.name.slice(1)}`;

    readonly #repo: Repository<Videospiel>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Videospiel) repo: Repository<Videospiel>) {
        this.#repo = repo;
    }

    /**
     * Ein Videospiel mit der ID suchen.
     * @param id ID des gesuchten Videospiels
     * @returns QueryBuilder
     */
    buildId(id: string) {
        const queryBuilder = this.#repo.createQueryBuilder(
            this.#videospielAlias,
        );
        // Option { eager: true } in der Entity-Klasse wird nur bei find-Methoden des Repositories beruecksichtigt
        // https://github.com/typeorm/typeorm/issues/8292#issuecomment-1036991980
        // https://github.com/typeorm/typeorm/issues/7142
        FindOptionsUtils.joinEagerRelations(
            queryBuilder,
            queryBuilder.alias,
            this.#repo.metadata,
        );

        queryBuilder.where(`${this.#videospielAlias}.id = :id`, { id: id }); // eslint-disable-line object-shorthand
        return queryBuilder;
    }

    /**
     * Videospiele asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns QueryBuilder
     */
    build(suchkriterien: Record<string, any>) {
        this.#logger.debug('build: suchkriterien=%o', suchkriterien);

        let queryBuilder = this.#repo.createQueryBuilder(this.#videospielAlias);
        // Option { eager: true } in der Entity-Klasse wird nur bei find-Methoden des Repositories beruecksichtigt
        // https://github.com/typeorm/typeorm/issues/8292#issuecomment-1036991980
        // https://github.com/typeorm/typeorm/issues/7142
        FindOptionsUtils.joinEagerRelations(
            queryBuilder,
            queryBuilder.alias,
            this.#repo.metadata,
        );

        // z.B. { titel: 'a', rating: 5, javascript: true }
        // Rest Properties fuer anfaengliche WHERE-Klausel
        // type-coverage:ignore-next-line
        const { titel, shooter, rollenspiel, ...props } = suchkriterien;

        queryBuilder = this.#buildSchlagwoerter(
            queryBuilder,
            shooter, // eslint-disable-line @typescript-eslint/no-unsafe-argument
            rollenspiel, // eslint-disable-line @typescript-eslint/no-unsafe-argument
        );

        let useWhere = true;

        // Titel in der Query: Teilstring des Titels und "case insensitive"
        // CAVEAT: MySQL hat keinen Vergleich mit "case insensitive"
        // type-coverage:ignore-next-line
        if (titel !== undefined && typeof titel === 'string') {
            const ilike =
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';
            queryBuilder = queryBuilder.where(
                `${this.#videospielAlias}.titel ${ilike} :titel`,
                { titel: `%${titel}%` },
            );
            useWhere = false;
        }

        // Restliche Properties als Key-Value-Paare: Vergleiche auf Gleichheit
        Object.keys(props).forEach((key) => {
            const param: Record<string, any> = {};
            param[key] = props[key]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#videospielAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#videospielAlias}.${key} = :${key}`,
                      param,
                  );
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }

    #buildSchlagwoerter(
        queryBuilder: SelectQueryBuilder<Videospiel>,
        shooter: string | undefined,
        rollenspiel: string | undefined,
    ) {
        // Schlagwort JAVASCRIPT aus der 2. Tabelle
        if (shooter === 'true') {
            // https://typeorm.io/select-query-builder#inner-and-left-joins
            // eslint-disable-next-line no-param-reassign
            queryBuilder = queryBuilder.innerJoinAndSelect(
                `${this.#videospielAlias}.schlagwoerter`,
                'swJS',
                'swJS.schlagwort = :shooter',
                { shooter: 'SHOOTER' },
            );
        }
        if (rollenspiel === 'true') {
            // eslint-disable-next-line no-param-reassign
            queryBuilder = queryBuilder.innerJoinAndSelect(
                `${this.#videospielAlias}.schlagwoerter`,
                'swTS',
                'swTS.schlagwort = :rollenspiel',
                { rollenspiel: 'ROLLENSPIEL' },
            );
        }
        return queryBuilder;
    }
}
