import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { type CreateError, type UpdateError } from '../service/errors.js';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { type IdInput } from './videospiel-query.resolver.js';
import { JwtAuthGraphQlGuard } from '../../security/auth/jwt/jwt-auth-graphql.guard.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { Roles } from '../../security/auth/roles/roles.decorator.js';
import { RolesGraphQlGuard } from '../../security/auth/roles/roles-graphql.guard.js';
import { type Schlagwort } from '../entity/schlagwort.entity.js';
import { UserInputError } from 'apollo-server-express';
import { type Videospiel } from '../entity/videospiel.entity.js';
import { VideospielWriteService } from '../service/videospiel-write.service.js';
import { getLogger } from '../../logger/logger.js';

type VideospielCreateDTO = Omit<
    Videospiel,
    'aktualisiert' | 'erzeugt' | 'id' | 'schlagwoerter' | 'version'
> & { schlagwoerter: string[] };
type VideospielUpdateDTO = Omit<
    Videospiel,
    'aktualisiert' | 'erzeugt' | 'schlagwoerter'
>;

// Authentifizierung und Autorisierung durch
//  GraphQL Shield
//      https://www.graphql-shield.com
//      https://github.com/maticzav/graphql-shield
//      https://github.com/nestjs/graphql/issues/92
//      https://github.com/maticzav/graphql-shield/issues/213
//  GraphQL AuthZ
//      https://github.com/AstrumU/graphql-authz
//      https://www.the-guild.dev/blog/graphql-authz

@Resolver()
// alternativ: globale Aktivierung der Guards https://docs.nestjs.com/security/authorization#basic-rbac-implementation
@UseGuards(JwtAuthGraphQlGuard, RolesGraphQlGuard)
@UseInterceptors(ResponseTimeInterceptor)
export class VideospielMutationResolver {
    readonly #service: VideospielWriteService;

    readonly #logger = getLogger(VideospielMutationResolver.name);

    constructor(service: VideospielWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles('admin', 'mitarbeiter')
    async create(@Args('input') videospielDTO: VideospielCreateDTO) {
        this.#logger.debug('create: videospielDTO=%o', videospielDTO);

        const result = await this.#service.create(
            this.#dtoToVideospiel(videospielDTO),
        );
        this.#logger.debug('createVideospiel: result=%o', result);

        if (Object.prototype.hasOwnProperty.call(result, 'type')) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError(
                this.#errorMsgCreateVideospiel(result as CreateError),
            );
        }
        return result;
    }

    @Mutation()
    @Roles('admin', 'mitarbeiter')
    async update(@Args('input') videospiel: VideospielUpdateDTO) {
        this.#logger.debug('update: videospiel=%o', videospiel);
        const versionStr = `"${videospiel.version?.toString()}"`;

        const result = await this.#service.update(
            videospiel.id,
            videospiel as Videospiel,
            versionStr,
        );
        if (typeof result === 'object') {
            throw new UserInputError(this.#errorMsgUpdateVideospiel(result));
        }
        this.#logger.debug('updateVideospiel: result=%d', result);
        return result;
    }

    @Mutation()
    @Roles('admin')
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const result = await this.#service.delete(idStr);
        this.#logger.debug('deleteVideospiel: result=%s', result);
        return result;
    }

    #dtoToVideospiel(videospielDTO: VideospielCreateDTO): Videospiel {
        const videospiel: Videospiel = {
            id: undefined,
            version: undefined,
            titel: videospielDTO.titel,
            rating: videospielDTO.rating,
            platform: videospielDTO.platform,
            publisher: videospielDTO.publisher,
            preis: videospielDTO.preis,
            rabatt: videospielDTO.rabatt,
            datum: videospielDTO.datum,
            speicherplatz: videospielDTO.speicherplatz,
            homepage: videospielDTO.homepage,
            schlagwoerter: [],
            erzeugt: undefined,
            aktualisiert: undefined,
        };

        videospielDTO.schlagwoerter.forEach((s) => {
            const schlagwort: Schlagwort = {
                id: undefined,
                schlagwort: s,
                videospiel,
            };
            videospiel.schlagwoerter.push(schlagwort);
        });

        return videospiel;
    }

    #errorMsgCreateVideospiel(err: CreateError) {
        switch (err.type) {
            case 'ConstraintViolations': {
                return err.messages.join(' ');
            }
            case 'TitelExists': {
                return `Der Titel "${err.titel}" existiert bereits`;
            }
            default: {
                return 'Unbekannter Fehler';
            }
        }
    }

    #errorMsgUpdateVideospiel(err: UpdateError) {
        switch (err.type) {
            case 'ConstraintViolations': {
                return err.messages.join(' ');
            }
            case 'TitelExists': {
                return `Der Titel "${err.titel}" existiert bereits`;
            }
            case 'VideospielNotExists': {
                return `Es gibt kein Videospiel mit der ID ${err.id}`;
            }
            case 'VersionInvalid': {
                return `"${err.version}" ist keine gueltige Versionsnummer`;
            }
            case 'VersionOutdated': {
                return `Die Versionsnummer "${err.version}" ist nicht mehr aktuell`;
            }
            default: {
                return 'Unbekannter Fehler';
            }
        }
    }
}
