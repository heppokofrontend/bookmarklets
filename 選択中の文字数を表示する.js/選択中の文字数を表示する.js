/* eslint-disable no-console */
// eslint-disable-next-line no-unused-expressions
!window.VIEW_THE_LENGTH_OF_SELECTED_STRINGS_JS_IS_ENABLED && ((win, doc) => {
    'use strict';

    const viewer = (() => {
        const node = doc.createElement('selection-length');
        const style = doc.createElement('style');

        style.textContent = ':host {pointer-events:none;} :host span {position:fixed;right:0;bottom:0;padding:10px;font-size:16px;background:rgba(0,0,0,.8);z-index:2147483647;transition:.3s opacity ease-out;opacity:0;color:#fff;}:host span[data-visible="true"] {opacity:1;}';
        node.attachShadow({
            mode: 'open'
        });

        node.shadowRoot.append(doc.createElement('span'));
        node.shadowRoot.append(style);

        doc.body.append(node);


        return node.shadowRoot.firstElementChild;
    })();
    const handler = {
        mouseup: () => {
            viewer.setAttribute('data-visible', 'false');
        },
        keydown: (e) => {
            if (e.key === 'Escape') {
                handler.mouseup();
            }
        },
        selectionchange: (() => {
            const selection = window.getSelection();

            return () => {
                const {length} = String(selection);

                viewer.textContent = length + ' characters selected';

                if (length !== 0) {
                    viewer.setAttribute('data-visible', 'true');
                }
            };
        })()
    };

    doc.addEventListener('mouseup', handler.mouseup);
    doc.addEventListener('keydown', handler.keydown);
    doc.addEventListener('selectionchange', handler.selectionchange);

    console.group('選択中の文字数を表示する.js 1.0.0 2018/12/23: How to use.');
    console.log('ページ内の選択した文字数を画面右下に表示します。');
    console.log('GitHub： https://github.com/heppokofrontend/bookmarklets/tree/master/選択中の文字数を表示する.js');
    console.groupEnd();


    win.VIEW_THE_LENGTH_OF_SELECTED_STRINGS_JS_IS_ENABLED = true;
})(window, document);
