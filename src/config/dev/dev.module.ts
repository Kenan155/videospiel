import { AuthModule } from '../../security/auth/auth.module.js';
import { DbPopulateController } from './db-populate.controller.js';
import { DbPopulateService } from './db-populate.service.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Videospiel } from '../../videospiel/entity/videospiel.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Videospiel]), AuthModule],
    controllers: [DbPopulateController],
    providers: [DbPopulateService],
    exports: [DbPopulateService],
})
export class DevModule {}
