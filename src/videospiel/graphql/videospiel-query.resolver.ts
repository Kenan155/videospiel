import { Args, Query, Resolver } from '@nestjs/graphql';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { UseInterceptors } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';
import { type Videospiel } from '../entity/videospiel.entity.js';
import { VideospielReadService } from '../service/videospiel-read.service.js';
import { getLogger } from '../../logger/logger.js';

export type VideospielDTO = Omit<
    Videospiel,
    'aktualisiert' | 'erzeugt' | 'schlagwoerter'
> & { schlagwoerter: string[] };
export interface IdInput {
    id: string;
}

@Resolver()
@UseInterceptors(ResponseTimeInterceptor)
export class VideospielQueryResolver {
    readonly #service: VideospielReadService;

    readonly #logger = getLogger(VideospielQueryResolver.name);

    constructor(service: VideospielReadService) {
        this.#service = service;
    }

    @Query('videospiel')
    async findById(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('findById: id=%s', idStr);

        const videospiel = await this.#service.findById(idStr);
        if (videospiel === undefined) {
            // UserInputError liefert Statuscode 200
            // Weitere Error-Klasse in apollo-server-errors:
            // SyntaxError, ValidationError, AuthenticationError, ForbiddenError,
            // PersistedQuery, PersistedQuery
            // https://www.apollographql.com/blog/graphql/error-handling/full-stack-error-handling-with-graphql-apollo
            throw new UserInputError(
                `Es wurde kein Videospiel mit der ID ${idStr} gefunden.`,
            );
        }
        const videospielDTO = this.#toVideospielDTO(videospiel);
        this.#logger.debug('findById: videospielDTO=%o', videospielDTO);
        return videospielDTO;
    }

    @Query('videospiele')
    async find(@Args() titel: { titel: string } | undefined) {
        const titelStr = titel?.titel;
        this.#logger.debug('find: titel=%s', titelStr);
        const suchkriterium = titelStr === undefined ? {} : { titel: titelStr };
        const videospiele = await this.#service.find(suchkriterium);
        if (videospiele.length === 0) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError('Es wurden keine Videospiele gefunden.');
        }

        const videospieleDTO = videospiele.map((videospiel) =>
            this.#toVideospielDTO(videospiel),
        );
        this.#logger.debug('find: videospieleDTO=%o', videospieleDTO);
        return videospieleDTO;
    }

    #toVideospielDTO(videospiel: Videospiel) {
        const schlagwoerter = videospiel.schlagwoerter.map(
            (schlagwort) => schlagwort.schlagwort!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        );
        const videospielDTO: VideospielDTO = {
            id: videospiel.id,
            version: videospiel.version,
            titel: videospiel.titel,
            rating: videospiel.rating,
            platform: videospiel.platform,
            publisher: videospiel.publisher,
            preis: videospiel.preis,
            rabatt: videospiel.rabatt,
            speicherplatz: videospiel.speicherplatz,
            datum: videospiel.datum,
            homepage: videospiel.homepage,
            schlagwoerter,
        };
        return videospielDTO;
    }
}
