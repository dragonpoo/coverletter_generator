import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Candidate {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email: string = ''

    @Column({type: 'text', nullable: true})
    email: string = ''

    @Column()
    exclude: boolean = false

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()
}
