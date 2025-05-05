import express from 'express';
import cors from 'cors';
import router from './routes/studentRoutes.js';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api", router);

export default app;