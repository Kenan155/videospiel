import { type User } from '../../security/auth/service/user.service.js';
import { env } from '../env.js';

const { password } = env.authConfigEnv;

/**
 * Ein JSON-Array der Benutzerdaten mit den vorhandenen Rollen.
 * Nicht Set, weil es dafür keine Suchfunktion gibt.
 */
export const users: User[] = [
    {
        userId: 1,
        username: 'admin',
        password,
        email: 'admin@acme.com',
        roles: ['admin', 'mitarbeiter'],
    },
    {
        userId: 2,
        username: 'adriana.alpha',
        password,
        email: 'adriana.alpha@acme.com',
        roles: ['admin', 'mitarbeiter'],
    },
    {
        userId: 3,
        username: 'alfred.alpha',
        password,
        email: 'alfred.alpha@acme.com',
        roles: ['mitarbeiter'],
    },
    {
        userId: 4,
        username: 'antonia.alpha',
        password,
        email: 'antonia.alpha@acme.com',
        roles: ['mitarbeiter'],
    },
    {
        userId: 5,
        username: 'dirk.delta',
        password,
        email: 'dirk.delta@acme.com',
        roles: ['kunde'],
    },
    {
        userId: 6,
        username: 'emilia.epsilon',
        password,
        email: 'emilia.epsilon@acme.com',
        roles: ['kunde'],
    },
];
