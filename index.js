import express from "express";
import connectDatabase from "./src/database/dbmongo.js";
import dotenv from "dotenv";
import cors from 'cors';

import userRoute from "./src/routes/user.route.js";
import authRoute from "./src/routes/auth.route.js";
import hydrometerRoute from "./src/routes/hydrometer.route.js";
import measurementRoute from "./src/routes/measurement.route.js"

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

// Permitir todos os domínios (não seguro para produção)
app.use(cors());

/* Ou se quiser permitir apenas alguns domínios específicos:
const whitelist = ['http://localhost:3000', 'https://outro-dominio.com'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));*/

connectDatabase();
app.use(express.json());

app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/hydrometer", hydrometerRoute);
app.use("/measurement", measurementRoute);

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
