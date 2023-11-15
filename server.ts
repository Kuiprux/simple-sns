import express, { Application } from "express";
import apiRoute from "./src/apiRoute";

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.use(express.static("public"));

app.use("/api", apiRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});