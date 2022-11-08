import {
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
import { ApolloDriver } from '@nestjs/apollo';
import { AuthModule } from './security/auth/auth.module.js';
import { DevModule } from './config/dev/dev.module.js';
import { GraphQLModule } from '@nestjs/graphql';
import { HealthModule } from './health/health.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { RequestLoggerMiddleware } from './logger/request-logger.middleware.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideospielGetController } from './videospiel/rest/videospiel-get.controller.js';
import { VideospielModule } from './videospiel/videospiel.module.js';
import { VideospielWriteController } from './videospiel/rest/videospiel-write.controller.js';
import { graphQlConfig } from './config/graphql.js';
import { typeOrmModuleOptions } from './config/db.js';

@Module({
    imports: [
        AuthModule,
        VideospielModule,
        DevModule,
        GraphQLModule.forRoot({
            typePaths: ['./**/*.graphql'],
            // alternativ: Mercurius (statt Apollo) fuer Fastify (statt Express)
            driver: ApolloDriver,
            debug: graphQlConfig.debug,
        }),
        LoggerModule,
        HealthModule,
        TypeOrmModule.forRoot(typeOrmModuleOptions),
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes(
                VideospielGetController,
                VideospielWriteController,
                'auth',
                'graphql',
            );
    }
}
