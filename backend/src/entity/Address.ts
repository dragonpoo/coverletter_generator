import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Address {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email: string = ''

    @Column('text', {nullable: true})
    country: string = ''

    @Column('text', {nullable: true})
    city: string = ''

    @Column('text', {nullable: true})
    street: string = ''
    
    @Column('text', {nullable: true})
    zip: string = ''

    @Column('text', {nullable: true})
    phone: string = ''

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()
}
