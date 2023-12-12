function createAccountElement(account) {
    const accountDiv = document.createElement('div');
    accountDiv.className = 'account';

    const profileImg = document.createElement('img');
    profileImg.className = 'following-item profile-image';
    profileImg.src = getProfileImgUrl(account.profile_image);
    profileImg.addEventListener('click', () => onProfileImageClicked(account.user_id));

    const username = document.createElement('div');
    username.className = 'following-item user-name';
    username.innerHTML = account.nickname;

    accountDiv.appendChild(profileImg);
    accountDiv.appendChild(username);
    return accountDiv;
}

function createAccountElementWithFollowButton(account) {
    const accountElement = createAccountElement(account);
    console.log(JSON.stringify(account));

    if(account.user_id == userId) return accountElement;
    
    const followButton = document.createElement('button');
    followButton.className = 'following-item follow-button';
    followButton.innerHTML = account.isFollowing ? 'Unfollow' : 'Follow';
    followButton.addEventListener('click', () => onFollowButtonClicked(account.user_id, followButton));
    accountElement.appendChild(followButton);
    return accountElement;
}

function createPostElement(account, post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const accountDiv = document.createElement('div');
    accountDiv.className = 'account';

    const profileImg = document.createElement('img');
    profileImg.className = 'small profile-image';
    profileImg.src = getProfileImgUrl(account.profile_image);
    profileImg.addEventListener('click', () => onProfileImageClicked(account.user_id));

    const username = document.createElement('div');
    username.className = 'small user-name';
    username.innerHTML = account.nickname;

    const postView = document.createElement('div');
    postView.className = 'post-view';

    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    postContent.innerHTML = post.content;

    const buttons = document.createElement('div');
    buttons.className = 'post-element-container';
    
    const likeCount = document.createElement('div');
    likeCount.className = 'post-element';
    likeCount.innerHTML = post.like_count;
    
    const likeButton = document.createElement('img');
    likeButton.className = 'post-element';
    likeButton.src = post.is_liked ? '/res/filledheart.png' : '/res/emptyheart.png';
    likeButton.addEventListener('click', () => onLikeButtonClicked(post.post_id, likeButton, likeCount));
    
    buttons.appendChild(likeCount);
    buttons.appendChild(likeButton);

    const postEditContent = document.createElement('textarea');
    if(account.user_id == userId) {
        const editButton = document.createElement('img');
        editButton.className = 'post-element';
        editButton.src = '/res/edit.png';
        editButton.addEventListener('click', () => onEditButtonClicked(postDiv, postContent, postEditContent));

        const deleteButton = document.createElement('img');
        deleteButton.className = 'post-element';
        deleteButton.src = '/res/remove.png';
        deleteButton.addEventListener('click', () => onDeleteButtonClicked(post.post_id, postDiv));
        
        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);
    }
    
    accountDiv.appendChild(profileImg);
    accountDiv.appendChild(username);
    
    postView.appendChild(postContent);
    postView.appendChild(buttons);

    const postEdit = document.createElement('div');
    postEdit.className = 'post-edit';

    postEditContent.className = 'post-edit-content';

    const postEditBtn = document.createElement('button');
    postEditBtn.className = 'simple-button';
    postEditBtn.innerHTML = '수정';
    postEditBtn.addEventListener('click', () => onEditDoneButtonClicked(post.post_id, postEditContent.value, postDiv, postContent));

    const postEditCancelBtn = document.createElement('button');
    postEditCancelBtn.className = 'simple-button';
    postEditCancelBtn.innerHTML = '취소';
    postEditCancelBtn.addEventListener('click', () => onEditCancelButtonClicked(postDiv, postEditContent));

    postEdit.appendChild(postEditContent);
    postEdit.appendChild(postEditBtn);
    postEdit.appendChild(postEditCancelBtn);

    postDiv.appendChild(accountDiv);
    postDiv.appendChild(postView);
    postDiv.appendChild(postEdit);
    return postDiv;
}

function onProfileImageClicked(userId) {
    location.href = `/user.html?userid=${userId}`;
}

function onFollowButtonClicked(userId, followButton) {
    getUserData(userId)
    .then((data) => {
        if(data.isFollowing) {
            unfollowUser(userId)
            .then((_) => {
                followButton.innerHTML = 'Follow';
                updateUserDataCache(userId, {isFollowing: false});
                reloadFollowingAccounts();
            });
        } else {
            followUser(userId)
            .then((_) => {
                followButton.innerHTML = 'Unfollow';
                updateUserDataCache(userId, {isFollowing: true});
                reloadFollowingAccounts();
            });
        }
    });
}

function onLikeButtonClicked(postId, likeButton, likeCount) {
    if(likeButton.src.endsWith('filledheart.png')) {
        unlikePost(postId)
        .then((data) => {
            likeButton.src = '/res/emptyheart.png';
            likeCount.innerHTML = data.like_count;
        });
    } else {
        likePost(postId)
        .then((data) => {
            likeButton.src = '/res/filledheart.png';
            likeCount.innerHTML = data.like_count;
        });
    }
}

function onEditButtonClicked(postDiv, postContentDiv, postEditContentDiv) {
    postDiv.classList.add('post-edit-mode');
    postEditContentDiv.value = postContentDiv.innerHTML;
    postEditContentDiv.focus();
}

function onDeleteButtonClicked(postId, postDiv) {
    deletePost(postId)
    .then((_) => {
        postDiv.remove();
    });
}

function onEditDoneButtonClicked(postId, content, postDiv, postContentDiv) {
    postDiv.classList.remove('post-edit-mode');
    editPost(postId, content)
    .then((_) => {
        postContentDiv.innerHTML = content;
    });
}

function onEditCancelButtonClicked(postDiv, postEditContentDiv) {
    postDiv.classList.remove('post-edit-mode');
    postEditContentDiv.value = '';
}