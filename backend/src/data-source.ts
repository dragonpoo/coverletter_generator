import "reflect-metadata"
import { DataSource } from "typeorm"
import { Account } from "./entity/Account"
import { Address } from "./entity/Address"
import { Bid } from "./entity/Bid"
import { Birthday } from "./entity/Birthday"
import { Candidate } from "./entity/Candidate"
import { Country } from "./entity/Country"
import { Education } from "./entity/Education"
import { Firstname } from "./entity/Firstname"
import { Job } from "./entity/Job"
import { Lastname } from "./entity/Lastname"
import { Role } from "./entity/Role"
import { Setting } from "./entity/Setting"
import { File } from "./entity/File"
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [
        Account,
        Address,
        Bid,
        Birthday,
        Candidate,
        Country,
        Education,
        File,
        Firstname,
        Job,
        Lastname,
        Role,
        Setting
    ],
    migrations: [],
    subscribers: [],
})
