/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Videospiel } from './videospiel.entity.js';

/**
 * Entity-Klasse zu einem relationalen Tabelle
 */
@Entity()
export class Schlagwort {
    @Column('char')
    @PrimaryColumn('uuid')
    id: string | undefined;

    // https://typeorm.io/many-to-one-one-to-many-relations
    @ManyToOne(() => Videospiel, (videospiel) => videospiel.schlagwoerter)
    // https://typeorm.io/relations#joincolumn-options
    @JoinColumn({ name: 'videospiel_id' })
    readonly videospiel: Videospiel | null | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'Das Schlagwort', type: String })
    readonly schlagwort: string | null | undefined; //NOSONAR
}
