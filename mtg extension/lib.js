let changeView = (name) => {

    chrome.storage.local.set({ view: name }, () => { });

    document.body.querySelectorAll('[class^="view"]').forEach(item => {

        item.style.display = 'none';

    })

    let view = document.getElementById('view-' + name);
    view.style.display = 'block';

    return view;

}

chrome.runtime.sendMessage({

    from: 'popup',
    to: 'background',
    type: 'req',
    path: 'exauth',
    method: 'post'

}, (response) => {

    if (response.result.data.redirect) {

        changeView(response.result.data.page);

    } else if (response.result.data.logged) {

        changeView('logged');

        // chrome.storage.local.get('view', (data) => {

        //     changeView(data.view);

        // });

    }

});