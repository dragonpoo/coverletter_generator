import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

@Entity()
export class Account {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email?: string

    @Column({type: 'text', nullable: true})
    email: string = ''

    @Column({type: 'int8', nullable: false})
    role: number = 0

    @Column("jsonb", { nullable: false })
    json: any
    
    @Index()
    @Column({type: 'text'})
    status: string = ''

    @Column({type: 'int8', nullable: true})
    avatar: number = 0

    @Column()
    gotmessaged: boolean = false

    @Column("text")
    lastmessage: string = ''

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()

    @Column({type: 'timestamptz', nullable: true })
    suspended_at?: Date

    running: boolean = false
    roleobj: any
}
