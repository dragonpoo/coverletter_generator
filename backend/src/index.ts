import { AppDataSource } from "./data-source"
import ipc from 'node-ipc'
import express from 'express';
// import { dirname, join } from 'path';
import path from 'path';
import { UPStore, socketMap } from './store';
import { Settings } from './settings';
import router from './api/index';
import { spawnChildProcess } from './account_creator';
import cookieParser from 'cookie-parser';
import { measureEnd, msleep } from './utils';
import { Server } from 'socket.io';
import {createServer} from 'http';
import "reflect-metadata";
import { Account } from "./entity/Account";
import { Candidate } from "./entity/Candidate";
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
const compression = require('compression');
// process.env['webdriver.chrome.driver'] = path.resolve(__dirname, 'chromedriver.exe')
export let gsocket: any = null;
let driver: any = null;

AppDataSource.initialize().then(async () => {
    console.log("DB Connected.");
    await runUpworkBrowser();

    const app = express();
    const server = createServer(app); //HTTP Server running Express app
    gsocket = new Server(server);   //Socket.IO server linked to HTTP server
    const port = 80;

    app.use(cookieParser());
    app.use(compression());
    app.use('/', express.static(path.join(__dirname, 'public'), {
        setHeaders: function (res, path, stat) {
            res.set('Cache-Control', 'no-store')
        }
    }));
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use(express.json());
    app.use(router);

    server.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`)
    });

    gsocket.on('connection', (socket: any) => {
        console.log('New client connected');
        
        socket.on('chat message', (msg: any) => {
            gsocket.emit('chat message', msg);
        });
        
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    ipc.config.id   = 'server';
    ipc.config.retry= 1500;
    ipc.config.logger = () => {};
    let newSocketID = 0;
    ipc.serve(
        function(){
            ipc.server.on(
                Settings.Constants.SIGS_MESSAGE,
                function(data: any, socket: any){
                    ipc.server.broadcast(
                        Settings.Constants.SIGS_MESSAGE,
                        data
                    );
                }
            );
            ipc.server.on(
            Settings.Constants.SIGS_CONNECT,
            async function(socket) {
            }
            );
            ipc.server.on(
            Settings.Constants.SIG_TYPE,
            async function(data: any, socket: any) {

                socket.socketID = ++newSocketID;
                socket.type = data.type;
                socket.owner_email = data.owner_email;
                gsocket.emit("log", `${data.type} socket connected : #${newSocketID}`);

                if(data.type == Settings.Constants.PROC_TYPE_SIGNUP) {
                const profileData = await Settings.ProfileData.generateNewProfile(socket.owner_email);
                if(profileData && profileData.email) {
                    ipc.server.emit(socket, Settings.Constants.SIG_START_SIGNUP, {profileData: profileData} );
                    socket.email = profileData.email;
                    socket.profileData = profileData;
                    socketMap.signup.push(socket);
                } else {
                    ipc.server.emit(socket, Settings.Constants.SIG_QUIT);
                    UPStore.creatorService(socket.owner_email).enabled = false;
                }
                } else if(data.type == Settings.Constants.PROC_TYPE_JOB_SEEKER) {
                ipc.server.emit(socket, Settings.Constants.SIG_START_JOBSEEK);
                socketMap.job_seeker.push(socket);
                } else {
                //Unknown Socket
                socketMap.unknown.push(socket);
                }
            }
            );
            ipc.server.on(
            Settings.Constants.SIGS_DISCONNECTED,
            function(socket: any, destroyedSocketID: number) {
                let idx = socketMap.signup.findIndex(value => value == socket);
                idx!=-1 && socketMap.signup.splice(idx, 1);
                idx = socketMap.email.findIndex(value => value == socket);
                idx!=-1 && socketMap.email.splice(idx, 1);
                idx = socketMap.job_seeker.findIndex(value => value == socket);
                idx!=-1 && socketMap.job_seeker.splice(idx, 1);
                idx = socketMap.unknown.findIndex(value => value == socket);
                idx!=-1 && socketMap.unknown.splice(idx, 1);
                gsocket.emit("log", `${socket.type} socket disconnected: #${socket.socketID}`);
            }
            );
            ipc.server.on(
            Settings.Constants.SIG_VERIFICATION_SENT,
            async function(data: any, socket: any) {
                const profileData = socket.profileData;
                let newwacc = new Account();
                newwacc.email = profileData.email;
                newwacc.owner_email = socket.owner_email;
                newwacc.avatar = profileData.avatarID;
                newwacc.status = Settings.Constants.STATUS_VERIFY_MAIL_SENT;
                newwacc.json = profileData;
                newwacc.role = profileData.roleID;
                await AppDataSource.getRepository(Account).save(newwacc);
                await AppDataSource.getRepository(Candidate).delete({email: profileData.email})
                const acc = await AppDataSource.getRepository(Account).findOne({where: {email: socket.email}});
                if(acc) {
                    acc.status = Settings.Constants.STATUS_VERIFY_MAIL_SENT;
                    await AppDataSource.getRepository(Account).save(acc as Account);
                    gsocket.emit("log", "ACCOUNT CREATER: ---- Update Status VERIFY MAIL SENT");
                }
            }
            );
            ipc.server.on(
                Settings.Constants.SIG_ACCOUNT_CREATED,
                async function(succeed: boolean, socket: any) {
                    if(succeed) {
                        const acc = await AppDataSource.getRepository(Account).findOne({where: {email: socket.email}});
                        if(acc) {
                            acc.status = Settings.Constants.STATUS_COMPLETED;
                            await AppDataSource.getRepository(Account).save(acc as Account);
                            gsocket.emit("log", "ACCOUNT CREATER: ---- Update Status Completed");
                        }
                    }
                    measureEnd(socket.owner_email, "ACCOUNT_CREATION");
                    spawnChildProcess(socket.owner_email);
                }
            );
        }
    );

    ipc.server.start();

}).catch(error => console.log(error))


async function runUpworkBrowser() {
    let options = new Options();
    //options.headless();
    // options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'); // set User-Agent
    options.setChromeBinaryPath(path.resolve(__dirname, '../../chrome-win64/chrome.exe'));
    // options.addArguments('--no-sandbox');
    // options.addArguments("user-data-dir=user_data/job_seeker");
    // options.addArguments("proxy-server=http://begintrust.com:808");
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    driver.manage().window().setRect({x:1000, y:0, width: 1250, height: 1000});
    await driver.get('https://upwork.com/signup');
};

export const getMainBrowser = function() {
    return driver;
}