import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Education {

    @PrimaryGeneratedColumn({type: 'int8'})
    id: number = 0

    @Column({name: 'owner_email', type: 'text', nullable: true})
    owner_email: string = ''

    @Column('text',{nullable: true})
    country: string = ''

    @Column('text',{nullable: true})
    title: string = ''

    @Column('text',{nullable: true})
    degree: string = ''

    @Column('text',{nullable: true})
    area: string = ''

    @Column("text", {nullable: true})
    description: string = ''

    @Column('text',{name: 'from', nullable: true})
    from_year: number = 0

    @Column('text',{name: 'to', nullable: true})
    to_year: number = 0

    @Column({type: 'timestamptz'})
    created_at: Date = new Date()
}
