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
