let reloadFollowingAccounts;

window.addEventListener('load', function() {
    const userPanel = document.getElementById('user-panel');

    const profileImg = document.getElementById('profile-img');
    const usernameEl = document.getElementById('username');
    const userdescEl = document.getElementById('userdesc');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const profileImgEdit = document.getElementById('profile-img-edit');
    const usernameEdit = document.getElementById('username-edit');
    const userdescEdit = document.getElementById('userdesc-edit');
    const loginIdEdit = document.getElementById('login-id-edit');
    const loginPwEdit = document.getElementById('login-pw-edit');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    const postContent = document.getElementById('post-content');
    const postBtn = document.getElementById('post-btn');

    const followingAccounts = document.getElementById('following-accounts');

    let selectedProfileImage = null;

    editProfileBtn.addEventListener('click', function() {
        userPanel.classList.add('edit-mode');

        profileImgEdit.src = profileImg.src;

        usernameEdit.value = usernameEl.innerHTML;
        userdescEdit.value = userdescEl.innerHTML;

        usernameEdit.focus();
    });

    profileImgEdit.addEventListener('click', function() {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function() {
            let file = input.files[0];
            if(file) {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function() {
                    profileImgEdit.src = reader.result;
                }
                selectedProfileImage = file;
            }
        }
        input.click();
    });
        

    logoutBtn.addEventListener('click', function() {
        logout()
        .then((_) => {
            location.href = '/login.html';
        });
    });

    saveProfileBtn.addEventListener('click', function() {
        let profileImgFile = selectedProfileImage ? selectedProfileImage : null;
        let username = usernameEdit.value !== usernameEl.innerHTML ? usernameEdit.value : null;
        let userdesc = userdescEdit.value !== userdescEl.innerHTML ? userdescEdit.value : null;
        let loginId = loginIdEdit.value.length > 0 ? loginIdEdit.value : null;
        let loginPw = loginPwEdit.value.length > 0 ? loginPwEdit.value : null;

        if(profileImgFile) {
            uploadProfileImg(profileImgFile)
            .then((data) => {
                if(data && data.uuid) {
                    if(curUserPageId === userId) {
                        location.reload();
                    } else {
                        profileImg.src = getProfileImgUrl(data.uuid);
                    }
                }
            });
        }

        if(username || userdesc || loginId || loginPw) {
            updateUserData(username, userdesc, loginId, loginPw)
            .then((_) => {
                if(curUserPageId === userId) {
                    location.reload();
                } else {
                    loadUserData()
                }
            }
            );
        }
        userPanel.classList.remove('edit-mode');
    });

    cancelProfileBtn.addEventListener('click', function() {
        userPanel.classList.remove('edit-mode');
    });



    searchBtn.addEventListener('click', function() {
        location.href = `/search.html?keyword=${searchInput.value}`;
    });
    
    postBtn.addEventListener('click', async function() {
        writePost(postContent.value)
        .then((_) => {
            postContent.value = '';
            if(curUserPageId === userId) {
                location.reload();
            }
        });
    });

    function init() {
        loadUserData();
        loadFollowingAccounts();

        reloadFollowingAccounts = reloadFollowingAccountsFunc;
    }

    function loadFollowingAccounts() {
        getFollowingAccounts()
        .then((data) => {
            data.user_ids.forEach((user_id) => {
                getUserData(user_id)
                .then((account) => {
                    followingAccounts.appendChild(createAccountElement(account));
                });
            });
        });
    }

    function loadUserData() {
        getUserData(undefined, true)
        .then((data) => {
            profileImg.src = getProfileImgUrl(data.profile_image);
            profileImg.addEventListener('click', () => onProfileImageClicked(data.user_id));
            usernameEl.innerHTML = data.nickname;
            userdescEl.innerHTML = data.description;
        });
    }

    function reloadFollowingAccountsFunc() {
        followingAccounts.innerHTML = '';
        loadFollowingAccounts();
    }

    init();
});