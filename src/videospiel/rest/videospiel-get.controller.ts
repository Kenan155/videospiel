/* eslint-disable max-lines */

/**
 * Das Modul besteht aus der Controller-Klasse für Lesen an der REST-Schnittstelle.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import {
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiProperty,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Controller,
    Get,
    Headers,
    HttpStatus,
    Param,
    Query,
    Req,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import {
    type Platform,
    type Publisher,
    type Videospiel,
} from '../entity/videospiel.entity.js';
import { Request, Response } from 'express';
import {
    type Suchkriterien,
    VideospielReadService,
} from '../service/videospiel-read.service.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';

// TypeScript
interface Link {
    href: string;
}
interface Links {
    self: Link;
    // optional
    list?: Link;
    add?: Link;
    update?: Link;
    remove?: Link;
}

// Interface fuer GET-Request mit Links fuer HATEOAS
export type VideospielModel = Omit<
    Videospiel,
    'aktualisiert' | 'erzeugt' | 'id' | 'schlagwoerter' | 'version'
> & {
    schlagwoerter: string[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _links: Links;
};

export interface VideospieleModel {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _embedded: {
        videospiele: VideospielModel[];
    };
}

/**
 * Klasse für `VideospielGetController`, um Queries in _OpenAPI_ bzw. Swagger zu
 * formulieren. `VideospielController` hat dieselben Properties wie die Basisklasse
 * `Videospiel` - allerdings mit dem Unterschied, dass diese Properties beim Ableiten
 * so überschrieben sind, dass sie auch nicht gesetzt bzw. undefined sein
 * dürfen, damit die Queries flexibel formuliert werden können. Deshalb ist auch
 * immer der zusätzliche Typ undefined erforderlich.
 * Außerdem muss noch `string` statt `Date` verwendet werden, weil es in OpenAPI
 * den Typ Date nicht gibt.
 */
export class VideospielQuery implements Suchkriterien {
    @ApiProperty({ required: false })
    declare readonly titel: string;

    @ApiProperty({ required: false })
    declare readonly rating: number;

    @ApiProperty({ required: false })
    declare readonly art: Platform;

    @ApiProperty({ required: false })
    declare readonly verlag: Publisher;

    @ApiProperty({ required: false })
    declare readonly preis: number;

    @ApiProperty({ required: false })
    declare readonly rabatt: number;

    @ApiProperty({ required: false })
    declare readonly lieferbar: boolean;

    @ApiProperty({ required: false })
    declare readonly datum: string;

    @ApiProperty({ required: false })
    declare readonly isbn: string;

    @ApiProperty({ required: false })
    declare readonly homepage: string;

    @ApiProperty({ required: false })
    declare readonly javascript: boolean;

    @ApiProperty({ required: false })
    declare readonly typescript: boolean;
}

/**
 * Die Controller-Klasse für die Verwaltung von Videospielen.
 */
// Decorator in TypeScript, zur Standardisierung in ES vorgeschlagen (stage 3)
// https://github.com/tc39/proposal-decorators
@Controller()
// @UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Videospiel API')
// @ApiBearerAuth()
// Klassen ab ES 2015
export class VideospielGetController {
    // readonly in TypeScript, vgl. C#
    // private ab ES 2019
    readonly #service: VideospielReadService;

    readonly #logger = getLogger(VideospielGetController.name);

    // Dependency Injection (DI) bzw. Constructor Injection
    // constructor(private readonly service: VideospielReadService) {}
    constructor(service: VideospielReadService) {
        this.#service = service;
    }

