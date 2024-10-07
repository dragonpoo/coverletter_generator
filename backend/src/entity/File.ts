import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { Account } from "./Account"

@Entity()
export class File extends BaseEntity {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email: string = ''

    @Column("text", {nullable: true})
    filename: string = ''

    @Column()
    enabled: boolean = true

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()

    accounts: Account[] = []

    account_created: number = 0
    account_messaged: number = 0
    count: number = 0
}
