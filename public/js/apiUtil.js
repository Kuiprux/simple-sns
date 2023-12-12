const {sessionId, userId} = getSessionInfo();

let userDataCache = {};
let curUserPageId = null;

if(!sessionId) {
    location.href = '/login.html';
}

getUserData().then((data) => {if(!data.user_id) location.href = '/login.html';});

function getSessionInfo() {
    const cookies = document.cookie.split('; ');
    const sessionId = cookies.find((cookie) => cookie.startsWith('session='));
    const userId = cookies.find((cookie) => cookie.startsWith('user_id='));
    console.log(cookies)
    console.log(sessionId, userId)
    return {
        sessionId: sessionId ? sessionId.split('=')[1] : null,
        userId: userId ? userId.split('=')[1] : null,
    };
}

function updateUserDataCache(user_id, data) {
    userDataCache[user_id] = {...userDataCache[user_id], ...data};
}

function getUserData(targUserId, forceUpdate = false) {
    if(!targUserId)
        targUserId = userId;
    if(userDataCache[targUserId] && !forceUpdate) {
        return Promise.resolve(userDataCache[targUserId]);
    }
    console.log(`/api/users/${targUserId}`);
    let result = fetch(`/api/users/${targUserId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    }).then((res) => res.json());
    result.then((data) => {
        userDataCache[targUserId] = data;
    });
    return result;
}

async function getUserPosts(userId) {
    console.log(`/api/posts/user/${userId}`);
    const res = await fetch(`/api/posts/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

function getProfileImgUrl(profileImg) {
    return `https://storage.googleapis.com/simple_sns_profile_image/${profileImg}.png`;
}

async function writePost(content) {
    const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
        body: `content=${content}`,
    });
    return await res.json();
}

async function getFollowingPosts() {
    const res = await fetch('/api/posts/followings', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

async function getFollowingAccounts() {
    const res = await fetch('/api/followings', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

function searchUsers(keyword) {
    let result = fetch(`/api/users/search?keyword=${keyword}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    }).then((res) => res.json());
    result.then((data) => {
        data.users.forEach((account) => {
            userDataCache[account.user_id] = account;
        });
    });
    return result;
}

async function followUser(userId) {
    const res = await fetch(`/api/followings/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId
        },
    });
    return await res.json();
}

async function unfollowUser(userId) {
    const res = await fetch(`/api/followings/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

async function likePost(postId) {
    const res = await fetch(`/api/posts/${postId}/likes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

async function unlikePost(postId) {
    const res = await fetch(`/api/posts/${postId}/likes`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

async function deletePost(postId) {
    const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

async function editPost(postId, content) {
    const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
        body: `content=${content}`,
    });
    return await res.json();
}

async function logout() {
    const res = await fetch(`/api/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
    });
    return await res.json();
}

async function updateUserData(username, userdesc, loginId, loginPw) {
    let body = '';
    if(username) body += `nickname=${username}`;
    if(userdesc) body += `&description=${userdesc}`;
    if(loginId) body += `&login_id=${loginId}`;
    if(loginPw) body += `&password=${loginPw}`;

    if(body.length === 0)
        return;

    if(body.charAt(0) === '&')
        body = body.slice(1);

    const res = await fetch(`/api/users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'session-id': sessionId,
        },
        body,
    });
    return await res.json();
}

async function uploadProfileImg(profileImg) {
    console.log(profileImg)
    if(!profileImg)
        return;

    const formData = new FormData();
    formData.append('image', profileImg);

    const res = await fetch(`/upload/users/profile-image`, {
        method: 'POST',
        headers: {
            'session-id': sessionId,
        },
        body: formData,
    });
    let data = await res.json();
    return data
}