    /**
     * Ein Videospiel wird asynchron anhand seiner ID als Pfadparameter gesucht.
     *
     * Falls es ein solches Videospiel gibt und `If-None-Match` im Request-Header
     * auf die aktuelle Version des Videospiels gesetzt war, wird der Statuscode
     * `304` (`Not Modified`) zurückgeliefert. Falls `If-None-Match` nicht
     * gesetzt ist oder eine veraltete Version enthält, wird das gefundene
     * Videospiel im Rumpf des Response als JSON-Datensatz mit Atom-Links für HATEOAS
     * und dem Statuscode `200` (`OK`) zurückgeliefert.
     *
     * Falls es kein Videospiel zur angegebenen ID gibt, wird der Statuscode `404`
     * (`Not Found`) zurückgeliefert.
     *
     * @param id Pfad-Parameter `id`
     * @param req Request-Objekt von Express mit Pfadparameter, Query-String,
     *            Request-Header und Request-Body.
     * @param version Versionsnummer im Request-Header bei `If-None-Match`
     * @param accept Content-Type bzw. MIME-Type
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // vgl Kotlin: Schluesselwort "suspend"
    // eslint-disable-next-line max-params, max-lines-per-function
    @Get(':id')
    @ApiOperation({ summary: 'Suche mit der Videospiel-ID', tags: ['Suchen'] })
    @ApiParam({
        name: 'id',
        description: 'Z.B. 00000000-0000-0000-0000-000000000001',
    })
    @ApiHeader({
        name: 'If-None-Match',
        description: 'Header für bedingte GET-Requests, z.B. "0"',
        required: false,
    })
    @ApiOkResponse({ description: 'Das Videospiel wurde gefunden' })
    @ApiNotFoundResponse({ description: 'Kein Videospiel zur ID gefunden' })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Das Videospiel wurde bereits heruntergeladen',
    })
    async findById(
        @Param('id') id: string,
        @Req() req: Request,
        @Headers('If-None-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response<VideospielModel | undefined>> {
        this.#logger.debug('findById: id=%s, version=%s"', id, version);

        if (req.accepts(['json', 'html']) === false) {
            this.#logger.debug('findById: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        let videospiel: Videospiel | undefined;
        try {
            // vgl. Kotlin: Aufruf einer suspend-Function
            videospiel = await this.#service.findById(id);
        } catch (err) {
            // err ist implizit vom Typ "unknown", d.h. keine Operationen koennen ausgefuehrt werden
            // Exception einer export async function bei der Ausfuehrung fangen:
            // https://strongloop.com/strongblog/comparing-node-js-promises-trycatch-zone-js-angular
            this.#logger.error('findById: error=%o', err);
            return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (videospiel === undefined) {
            this.#logger.debug('findById: NOT_FOUND');
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }
        this.#logger.debug('findById(): videospiel=%o', videospiel);

        // ETags
        const versionDb = videospiel.version;
        if (version === `"${versionDb}"`) {
            this.#logger.debug('findById: NOT_MODIFIED');
            return res.sendStatus(HttpStatus.NOT_MODIFIED);
        }
        this.#logger.debug('findById: versionDb=%s', versionDb);
        res.header('ETag', `"${versionDb}"`);

        // HATEOAS mit Atom Links und HAL (= Hypertext Application Language)
        const videospielModel = this.#toModel(videospiel, req);
        this.#logger.debug('findById: videospielModel=%o', videospielModel);
        return res.json(videospielModel);
    }

    /**
     * Videospielen werden mit Query-Parametern asynchron gesucht. Falls es mindestens
     * ein solches Videospiel gibt, wird der Statuscode `200` (`OK`) gesetzt. Im Rumpf
     * des Response ist das JSON-Array mit den gefundenen Videospielen, die jeweils
     * um Atom-Links für HATEOAS ergänzt sind.
     *
     * Falls es kein Videospiel zu den Suchkriterien gibt, wird der Statuscode `404`
     * (`Not Found`) gesetzt.
     *
     * Falls es keine Query-Parameter gibt, werden alle Videospielen ermittelt.
     *
     * @param query Query-Parameter von Express.
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Get()
    @ApiOperation({ summary: 'Suche mit Suchkriterien', tags: ['Suchen'] })
    @ApiOkResponse({ description: 'Eine evtl. leere Liste mit Videospielen' })
    async find(
        @Query() query: VideospielQuery,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<VideospieleModel | undefined>> {
        this.#logger.debug('find: query=%o', query);

        if (req.accepts(['json', 'html']) === false) {
            this.#logger.debug('find: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const videospiele = await this.#service.find(query);
        this.#logger.debug('find: %o', videospiele);
        if (videospiele.length === 0) {
            this.#logger.debug('find: NOT_FOUND');
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }

        // HATEOAS: Atom Links je Videospiel
        const videospieleModel = videospiele.map((videospiel) =>
            this.#toModel(videospiel, req, false),
        );
        this.#logger.debug('find: videospieleModel=%o', videospieleModel);

        const result: VideospieleModel = {
            _embedded: { videospiele: videospieleModel },
        };
        return res.json(result).send();
    }

    #toModel(videospiel: Videospiel, req: Request, all = true) {
        const baseUri = getBaseUri(req);
        this.#logger.debug('#toModel: baseUri=%s', baseUri);
        const { id } = videospiel;
        const schlagwoerter = videospiel.schlagwoerter.map(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (schlagwort) => schlagwort.schlagwort!,
        );
        const links = all
            ? {
                  self: { href: `${baseUri}/${id}` },
                  list: { href: `${baseUri}` },
                  add: { href: `${baseUri}` },
                  update: { href: `${baseUri}/${id}` },
                  remove: { href: `${baseUri}/${id}` },
              }
            : { self: { href: `${baseUri}/${id}` } };

        this.#logger.debug(
            '#toModel: videospiel=%o, links=%o',
            videospiel,
            links,
        );
        /* eslint-disable unicorn/consistent-destructuring */
        const videospielModel: VideospielModel = {
            titel: videospiel.titel,
            rating: videospiel.rating,
            platform: videospiel.platform,
            publisher: videospiel.publisher,
            preis: videospiel.preis,
            rabatt: videospiel.rabatt,
            datum: videospiel.datum,
            speicherplatz: videospiel.speicherplatz,
            homepage: videospiel.homepage,
            schlagwoerter,
            _links: links,
        };
        /* eslint-enable unicorn/consistent-destructuring */

        return videospielModel;
    }
}
/* eslint-enable max-lines */
