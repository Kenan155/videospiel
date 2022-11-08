/**
 * Das Modul enthält die Konfiguration für den Zugriff auf die DB.
 * @packageDocumentation
 */

import { Schlagwort } from '../videospiel/entity/schlagwort.entity.js';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Videospiel } from '../videospiel/entity/videospiel.entity.js';
import { env } from './env.js';
import { k8sConfig } from './kubernetes.js';
import { nodeConfig } from './node.js';

const { dbConfigEnv } = env;

// nullish coalescing
const database = dbConfigEnv.name ?? Videospiel.name.toLowerCase();
const { detected } = k8sConfig;
const dbType =
    dbConfigEnv.type === undefined || dbConfigEnv.type === 'postgres'
        ? 'postgres'
        : 'mysql';
const host = detected ? dbType : dbConfigEnv.host ?? 'localhost';
const username = dbConfigEnv.username ?? Videospiel.name.toLowerCase();
const pass = dbConfigEnv.password ?? 'p';

export const typeOrmModuleOptions: TypeOrmModuleOptions =
    dbType === 'postgres'
        ? {
              type: 'postgres',
              host,
              port: 5432,
              username,
              password: pass,
              database,
              // siehe auch src\videospiel\videospiel.module.ts
              entities: [Videospiel, Schlagwort],
              // logging durch console.log()
              logging:
                  nodeConfig.nodeEnv === 'development' ||
                  nodeConfig.nodeEnv === 'test',
              logger: 'advanced-console',
          }
        : {
              type: 'mysql',
              host,
              port: 3306,
              username,
              password: pass,
              database,
              // siehe auch src\videospiel\videospiel.module.ts
              entities: [Videospiel, Schlagwort],
              supportBigNumbers: true,
              // logging durch console.log()
              logging:
                  nodeConfig.nodeEnv === 'development' ||
                  nodeConfig.nodeEnv === 'test',
              logger: 'advanced-console',
          };

const { password, ...typeOrmModuleOptionsLog } = typeOrmModuleOptions;
console.info('typeOrmModuleOptions: %o', typeOrmModuleOptionsLog);

export const dbPopulate = dbConfigEnv.populate?.toLowerCase() === 'true';
