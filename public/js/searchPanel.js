
window.addEventListener('load', function() {

    const searchResultUsers = document.getElementById('search-result-users');

    function init() {
        loadSearchResultUsers();
    }

    function loadSearchResultUsers() {
        const url = new URL(window.location.href);
        const keyword = url.searchParams.get('keyword');
        console.log(keyword);
        searchUsers(keyword)
        .then((data) => {
            data.users.forEach((account) => {
                searchResultUsers.appendChild(createAccountElementWithFollowButton(account));
            });
        });
    }

    init();
});