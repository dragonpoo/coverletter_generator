import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({name: 'jobs'})
export class Job {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email: string = ''

    @Column("text", {nullable: true})
    uid: string = ''

    @Column("text")
    title: string = ''

    @Column("text")
    description: string = ''

    @Column("text")
    skills: string = ''

    @Column("jsonb")
    data: any

    @Column()
    usonly: boolean = false

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()

    @Column({type: 'timestamptz'})
    created_on: Date = new Date()
}
