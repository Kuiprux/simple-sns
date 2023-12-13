
window.addEventListener('load', function() {
    const followingPosts = document.getElementById('following-posts');

    function init() {
        loadFollowingPosts();
    }

    function loadFollowingPosts() {
        getFollowingPosts()
        .then((data) => {
            data.posts.forEach((post) => {
                console.log(JSON.stringify(post));
                getUserData(post.user_id)
                .then((account) => {
                    console.log(JSON.stringify(account));
                    followingPosts.appendChild(createPostElement(account, post));
                });
            });
        });
    }

    init();
});