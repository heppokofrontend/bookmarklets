/* eslint-disable no-console */
((win) => {
    'use strict';

    const {href, origin, search} = new URL(document.URL);
    let url = href;

    console.log('GitHub： https://github.com/Soten-Bluesky/bookmarklets/tree/master/1つ上の階層に移動する.js');

    url = url.replace(win.location.hash, '');
    url = url.replace(origin, '');
    url = url.replace(search, '');
    url = url.replace(/\/index.html$/, '/');
    url = url.replace(/\/index.htm$/, '/');
    url = url.replace(/\/index.php$/, '/');

    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    url = url.slice(1).split('/').slice(0, -1);


    win.location.href = `${origin}/${url.join('/')}`;
})(window);
