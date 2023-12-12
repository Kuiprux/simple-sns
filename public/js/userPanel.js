window.addEventListener('load', function() {
    
    const userPageProfileImg = document.getElementById('user-page-profile-img');
    const userPageUsername = document.getElementById('user-page-username');
    const userPageDescription = document.getElementById('user-page-userdesc');
    const userPageFollowBtn = document.getElementById('user-page-follow-btn');

    const userPosts = document.getElementById('user-posts');

    function init() {
        loadUserPage();
    }

    function loadUserPage() {
        const url = new URL(window.location.href);
        const targUserId = url.searchParams.get('userid');
        curUserPageId = targUserId;

        getUserData(targUserId)
        .then((account) => {
            userPageProfileImg.src = getProfileImgUrl(account.profile_image);
            userPageUsername.innerHTML = account.nickname;
            userPageDescription.innerHTML = account.description;
            if(targUserId == userId) {
                userPageFollowBtn.style.display = 'none';
            } else {
                userPageFollowBtn.innerHTML = account.isFollowing ? 'Unfollow' : 'Follow';
                userPageFollowBtn.addEventListener('click', () => onFollowButtonClicked(account.user_id, userPageFollowBtn));
            }
        });
        loadUserPosts(targUserId);
    }

    function loadUserPosts(userId) {
        getUserPosts(userId)
        .then((data) => {
            data.posts.forEach((post) => {
                console.log(JSON.stringify(post));
                let userData = getUserData(post.user_id);
                userData.then((account) => {
                    userPosts.appendChild(createPostElement(account, post));
                });
            });
        });
    }

    init();
});