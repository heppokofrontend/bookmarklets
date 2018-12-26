/* eslint-disable no-console, no-script-url */
((win, doc) => {
    'use strict';

    const init = () => {
        const CONCAT_BOOKMARKLETS = win.CONCAT_BOOKMARKLETS;
        const shadowRoot = CONCAT_BOOKMARKLETS.attachShadow({
            mode: 'closed'
        });
        const content = (() => {
            const fragment = doc.createDocumentFragment();
            const style = doc.createElement('style');
            const closeBtn = doc.createElement('button');
            const concatBtn = doc.createElement('button');
            const resultWrap = doc.createElement('div');
            const resultInput = doc.createElement('input');
            const concatResponse = doc.createElement('span');
            const tasks = {
                close: () => {
                    CONCAT_BOOKMARKLETS.remove();
                },
                getFormSet: function () {
                    const getFormSet = doc.createDocumentFragment();
                    const wrapper = doc.createElement('div');
                    const titleInput = doc.createElement('input');
                    const codeInput = doc.createElement('input');
                    const plusBtn = doc.createElement('button');
                    const deleteBtn = doc.createElement('button');

                    titleInput.placeholder = 'タスク名';
                    titleInput.setAttribute('aria-label', 'タスク名');
                    codeInput.placeholder = 'javascript:';
                    codeInput.setAttribute('aria-label', '結合したいブックマークレットのJavaScriptコード');
                    wrapper.className = 'item';
                    plusBtn.type = 'button';
                    plusBtn.className = 'plus';
                    plusBtn.innerHTML = '<span>追加</span>';
                    plusBtn.addEventListener('click', this.add);
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'delete';
                    deleteBtn.innerHTML = '<span>削除</span>';
                    deleteBtn.addEventListener('click', this.remove);

                    wrapper.append(titleInput);
                    wrapper.append(codeInput);
                    wrapper.append(plusBtn);
                    wrapper.append(deleteBtn);
                    getFormSet.append(wrapper);

                    return getFormSet;
                },
                add: function () {
                    const formSet = tasks.getFormSet();

                    this.parentNode.after(formSet);
                },
                remove: function () {
                    const {parentNode} = this;
                    const {previousElementSibling, nextElementSibling} = parentNode;

                    if (
                        (
                            previousElementSibling &&
                            previousElementSibling.className === 'item'
                        ) ||
                        (
                            nextElementSibling &&
                            nextElementSibling.className === 'item'
                        )
                    ) {
                        parentNode.remove();
                    }
                },
                concat: (() => {
                    let key = null;
                    let hide = () => {
                        concatResponse.setAttribute('aria-hidden', 'true');
                    };

                    return () => {
                        const itemSet = shadowRoot.querySelectorAll('.item');
                        const srcSet = [];

                        itemSet.forEach((item) => {
                            const code = (() => {
                                let {value} = item.children[1];

                                value = value.replace(/^javascript:/, '');

                                try {
                                    return decodeURIComponent(value);
                                } catch (e) {
                                    return value;
                                }
                            })();
                            const title = item.firstElementChild.value || code;

                            srcSet.push({
                                title: title,
                                code: code
                            });
                        });

                        resultInput.value = `javascript:(() => {const srcSet = ${JSON.stringify(srcSet)}; srcSet.forEach(({title, code}) => {console.log(\`\${title} を実行します\`);try {eval(code);} catch (e) {console.error(e);}});console.log('Done: 次の内容を実行しました。');console.table(srcSet);win.CONCAT_BOOKMARKLETS = win.CONCAT_BOOKMARKLETS || Object.create(null); CONCAT_BOOKMARKLETS.executed = srcSet;})();`;

                        concatResponse.setAttribute('aria-hidden', 'false');

                        clearTimeout(key);
                        key = setTimeout(hide, 1000);
                    };
                })()
            };

            closeBtn.type = 'button';
            closeBtn.className = 'close';
            closeBtn.innerHTML = '<span>閉じる</span>';
            closeBtn.addEventListener('click', tasks.close);
            fragment.append(closeBtn);

            fragment.append(style);
            style.textContent = ':host {overflow: auto;max-width: 500px;width: 90vw;margin: auto;line-height: 1.8;font-size: 14px;display: block;position: fixed;left: 0;right: 0;top: 0;bottom: 0;z-index: 999999;background: #fff;box-shadow: 0 0 2px rgba(0, 0, 0, .4);max-height: 90vh;padding: 10px;} * {box-sizing: border-box;}.close::before,.close::after,.plus::before,.plus::after,.delete::before,.delete::after {content: ""; width: 3px;background: #aaa;display: block;left: 0;right: 0;top: 0;bottom: 0;margin: auto;z-index: 0;position: absolute;}.plus::before,.plus::after,.delete::before,.delete::after {height: 11px;}.close::before, .close::after {height: 21px;}.close::before, .delete::before {transform: rotate(-45deg);}.close::after, .delete::after {transform: rotate(45deg);} .close {height: 30px;width: 30px;margin: 0 0 10px;} input, button {display: block;} button {position: relative; border: 0;background: transparent;} button span {position: absolute; width: 0; height: 0; overflow: hidden; display: block; z-index: -1;} input {border: 0;background: transparent;width: 100%; padding: 10px 40px 10px 10px; margin: 0 0 8px;font-weight: bold;} input + input {background:#fff;box-shadow: 1px 1px 1px rgba(0, 0, 0, .2);font-weight: normal;} .item {background: #efefef;padding: 10px;position: relative; margin: 0 0 70px;} .plus,.delete {position: absolute;} .plus {border: 1px solid #aaa; border-radius: 80px; height: 39px; width: 39px; background: #fff;margin: 10px auto 0; left: 0; right: 0; top: 100%;}.plus::after {transform: rotate(90deg);} .delete {border: 0;background: transparent;right: 10px;top: 10px; width: 30px; height: 30px;} .item:nth-child(3):nth-last-child(3) .delete {display: none;} .resultWrap {margin: 10px 0 0;}.result {border: 1px solid #ccc; background: #333; color: #fff;}.concat {background: #04b8c3;color: #fff;padding: 4px 12px;border-radius: 5px;}.resultWrap span {display: block;color: #398700;font-weight: bold;text-align: center;} .resultWrap  [aria-hidden="true"] {opacity: 0;transition: .2s opacity ease-out;}';

            fragment.append(tasks.getFormSet());

            concatBtn.textContent = '結合する';
            concatBtn.type = 'button';
            concatBtn.className = 'concat';
            concatBtn.addEventListener('click', tasks.concat);
            fragment.append(concatBtn);

            concatResponse.textContent = '結合しました！';
            concatResponse.setAttribute('aria-hidden', 'true');

            resultWrap.className = 'resultWrap';
            resultInput.className = 'result';
            resultInput.placeholder = '結合結果';
            resultInput.setAttribute('aria-label', '結合結果');
            resultInput.readOnly = true;
            resultWrap.append(resultInput);
            resultWrap.append(concatResponse);
            fragment.append(resultWrap);

            return fragment;
        })();


        shadowRoot.append(content);

        doc.body.append(CONCAT_BOOKMARKLETS);
    };

    if (win.CONCAT_BOOKMARKLETS) {
        doc.body.append(win.CONCAT_BOOKMARKLETS);

        return;
    }

    console.group('Concat bookmarklets 1.0.0 2018/12/27: How to use.');
    console.log('表示されるパネルの中に結合したいブックマークレットを追加していきます。');
    console.log('結合ボタンを押下することで、対象のブックマークレットを結合することができます。');
    console.log('結合したブックマークレットの実行内容は、結合したブックマークレットの実行後に`CONCAT_BOOKMARKLETS.executed`から確認することができます。');
    console.log('GitHub： https://github.com/Soten-Bluesky/bookmarklets/tree/master/複数のブックマークレットを結合する.js');

    win.CONCAT_BOOKMARKLETS = doc.createElement('concat-bookmarklets');
    init();
})(window, document);
