var express = require('express');
import { Request, Response, NextFunction } from "express";
var router = express.Router();

router.use(function timeLog(req: Request, res: Response, next: NextFunction) {
  console.log('Time: ', Date.now());
  next();
});

router.get('/', function(req: Request, res: Response) {
  res.send('Hello, World!');
});

export default router;