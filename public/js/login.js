window.onload = function() {
    const id = document.getElementById('id-input');
    const pw = document.getElementById('pw-input');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const errorLabel = document.getElementById('error-label');

    loginBtn.addEventListener('click', function() {
        if (id.value === '' || pw.value === '') {
            errorLabel.innerHTML = '아이디와 비밀번호를 입력해주세요.';
            return;
        }
        
        let result = login(id.value, pw.value);
        result.then((data) => {
            console.log(data);
            if(data.error) {
                errorLabel.innerHTML = data.error;
            }
            else {
                location.href = '/home.html';
            }
        });
    });

    signupBtn.addEventListener('click', function() {
        if (id.value === '' || pw.value === '') {
            errorLabel.innerHTML = '아이디와 비밀번호를 입력해주세요.';
            return;
        }
        
        let result = signUp(id.value, pw.value);
        result.then((data) => {
            console.log(data);
            if(data.error) {
                errorLabel.innerHTML = data.error;
            }
            else {
                location.href = '/home.html';
            }
        });
    });
    
    async function login(id, password) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}&password=${password}`,
        });
        const data = await res.json();
        if (res.ok) {
            document.cookie = `session=${data.session_id}`;
            document.cookie = `user_id=${data.user_id}`;
            return {};
        }
        else {
            return { error: data.message };
        }
    }

    async function signUp(id, password) {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}&password=${password}`,
        });
        const data = await res.json();
        if (res.ok) {
            document.cookie = `session=${data.session_id}`;
            document.cookie = `user_id=${data.user_id}`;
            return {};
        }
        else {
            return { error: data.message };
        }
    }
}