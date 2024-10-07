import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Country {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email: string = ''

    @Column('text', {nullable: true})
    country: string = ''

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()
}