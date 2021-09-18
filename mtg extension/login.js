let view = document.getElementById('view-login');

let submit = view.querySelector('#login');

submit.addEventListener('click', () => {

    let username = view.querySelector('#username').value;
    let password = view.querySelector('#password').value;

    chrome.runtime.sendMessage({

        from: 'popup',
        to: 'background',
        type: 'req',
        path: 'exlogin',
        body: JSON.stringify({ username, password }),
        method: 'post'
    
    }, (response) => {
    
        if (response.result.data.logged) {
    
            changeView('logged');
        
        }
    
    });

})