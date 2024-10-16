import ipc from 'node-ipc'
import { Settings } from './settings';
import { UPStore, socketMap } from './store';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { gsocket } from './index';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

export async function spawnChildProcess(owner_email: string) {
    //spawn signup childs
    const cp = spawn("npx", ["ts-node", "\"" + __dirname + "/job_seeker.ts\"", owner_email], { shell: true }); //detached: true
    
    cp.stdout.on('data', (data) => {
      gsocket.emit("log", `JOB SEEKER: ${data}`);
    });
    
    cp.stderr.on('data', (data) => {
      gsocket.emit("error", `JOB SEEKER: ${data}`);
    });
    
    cp.on('close', (code) => {
      gsocket.emit("log", `Job seeker exited with code ${code}`);
    });
}

export function startBidderService(owner_email: string) {
    if(UPStore.bidderService(owner_email).enabled) return;
    spawnChildProcess(owner_email);
    UPStore.bidderService(owner_email).enabled = true;
}

export function stopBidderService(owner_email: string) {
    for(let socket of socketMap.job_seeker) {
        if(socket.owner_email == owner_email) ipc.server.emit(socket, Settings.Constants.SIG_QUIT);
    }
    UPStore.bidderService(owner_email).enabled = false;
}