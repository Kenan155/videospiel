/*
 * Copyright (C) 2021 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { AuthModule } from '../security/auth/auth.module.js';
import { MailModule } from '../mail/mail.module.js';
import { Module } from '@nestjs/common';
import { QueryBuilder } from './service/query-builder.js';
import { Schlagwort } from './entity/schlagwort.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Videospiel } from './entity/videospiel.entity.js';
import { VideospielGetController } from './rest/videospiel-get.controller.js';
import { VideospielMutationResolver } from './graphql/videospiel-mutation.resolver.js';
import { VideospielQueryResolver } from './graphql/videospiel-query.resolver.js';
import { VideospielReadService } from './service/videospiel-read.service.js';
import { VideospielValidationService } from './service/videospiel-validation.service.js';
import { VideospielWriteController } from './rest/videospiel-write.controller.js';
import { VideospielWriteService } from './service/videospiel-write.service.js';

/**
 * Das Modul besteht aus Controller- und Service-Klassen für die Verwaltung von
 * Videospielen.
 * @packageDocumentation
 */

/**
 * Die dekorierte Modul-Klasse mit Controller- und Service-Klassen sowie der
 * Funktionalität für TypeORM.
 */
@Module({
    imports: [
        MailModule,
        // siehe auch src\app.module.ts
        TypeOrmModule.forFeature([Videospiel, Schlagwort]),
        AuthModule,
    ],
    controllers: [VideospielGetController, VideospielWriteController],
    // Provider sind z.B. Service-Klassen fuer DI
    providers: [
        VideospielReadService,
        VideospielWriteService,
        VideospielValidationService,
        VideospielQueryResolver,
        VideospielMutationResolver,
        QueryBuilder,
    ],
    // Export der Provider fuer DI in anderen Modulen
    exports: [
        VideospielReadService,
        VideospielWriteService,
        VideospielValidationService,
    ],
})
export class VideospielModule {}
