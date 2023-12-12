import express, { Application, NextFunction } from "express";
import apiRoute from "./src/apiRoute";
import uploadRoute from "./src/uploadRoute";
import bodyParser from "body-parser";

import ServiceHandler from "./src/service";
const service = new ServiceHandler();

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.use(express.static("public"));
app.use("/api", bodyParser.urlencoded({ extended: false }))

app.use("/api", apiRoute);

app.use("/upload", uploadRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});

export { app, service };