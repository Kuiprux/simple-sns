const express = require('express');
import { NextFunction, Request, Response } from 'express';
const router = express.Router();
import { service } from '../server';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(function timeLog(req: Request, res: Response, next: NextFunction): void {
    console.log('Time: ', Date.now());
    console.log('RequestHeader: ', JSON.stringify(req.headers));
    console.log('RequestURL: ', req.originalUrl);
    console.log('RequestQuery: ', JSON.stringify(req.query));
    console.log('RequestBody: ', JSON.stringify(req.body));
    next();
  });

interface MulterRequest extends Request {
    file: any;
}

router.post('/users/profile-image', upload.single('image'), async (req: MulterRequest, res: Response) => {
    console.log('RequestFile: ', JSON.stringify(req.file))
    if (!req.file || !req.headers['session-id'] || typeof req.headers['session-id'] !== 'string') {
        res.status(400).json({ error: 'Bad Request' });
        return;
    }
    try {
        let result = await service.uploadProfileImage(req.headers['session-id'], req.file);

        res.status(result.code).json(result.message);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to upload profile image' });
    }
});

export default router;