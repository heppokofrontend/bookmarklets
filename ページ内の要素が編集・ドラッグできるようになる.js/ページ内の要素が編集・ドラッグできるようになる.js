/* eslint-disable no-console */
// eslint-disable-next-line no-unused-expressions
!window.TO_STICKY_NOTE && ((win, doc) => {
    'use strict';

    const style = doc.createElement('style');
    const defaultColor = 'rgba(255,0,0,.1)';
    const cssTemplate = '[data-__stikyNote-dragging__="true"],[data-__stikyNote-dragging__="true"] * {background:$$$draggingColor$$$;}';
    const ToStickyNote = function () {
        let zIndexViewer = null;
        const positionPatternRegExp = /^(fixed|absolute|relative|sticky)$/;
        const removeOriginEvents = () => {
            const eventAttributeNames = [
                'onclick',
                'ondbclic',
                'onmousedown',
                'onmouseenter',
                'onmouselmave',
                'onmousemove',
                'onmouseout',
                'onmouseover',
                'onmouseup',
                'onmousewheel',
                'onchange',
                'onkeydown',
                'onkeyup',
                'onkeypress'
            ];

            // body 要素内の script 要素を削除
            doc.body.querySelectorAll('script').forEach((script) => {
                script.remove();
            });

            // DHTML 経由のイベントハンドラを削除
            doc.querySelectorAll(`[${eventAttributeNames.join('], [')}]`).forEach((node) => {
                eventAttributeNames.forEach((attr) => {
                    node.removeAttribute(attr);
                });
            });

            // addEventListener 経由のイベントハンドラを削除
            doc.body.innerHTML = doc.body.innerHTML; /* eslint-disable-line no-self-assign */
            doc.body.style.userSelect = 'none';
        };
        const setupEvent = () => {
            const _handler = (() => {
                let currentElement = null; // The Element of being dragged
                let editingElement = null; // The element of contentEditable=true
                let zIndex = 0;
                const startPos = {
                    x: 0,
                    y: 0
                };
                const zIndexAdjust = (isDown) => {
                    if (zIndex === 'auto') {
                        zIndex = 0;
                    }

                    if (isDown) {
                        zIndex = zIndex <= 0 ? 0 : --zIndex;
                    } else {
                        zIndex++;
                    }

                    zIndexViewer.textContent = `z-index: ${zIndex}`;
                    currentElement.style.zIndex = zIndex;
                };
                let domMatrix = null;

                return {
                    preventDefault: (e) => {
                        e.preventDefault();
                    },
                    mousedown: function (e) {
                        const currentStyle = win.getComputedStyle(this, null);

                        domMatrix = new DOMMatrix(currentStyle.transform);
                        startPos.x = e.clientX;
                        startPos.y = e.clientY;
                        zIndex = currentStyle['z-index'];

                        e.stopPropagation();

                        if (editingElement) {
                            editingElement.contentEditable = false;
                            editingElement = null;
                        }

                        if (
                            e.metaKey ||
                            e.ctrlKey ||
                            e.altKey
                        ) {
                            editingElement = this;
                            editingElement.contentEditable = true;

                            return;
                        }

                        e.preventDefault();

                        // for translate
                        if (currentStyle.display === 'inline') {
                            this.style.display = 'inline-block';
                        }

                        // for z-index
                        if (!positionPatternRegExp.test(currentStyle.position)) {
                            this.style.position = 'relative';
                        }

                        this.setAttribute('data-__stikyNote-dragging__', 'true');
                        zIndexViewer.textContent = `z-index: ${zIndex}`;
                        zIndexViewer.setAttribute('data-visible', 'true');

                        currentElement = this;

                        win.addEventListener('keydown', _handler.keydown);
                        win.addEventListener('wheel', _handler.wheel);
                        doc.addEventListener('mouseup', _handler.mouseup);
                        doc.addEventListener('mousemove', _handler.mousemove);
                    },
                    mousemove: (ev) => {
                        if (domMatrix.is2D) {
                            const {a, b, c, d, e, f} = domMatrix.translate(
                                ev.clientX - startPos.x,
                                ev.clientY - startPos.y
                            );

                            currentElement.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
                        } else {
                            const {m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44} = domMatrix.translate(
                                ev.clientX - startPos.x,
                                ev.clientY - startPos.y,
                                domMatrix.m43
                            );

                            currentElement.style.transform = `matrix3D(${m11}, ${m12}, ${m13}, ${m14}, ${m21}, ${m22}, ${m23}, ${m24}, ${m31}, ${m32}, ${m33}, ${m34}, ${m41}, ${m42}, ${m43}, ${m44})`;
                        }
                    },
                    mouseup: () => {
                        currentElement.setAttribute('data-__stikyNote-dragging__', 'false');
                        zIndexViewer.setAttribute('data-visible', 'false');

                        win.removeEventListener('keydown', _handler.keydown);
                        win.removeEventListener('wheel', _handler.wheel);
                        doc.removeEventListener('mouseup', _handler.mouseup);
                        doc.removeEventListener('mousemove', _handler.mousemove);
                    },
                    wheel: (e) => {
                        e.preventDefault();

                        zIndexAdjust(e.deltaY > 0 || e.wheelDelta < 0);
                    },
                    keydown: (e) => {
                        e.preventDefault();

                        zIndexAdjust(e.key === 'ArrowDown');
                    }
                };
            })();
            const allElemetns = doc.querySelectorAll('body *:not(colgroup):not(col):not(noscript):not(link):not(script):not(style):not(template):not(tbody):not(dialog), dialog[open]');
            const max = allElemetns.length;
            let i = 0;
            let node = null;

            for (i; i < max; i++) {
                node = allElemetns[i];
                node.addEventListener('mousedown', _handler.mousedown);
                node.addEventListener('click', _handler.preventDefault);
            }
        };
        const insertUI = () => {
            let css = cssTemplate;

            css = css.replace('$$$draggingColor$$$', defaultColor);
            style.textContent = css;
            doc.head.append(style);

            zIndexViewer = (() => {
                const node = {
                    host: doc.createElement('stikynote-zindexviewer'),
                    style: document.createElement('style'),
                    viewer: doc.createElement('viewer-value')
                };

                node.style.textContent = ':host {pointer-events:none;} :host viewer-value {position:fixed;right:0;bottom:0;padding:10px;font-size:16px;background:rgba(0,0,0,.8);z-index:999999;transition:.3s opacity ease-out;opacity:0;color:#fff;}:host viewer-value[data-visible="true"] {opacity:1;}';
                node.host.attachShadow({
                    mode: 'open'
                });

                node.host.shadowRoot.append(node.viewer);
                node.host.shadowRoot.append(node.style);
                node.viewer.setAttribute('data-visible', 'false');
                doc.body.append(node.host);

                return node.viewer;
            })();
        };
        const finish = () => {
            console.group('ToStickyNote 1.0.1 2018/12/22: How to use.');
            console.log('ドラッグ中にマウスホイールを動かすか、上下矢印キーを押下することで z-index プロパティを操作できます（最低値： 0）。');
            console.log('Altキー、commandキーまたはCtrlキーを押下しながら要素をクリックすることで対象の要素のテキストを編集することができるようになります。');
            console.log('次のコードを実行することで、ドラッグ中の要素の背景色が変更できます。');
            console.table({
                'TO_STICKY_NOTE.colorRed()': '赤色（デフォルト）',
                'TO_STICKY_NOTE.colorGreen()': '緑色',
                'TO_STICKY_NOTE.colorBlue()': '青色'
            });
            console.log('GitHub： https://github.com/heppokofrontend/bookmarklets/tree/master/ページ内の要素が編集・ドラッグできるようになる.js');
            console.groupEnd();
        };

        removeOriginEvents();
        setupEvent();
        insertUI();
        finish();
    };

    // 不要なメソッドやプロパティを表示させない
    ToStickyNote.prototype = Object.create(null);
    ToStickyNote.prototype.colorRed = function () {
        style.textContent = cssTemplate.replace('$$$draggingColor$$$', defaultColor);


        return '赤色になりました';
    };
    ToStickyNote.prototype.colorGreen = function () {
        style.textContent = cssTemplate.replace('$$$draggingColor$$$', 'rgba(0,255,0,.1)');


        return '緑色になりました';
    };
    ToStickyNote.prototype.colorBlue = function () {
        style.textContent = cssTemplate.replace('$$$draggingColor$$$', 'rgba(0,0,255,.1)');


        return '青色になりました';
    };

    win.TO_STICKY_NOTE = new ToStickyNote();


    return win.TO_STICKY_NOTE;
})(window, document);
