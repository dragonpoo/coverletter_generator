import express from 'express';
// import { dirname, join } from 'path';
import path from 'path';
import router from './api/index';
import cookieParser from 'cookie-parser';
import {createServer} from 'http';
import "reflect-metadata";
const compression = require('compression');
const app = express();
const server = createServer(app); //HTTP Server running Express app
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