import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm"
import { Job } from "./Job"
import { Account } from "./Account"

@Entity()
export class Bid {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({type: 'text', nullable: true})
    email: string = ''

    @Column({nullable: true, type: 'int8'})
    job: number = 0

    @Column("text")
    letter: string = ''

    @Column("jsonb")
    answers: object = {}
    
    @Column()
    boosted: boolean = false

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()

    jobobj?: Job;
    emailobj?: Account;
}
