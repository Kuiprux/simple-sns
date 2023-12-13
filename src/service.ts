import DatabaseHandler from "./database";
import GoogleService from "./googleService";
import { v4 } from 'uuid';

interface ServiceResult {
    code: number,
    message: Object
}

export default class ServiceHandler {

    db: DatabaseHandler
    gs: GoogleService

    constructor() {
        this.db = new DatabaseHandler()
        this.gs = new GoogleService()
    }

    async connect() {
        await this.db.connect()
    }

    async signUp(id: string, password: string, nickname?: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}}
        let result = await this.db.addAccount(id, password, nickname)
        if (result) {
            response.message = { session_id: await this.db.createSession(result), user_id: result }
            let profileImageUUID = await this.db.getProfileImageUUID(result);
            if(profileImageUUID === null) {
                response.code = 500;
                response.message = { message: 'Failed to set up profile image' };
                return response;
            }
            await this.gs.setUpDefaultProfileImage(profileImageUUID);
        } else {
            response.code = 400
            response.message = { message: 'User already exists' }
        }
        return response
    }

    async login(id: string, password: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}}
        let result = await this.db.checkIdPassword(id, password)
        if(result) {
            response.message = { session_id: await this.db.createSession(result), user_id: result }
        } else {
            response.code = 401
            response.message = { message: 'Invalid credentials' }
        }
        return response
    }

    async logout(session_id: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}}
        if(!await this.db.checkSession(session_id)) {
            response.code = 401
            response.message = { message: 'Invalid credentials' }
        } else {
            await this.db.deleteSession(session_id)
        }
        return response
    }

    async getPostList(session_id: string, targ_user_id?: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            if(!targ_user_id) targ_user_id = user_id;
            let result = await this.db.getPostList(targ_user_id);
            let posts = [];
            for(let i = 0; i < result.length; i++) {
                posts.push({
                    user_id: result[i].user_id,
                    post_id: result[i].post_id,
                    content: result[i].content,
                    like_count: await this.db.getLikeCount(result[i].post_id),
                    is_liked: await this.db.checkLike(user_id, result[i].post_id)
                });
            }
            response.message = { posts: posts };
        }
        return response;
    }

    async getPost(session_id: string, post_id: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        if(!await this.db.checkSession(session_id)) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            let result = await this.db.getPost(post_id);
            if(result === null) {
                response.code = 404;
                response.message = { message: 'Post not found' };
            } else {
                response.message = {
                    user_id: result.user_id,
                    post_id: result.post_id,
                    content: result.content,
                    like_count: this.db.getLikeCount(result.post_id),
                    is_liked: await this.db.checkLike(result.post_id, result.user_id)
                };
            }
        }
        return response;
    }

    async writePost(session_id: string, content: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            await this.db.writePost(user_id, content);
        }
        return response;
    }

    async editPost(session_id: string, post_id: number, content: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else if(!await this.db.checkPostOwner(user_id, post_id)) {
            response.code = 403;
            response.message = { message: 'Forbidden' };
        } else {
            await this.db.editPost(post_id, content);
        }
        return response;
    }

    async deletePost(session_id: string, post_id: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else if(!await this.db.checkPostOwner(user_id, post_id)) {
            response.code = 403;
            response.message = { message: 'Forbidden' };
        } else {
            await this.db.deletePost(post_id);
        }
        return response;
    }

    async getUser(session_id: string, targ_user_id?: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            if(!targ_user_id) targ_user_id = user_id;
            let result = await this.db.getUser(targ_user_id);
            response.message = {
                user_id: result?.user_id,
                nickname: result?.nickname,
                profile_image: result?.profile_image,
                description: result?.description,
                isFollowing: await this.db.checkFollow(user_id, targ_user_id)
            };
        }
        return response;
    }

    async follow(session_id: string, targ_user_id: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        console.log(user_id, targ_user_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else if(user_id === targ_user_id) {
            response.code = 400;
            response.message = { message: 'Bad Request' };
        } else {
            await this.db.followUser(user_id, targ_user_id);
        }
        return response;
    }

    async unfollow(session_id: string, targ_user_id: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else if(user_id === targ_user_id) {
            response.code = 400;
            response.message = { message: 'Bad Request' };
        } else {
            await this.db.unfollowUser(user_id, targ_user_id);
        }
        return response;
    }

    async getFollowings(session_id: string, targ_user_id?: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            if(!targ_user_id) targ_user_id = user_id;
            let result = await this.db.getFollowTos(targ_user_id);
            let users = [];
            for(let i = 0; i < result.length; i++) {
                users.push(result[i].follow_to);
            }
            response.message = { user_ids: users };
        }
        return response;
    }

    async getFollowingsPostList(session_id: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            let result = await this.db.getFollowingsPostList(user_id);
            let posts = [];
            for(let i = 0; i < result.length; i++) {
                posts.push({
                    user_id: result[i].user_id,
                    post_id: result[i].post_id,
                    content: result[i].content,
                    like_count: await this.db.getLikeCount(result[i].post_id),
                    is_liked: await this.db.checkLike(user_id, result[i].post_id)
                });
            }
            response.message = { posts: posts };
        }
        return response;
    }

    async editUser(session_id: string, profile_image?: string, nickname?: string, description?: string, loginId?: string, loginPw?: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            //TODO remove existing profile image
            await this.db.editUser(user_id, nickname, profile_image, description, loginId, loginPw);
        }
        return response;
    }

    async searchUser(session_id: string, keyword: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id);
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            let result = await this.db.searchUser(keyword);
            let users = [];
            for(let i = 0; i < result.length; i++) {
                users.push({
                    user_id: result[i].user_id,
                    nickname: result[i].nickname,
                    profile_image: result[i].profile_image,
                    description: result[i].description,
                    isFollowing: await this.db.checkFollow(user_id, result[i].user_id)
                });
            }
            response.message = { users: users };
        }
        return response;
    }

    async like(session_id: string, post_id: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id)
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            await this.db.likePost(user_id, post_id);
        }
        response.message = { like_count: await this.db.getLikeCount(post_id) };
        return response;
    }

    async unlike(session_id: string, post_id: number): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id)
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            await this.db.unlikePost(user_id, post_id);
        }
        response.message = { like_count: await this.db.getLikeCount(post_id) };
        return response;
    }

    async setUpDefaultProfileImage(session_id: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id)
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            let newProfileImageUUID = v4();
            this.db.setProfileImageUUID(user_id, newProfileImageUUID);
            await this.gs.setUpDefaultProfileImage(newProfileImageUUID);
        }
        return response;
    }

    async uploadProfileImage(session_id: string, profile_image: string): Promise<ServiceResult> {
        let response: ServiceResult = {code: 200, message: {}};
        let user_id = await this.db.checkSession(session_id)
        if(!user_id) {
            response.code = 401;
            response.message = { message: 'Invalid credentials' };
        } else {
            let beforeProfileImageUUID = await this.db.getProfileImageUUID(user_id)
            if(beforeProfileImageUUID !== null)
                this.gs.removeFile(beforeProfileImageUUID)
            let newProfileImageUUID = v4();
            this.db.setProfileImageUUID(user_id, newProfileImageUUID);
            await this.gs.uploadFile(newProfileImageUUID, profile_image);
            response.message = { uuid: newProfileImageUUID };
        }
        return response;
    }

}