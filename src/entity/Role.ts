import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Role {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email: string = ''

    @Column("text")
    title: string = ''

    @Column("text", {name: 'hourlyRate'})
    hourlyrate: string = ''

    @Column("text")
    summary: string = ''

    @Column("text")
    pastwork: string = ''

    @Column("jsonb")
    experience: object = {}

    @Column("jsonb")
    skills: object = {}

    @Column()
    enabled: boolean = true

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()
    account_created: number = 0
    account_live: number = 0
    account_messaged: number = 0
    count: number = 0
}
