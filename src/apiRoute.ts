const express = require('express');
import { Request, Response, NextFunction } from "express";
const router = express.Router();
import { service } from '../server';

router.use(function timeLog(req: Request, res: Response, next: NextFunction): void {
  console.log('Time: ', Date.now());
  console.log('RequestHeader: ', JSON.stringify(req.headers));
  console.log('RequestURL: ', req.originalUrl);
  console.log('RequestQuery: ', JSON.stringify(req.query));
  console.log('RequestBody: ', JSON.stringify(req.body));
  next();
});

/*REST API
1.	회원가입 요청 (POST)
2.	로그인 요청 (POST)
3.	게시글 작성/수정/제거 요청 (POST/PUT/DELETE)
4.	글 목록 요청 (GET)
5.	검색 요청 (GET)
6.	사용자 정보 요청 (GET)
7.	팔로우/언팔로우 (POST)
8.	좋아요/좋아요 취소 요청 (GET)
*/

// 1. 회원가입 요청 (POST)
router.post('/signup', async function(req: Request, res: Response) {
  console.log(JSON.stringify(req.body));
  if(!req.body || !req.body.id || !req.body.password) {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.signUp(req.body.id, req.body.password, req.body.nickname);
  res.status(result.code).json(result.message);
});

// 2. 로그인 요청 (POST)
router.post('/login', async function(req: Request, res: Response) {
  if(!req.body || !req.body.id || !req.body.password) {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.login(req.body.id, req.body.password);
  res.status(result.code).json(result.message);
});

//로그아웃
router.post('/logout', async function(req: Request, res: Response) {
  if(!req.body || !req.headers['session-id'] || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.logout(req.headers['session-id']);
  res.status(result.code).json(result.message);
});

// 3. 게시글 작성/수정/제거 요청 (POST/PUT/DELETE)
router.post('/posts', async function(req: Request, res: Response) {
  if(!req.body || !req.headers['session-id'] || !req.body.content || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.writePost(req.headers['session-id'], req.body.content);
  res.status(result.code).json(result.message);
});
router.put('/posts/:id', async function(req: Request, res: Response) {
  if(!req.body || !req.headers['session-id'] || !req.body.content || !req.params.id || isNaN(Number(req.params.id)) || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }
  
  let result = await service.editPost(req.headers['session-id'], parseInt(req.params.id), req.body.content);
  res.status(result.code).json(result.message);
});
router.delete('/posts/:id', async function(req: Request, res: Response) {
  if(!req.body || !req.headers['session-id'] || !req.params.id || isNaN(Number(req.params.id)) || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }
  
  let result = await service.deletePost(req.headers['session-id'], parseInt(req.params.id));
  res.status(result.code).json(result.message);
});

// 4. 글 목록 요청 (GET)
router.get('/posts/user/:id?', async function(req: Request, res: Response) {
  if(!req.query || !req.headers['session-id'] || typeof req.headers['session-id'] !== 'string' || req.params.id && isNaN(Number(req.params.id))) {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  if(!req.params.id) {
    let result = await service.getPostList(req.headers['session-id']);
    res.status(result.code).json(result.message);
    return;
  }
  
  let result = await service.getPostList(req.headers['session-id'], parseInt(req.params.id));
  res.status(result.code).json(result.message);
});
//팔로우한 사람들의 글 목록 요청
router.get('/posts/followings', async function(req: Request, res: Response) {
  if(!req.query || !req.headers['session-id'] || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.getFollowingsPostList(req.headers['session-id']);
  res.status(result.code).json(result.message);
});

// 5. 검색 요청 (GET)
router.get('/users/search', async function(req: Request, res: Response) {
  if(!req.query || !req.headers['session-id'] || !req.query.keyword || typeof req.headers['session-id'] !== 'string' || typeof req.query.keyword !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.searchUser(req.headers['session-id'], req.query.keyword);
  res.status(result.code).json(result.message);
})

// 6. 사용자 정보 요청 (GET)
router.get('/users/:id?', async function(req: Request, res: Response) {
  if(!req.query || !req.headers['session-id'] || typeof req.headers['session-id'] !== 'string' || req.params.id && isNaN(Number(req.params.id))) {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  if(!req.params.id) {
    let result = await service.getUser(req.headers['session-id']);
    res.status(result.code).json(result.message);
    return;
  }
  
  let result = await service.getUser(req.headers['session-id'], parseInt(req.params.id));
  res.status(result.code).json(result.message);
});

// 7. 팔로우/언팔로우 (POST)
router.post('/followings/:id', async function(req: Request, res: Response) {
  if(!req.headers['session-id'] || !req.params.id || isNaN(Number(req.params.id)) || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.follow(req.headers['session-id'], parseInt(req.params.id));
  res.status(result.code).json(result.message);
});
router.delete('/followings/:id', async function(req: Request, res: Response) {
  if(!req.headers['session-id'] || !req.params.id || isNaN(Number(req.params.id)) || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.unfollow(req.headers['session-id'], parseInt(req.params.id));
  res.status(result.code).json(result.message);
});
router.get('/followings', async function(req: Request, res: Response) {
  if(!req.query || !req.headers['session-id'] || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.getFollowings(req.headers['session-id']);
  res.status(result.code).json(result.message);
});

// 8. 좋아요/좋아요 취소 요청 (GET)
router.post('/posts/:postid/likes', async function(req: Request, res: Response) {
  if(!req.headers['session-id'] || !req.params.postid || isNaN(Number(req.params.postid)) || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.like(req.headers['session-id'], parseInt(req.params.postid));
  res.status(result.code).json(result.message);
});

router.delete('/posts/:postid/likes', async function(req: Request, res: Response) {
  if(!req.headers['session-id'] || !req.params.postid || isNaN(Number(req.params.postid)) || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.unlike(req.headers['session-id'], parseInt(req.params.postid));
  res.status(result.code).json(result.message);
});

//계정 세부 정보 설정(프로필 사진, 닉네임, 자기소개)
router.put('/users', async function(req: Request, res: Response) {
  if(!req.body || !req.headers['session-id'] || typeof req.headers['session-id'] !== 'string') {
    res.status(400).json({error: 'Bad Request'});
    return;
  }

  let result = await service.editUser(req.headers['session-id'], req.body.profile_image, req.body.nickname, req.body.description, req.body.login_id, req.body.password);
  res.status(result.code).json(result.message);
});


export default router;