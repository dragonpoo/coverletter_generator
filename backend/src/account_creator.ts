import { Settings } from "./settings";
import { UPStore, socketMap } from "./store";
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ipc from 'node-ipc';
import { gsocket } from "./index";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

export async function spawnChildProcess(owner_email: string) {
  //spawn signup childs
  const cp = spawn("ts-node", [__dirname + "/child.ts", owner_email], { shell: true }); //detached: true
  
  cp.stdout.on('data', (data) => {
    gsocket.emit("log", `ACCOUNT CREATER: ${data}`);
  });
  
  cp.stderr.on('data', (data) => {
    gsocket.emit("error", `ACCOUNT CREATER: ${data}`);
  });
  
  cp.on('close', (code) => {
    gsocket.emit("log", `Account creator exited with code ${code}`);
  });
}

export function startCreatorService(owner_email: string) {
  if(UPStore.creatorService(owner_email).enabled) return;
  spawnChildProcess(owner_email);
  UPStore.creatorService(owner_email).enabled = true;
}

export function stopCreatorService(owner_email: string) {
  for(let socket of socketMap.signup) {
    if(socket.owner_email == owner_email) ipc.server.emit(socket, Settings.Constants.SIG_QUIT);
  }
  UPStore.creatorService(owner_email).enabled = false;
}