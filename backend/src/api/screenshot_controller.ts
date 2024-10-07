import sharp = require("sharp");
import { getScreenshot } from "../email_checker";
import { Settings } from "../settings";
import { getJobSeekerSocketByOwnerEmail, getSignUpSocketByEmail, getSignUpSocketByOwnerEmail, socketMap } from "../store";
import ipc from 'node-ipc'

const account = (req: any, res: any) => {
    const width = parseInt(req.params.width || '1000');
    const height = parseInt(req.params.height || '1000');
    const socket = getSignUpSocketByEmail(req.params.email);
    if(socket) {
        ipc.server.off(Settings.Constants.SIG_SCREENSHOT_REPLY, undefined);
        ipc.server.on(
            Settings.Constants.SIG_SCREENSHOT_REPLY, 
            function(b64_image: string, socket: any) {
                var buf = Buffer.from(b64_image, 'base64');
                sharp(buf)
                .resize(width, height, { fit: 'contain' })
                .toBuffer()
                .then(resizedImageBuffer => {
                    res.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': resizedImageBuffer.length
                    });
                    res.end(resizedImageBuffer); 
                })
                .catch(error => {
                    // error handeling
                    res.send(error)
                })
            }
            );
            ipc.server.emit(socket, Settings.Constants.SIG_SCREENSHOT, { width, height });
        }
        else res.send('No child running!');
}
const creator = (req: any, res: any) => {
    const width = parseInt(req.params.width || '1000');
    const height = parseInt(req.params.height || '1000');
    const socket = getSignUpSocketByOwnerEmail(req.cookies.email);
    if(socket) {
        ipc.server.off(Settings.Constants.SIG_SCREENSHOT_REPLY, undefined);
        ipc.server.on(
            Settings.Constants.SIG_SCREENSHOT_REPLY, 
            function(b64_image: string, socket: any) {
                var buf = Buffer.from(b64_image, 'base64');
                sharp(buf)
                .resize(width, height, { fit: 'contain' })
                .toBuffer()
                .then(resizedImageBuffer => {
                    res.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': resizedImageBuffer.length
                    });
                    res.end(resizedImageBuffer); 
                })
                .catch(error => {
                    // error handeling
                    res.send(error)
                })
            }
        );
        ipc.server.emit(socket, Settings.Constants.SIG_SCREENSHOT, { width, height });
    }
    else res.send('No child running!');
}
const bidder = (req: any, res: any) => {
    const width = parseInt(req.params.width || '1000');
    const height = parseInt(req.params.height || '1000');
    const socket = getJobSeekerSocketByOwnerEmail(req.cookies.email);
    if(socket) {
        ipc.server.off(Settings.Constants.SIG_SCREENSHOT_REPLY, undefined);
        ipc.server.on(
            Settings.Constants.SIG_SCREENSHOT_REPLY, 
            function(b64_image: string, socket: any) {
                var buf = Buffer.from(b64_image, 'base64');
                sharp(buf)
                .resize(width, height, { fit: 'contain' })
                .toBuffer()
                .then(resizedImageBuffer => {
                    res.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': resizedImageBuffer.length
                    });
                    res.end(resizedImageBuffer); 
                })
                .catch(error => {
                    // error handeling
                    res.send(error)
                })
            }
        );
        ipc.server.emit(socket, Settings.Constants.SIG_SCREENSHOT, { width, height });
    }
    else res.send('No child running!');
}
const email = (req: any, res: any) => {
    const width = parseInt(req.params.width || '1000');
    const height = parseInt(req.params.height || '1000');
    getScreenshot(req.cookies.email, (b64_image: string) => {
        var buf = Buffer.from(b64_image, 'base64');
        sharp(buf)
        .resize(width, height, { fit: 'contain' })
        .toBuffer()
        .then(resizedImageBuffer => {
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': resizedImageBuffer.length
            });
            res.end(resizedImageBuffer); 
        })
        .catch(error => {
            // error handeling
            res.send(error)
        })
    });
}

export default {account, creator, email, bidder}