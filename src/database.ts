import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

export default class DatabaseHandler {
    
    prisma: PrismaClient

    constructor() {
        this.prisma = new PrismaClient()
    }

    hashPassword(password: string) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    async connect() {
        await this.prisma.$connect()
    }

    //encrypt password with sha-256 (not salted)
    async addAccount(id: string, password: string, nickname?: string) {
        try {
            await this.prisma.user.create({
                data: {
                    login_id: id,
                    hashed_password: this.hashPassword(password),
                    nickname: nickname
                }
            })
        } catch (e) {
            console.log("error")
            console.log(e)
            return null;
        }

        const user = await this.prisma.user.findUnique({
            where: {
                login_id: id
            }
        })
        if (user === null) {
            return null;
        }
        return user.user_id;
    }

    async editUser(user_id: number, nickname?: string, profile_image?: string, description?: string, login_id?: string, password?: string) {
        await this.prisma.user.update({
            where: {
                user_id: user_id
            },
            data: {
                nickname: nickname,
                profile_image: profile_image,
                description: description,
                login_id: login_id,
                hashed_password: password === undefined ? undefined : this.hashPassword(password)
            }
        })
    }

    async checkIdPassword(id: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                login_id: id
            }
        })
        if (user === null) {
            return null;
        }
        if (user.hashed_password === this.hashPassword(password)) {
            return user.user_id;
        }
        return null;
    }

    async getPostList(user_id: number) {
        return await this.prisma.post.findMany({
            where: {
                user_id: user_id
            },
            orderBy: {
                time: 'desc'
            }
        })
    }

    async getPost(post_id: number) {
        return await this.prisma.post.findUnique({
            where: {
                post_id: post_id
            }
        })
    }

    async checkPostOwner(user_id: number, post_id: number) {
        const post = await this.prisma.post.findUnique({
            where: {
                post_id: post_id
            }
        })
        if (post === null) {
            return false
        }
        if (post.user_id === user_id) {
            return true
        }
        return false
    }

    async writePost(user_id: number, content: string) {
        await this.prisma.post.create({
            data: {
                user_id: user_id,
                content: content,
                time: new Date()
            }
        })
    }

    async editPost(post_id: number, content: string) {
        await this.prisma.post.update({
            where: {
                post_id: post_id
            },
            data: {
                content: content
            }
        })
    }

    async deletePost(id: number) {
        await this.prisma.post.delete({
            where: {
                post_id: id
            }
        })
    }

    async searchPost(keyword: string) {
        return await this.prisma.post.findMany({
            where: {
                OR: [
                    {
                        content: {
                            contains: keyword
                        }
                    }
                ]
            },
            orderBy: {
                time: 'desc'
            }
        })
    }

    async getUser(id: number) {
        return await this.prisma.user.findUnique({
            where: {
                user_id: id
            }
        })
    }

    async followUser(follow_from: number, follow_to: number) {
        console.log(typeof follow_from, typeof follow_to)
        await this.prisma.follow.create({
            data: {
                follow_from: follow_from,
                follow_to: follow_to
            }
        })
    }

    async unfollowUser(follow_from: number, follow_to: number) {
        console.log(follow_from, follow_to)
        await this.prisma.follow.delete({
            where: {
                follow_from_follow_to: {
                    follow_from: follow_from,
                    follow_to: follow_to
                }
            }
        })
    }

    async getFollowFroms(follow_to: number) {
        return await this.prisma.follow.findMany({
            where: {
                follow_to: follow_to
            }
        })
    }

    async getFollowTos(follow_from: number) {
        return await this.prisma.follow.findMany({
            where: {
                follow_from: follow_from
            }
        })
    }

    async checkFollow(follow_from: number, follow_to: number) {
        const follow = await this.prisma.follow.findUnique({
            where: {
                follow_from_follow_to: {
                    follow_from: follow_from,
                    follow_to: follow_to
                }
            }
        })
        if (follow === null) {
            return false
        }
        return true
    }

    async likePost(user_id: number, post_id: number) {
        await this.prisma.likePost.create({
            data: {
                user_id: user_id,
                post_id: post_id
            }
        })
    }

    async unlikePost(user_id: number, post_id: number) {
        await this.prisma.likePost.delete({
            where: {
                user_id_post_id: {
                    user_id: user_id,
                    post_id: post_id
                }
            }
        })
    }

    async checkLike(user_id: number, post_id: number) {
        const like = await this.prisma.likePost.findUnique({
            where: {
                user_id_post_id: {
                    user_id: user_id,
                    post_id: post_id
                }
            }
        })
        if (like === null) {
            return false
        }
        return true
    }

    async getLikeCount(post_id: number) {
        return await this.prisma.likePost.count({
            where: {
                post_id: post_id
            }
        })
    }

    async createSession(user_id: number) {
        const session = await this.prisma.session.create({
            data: {
                user_id: user_id,
                session_id: crypto.randomBytes(64).toString('hex')
            }
        })
        return session.session_id
    }

    async deleteSession(session_id: string) {
        await this.prisma.session.delete({
            where: {
                session_id: session_id
            }
        })
    }

    async checkSession(session_id: string) {
        const sessions = await this.prisma.session.findUnique({
            where: {
                session_id: session_id
            }
        })
        if (sessions === null) {
            return null
        }
        return sessions.user_id
    }

    async getFollowingsPostList(user_id: number) {
        const posts = await this.prisma.post.findMany({
            where: {
                user_id: {
                    in: await this.prisma.follow.findMany({
                        where: {
                            follow_from: user_id
                        }
                    }).then((result) => {
                        return result.map((value) => {
                            return value.follow_to
                        })
                    })
                }
            },
            orderBy: {
                time: 'desc'
            }
        })
        return posts
    }

    async searchUser(keyword: string) {
        return await this.prisma.user.findMany({
            where: {
                OR: [
                    {
                        nickname: {
                            contains: keyword
                        }
                    }
                ]
            }
        })
    }

    async getProfileImageUUID(user_id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                user_id: user_id
            }
        })
        if (user === null) {
            return null
        }
        return user.profile_image
    }

    async setProfileImageUUID(user_id: number, uuid: string) {
        await this.prisma.user.update({
            where: {
                user_id: user_id
            },
            data: {
                profile_image: uuid
            }
        })
    }
    

    async disconnect() {
        await this.prisma.$disconnect()
    }
}