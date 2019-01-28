/*
 * minify してBookmarkletとするときは必ずURIエンコードを通してください。
 * そのまま生JSコードをブラウザに食わせるとリストなどのインデントが崩れてしまいます
 */
((textarea, translate) => {
    'use strict';

    if (!textarea) {
        throw new TypeError('テキストエリアが見つかりませんでした。');
    }

    textarea.value = translate(textarea.value); // 関数 translate を外に出して利用できます
})(document.querySelector('textarea#descriptionTextArea, textarea[id="page.content"]'), (val) => {
    'use strict';

    const codes = [];
    const quotes = [];
    const paragraphs = [];
    const textLevelSemanticsCheck = (content) => {
        const patterns = [
            // 要素を<tagName>表記しているパターンをエスケープ
            {
                pattern: /<(.*?)>/g,
                replacement: (m, p1) => {
                    return `&lt;${p1}&gt;`;
                }
            },

            // 抜け漏れしている<をエスケープ。>は他の記法で利用されているためエスケープしない
            {
                pattern: /</g,
                replacement: (m, p1) => {
                    return '&lt;';
                }
            },

            // strong
            {
                pattern: /''(.*?)''/g,
                replacement: (m, p1) => {
                    return ` **${p1.trim()}** `;
                }
            },

            // em
            {
                pattern: /'(.*?)'/g,
                replacement: (m, p1) => {
                    return ` *${p1.trim()}* `;
                }
            },

            // strike
            {
                pattern: /%%(.*?)%%/g,
                replacement: (m, p1) => {
                    return ` ~~${p1.trim()}~~ `;
                }
            },

            // a
            {
                pattern: /\[\[(.*?)[:>](.*?)\]\]/g,
                replacement: (m, p1, p2) => {
                    return `[${p1.trim()}](${p2})`;
                }
            },

            // 色指定（Markdown in Backlogでは無視される）
            {
                pattern: /&color\((.*?)\)(\s+)?{(.*?)}/ig,
                replacement: (m, p1, p2, p3) => {
                    return `<span style="color: ${p1};">${p3}</span>`;
                }
            },

            // その他埋め込み
            {
                pattern: /#image\((.*?)\)/,
                replacement: (m, p1) => {
                    return `![${p1}]`;
                }
            },
            {
                pattern: /#thumbnail\((.*?)\)/,
                replacement: (m, p1) => {
                    return `![${p1}]`;
                }
            },
            {
                pattern: /#attach\((.*?):(.*?)\)/,
                replacement: (m, p1, p2) => {
                    return `[${p1}][${p2}]`;
                }
            },

            // 余計な半角スペースの連続を削除
            {
                pattern: /  /,
                replacement: ' '
            },

            {
                pattern: /&/,
                replacement: '&amp;'
            }
        ];

        patterns.forEach(({pattern, replacement}) => {
            content = content.replace(pattern, replacement);
        });

        return content;
    };
    const patterns = [
        // 改行コード
        {
            pattern: /\n\r/g,
            replacement: '\n'
        },
        {
            pattern: /\r/g,
            replacement: '\n'
        },




        // 見出し
        {
            pattern: /^(\*+)(.*)$/gm,
            replacement: (m, p1, p2) => {
                return `\n${p1.replace(/\*/g, '#')} ${textLevelSemanticsCheck(p2.trim())}\n`;
            }
        },




        // theadなしテーブル
        {
            pattern: /\n\|([\s|\S]*)\|\n(?!\|)/g,
            replacement: (m, p1) => {
                if (p1.indexOf('|h\n') === -1) {
                    let i = 0;
                    let max = p1.split('\n')[0].split('|').length;
                    let row = '';

                    for (i; i < max; i++) {
                        row += '|:--';
                    }

                    row += '|';


                    return `\n${row}\n|${p1}|\n`;
                }

                return `\n|${p1}|\n`;
            }
        },




        // 行見出しテーブル
        {
            pattern: /^\|(.*)\|(\s?)$/gm,
            replacement: (m, p1, p2) => {
                p1 = p1.replace(/\|~/g, '|');
                p1 = p1.replace(/^~/g, '');
                p1 = p1.replace(/\|\|/g, '| |');
                p1 = p1.replace(/^\|/g, ' |');
                p1 = p1.replace(/^\|/g, ' |'); // 先頭が空
                p1 = p1.replace(/\|$/g, '| '); // 最後が空

                return `|${p1}|${p2}`;
            }
        },
        // 列見出しテーブル
        {
            pattern: /^\|(.*)\|h\s?$/gm,
            replacement: (m, p1) => {
                let row = '';
                let cell = p1.split('|');
                let i = 0;
                let max = cell.length;

                for (i; i < max; i++) {
                    row += '|:--';
                }

                row += '|';

                p1 = p1.replace(/\|~/g, '|');
                p1 = p1.replace(/^~/g, '');
                p1 = p1.replace(/\|\|/g, '| |');
                p1 = p1.replace(/^\|/g, ' |'); // 先頭が空
                p1 = p1.replace(/\|$/g, '| '); // 最後が空

                return `\n|${p1}|\n${row}`;
            }
        },
        // テーブルに改行
        {
            pattern: /\n\|([\s|\S]*?)\|\n([^|])/g,
            replacement: (m, p1, p2) => {
                return `\n|${textLevelSemanticsCheck(p1)}|\n\n${p2}`
            }
        },
        {
            pattern: /\n\|([\s|\S]*?)\|\n(?!\|)/g,
            replacement: (m, p1) => {
                return `\n\n|${p1}|\n\n`
            }
        },




        // 順序リスト
        {
            pattern: /\n\+([\s|\S]*?)\n\n/g,
            replacement: (m, p1) => {
                return `\n+${p1}\n\n\n`;
            }
        },
        {
            pattern: /\n\+([\s|\S]*?)\n\n/g,
            replacement: (m, p1) => {
                let result = '';

                p1 = '\n+' + p1.trim();
                // スペースの整形
                p1 = p1.replace(/^(\++)(.*)$/gm, (m, p1, p2) => {
                    return `${p1} ${p2.trim()}`;
                });
                p1 = p1.trim();

                {
                    const symbolCount = []; // index番号はインデントレベル。インデントが上がったら
                    let currentLevel = 0;

                    p1.split('\n').forEach((line) => {
                        const level = line.split(' ')[0].length;

                        if (level < currentLevel) {
                            symbolCount[currentLevel] = 0;
                        }

                        currentLevel = level;
                        symbolCount[currentLevel] = symbolCount[currentLevel] ? symbolCount[currentLevel] + 1 : 1;
                        result += textLevelSemanticsCheck(line.replace('+ ', symbolCount[currentLevel] + '. ')) + '\n';
                    });
                }


                // ネストがあるときに残っている + をスペースに変換
                p1 = result.replace(/^(\++)(.*)/gm, (m, p1, p2) => {
                    const max = p1.length;
                    let i = 0;
                    let indent = '';

                    for (i; i < max; i++) {
                        indent += '    ';
                    }

                    return indent + p2;
                });


                return `\n${p1}\n`;
            }
        },




        // 非順序リスト
        {
            pattern: /^(-+)(.*)$/gm,
            replacement: (m, p1, p2) => {
                let i = 0;
                let max = p1.length - 1;
                let indent = '';

                if (!p2) {
                    return p1; // hr要素
                }

                for (i; i < max; i++) {
                    indent += '    ';
                }

                indent += '-';
                p2 = textLevelSemanticsCheck(p2).trim();

                return `${indent} ${p2}`;
            }
        },




        // 改行をbr要素に変換（Markdown in Backlogでは無視されます）
        {
            pattern: /&br;/g,
            replacement: ' <br>'
        }
    ];

    // 正規表現を助けるための改行を追加
    val = '\n' + val + '\n\n';

    // 目次
    val = val.replace(/^#contents$/gm, '[toc]\n');

    // コード範囲指定を隠す
    val = val.replace(/\n{code}([\s|\S]*?){\/code}\n/g, (m, p1) => {
        codes.push(p1);

        return `\n{{CODE_REPACE_BACKLOG_TO_MARKDOWN-${codes.length - 1}}}\n`;
    });

    // 引用範囲指定を隠す
    val = val.replace(/\n{quote}([\s|\S]*?){\/quote}\n/g, (m, p1) => {
        quotes.push(p1);

        return `\n{{QUOTE_REPACE_BACKLOG_TO_MARKDOWN-${quotes.length - 1}}}\n`;
    });

    // 通常テキスト（パラグラフ）を隠す
    val = val.replace(/^.*$/gm, (() => {
        const isP = /^(?![*\|\-\+\s>)`])(.*)$/;

        return (p1) => {
            if (
                p1 &&
                isP.test(p1) &&
                !p1.startsWith('{{CODE_REPACE_BACKLOG_TO_MARKDOWN') &&
                !p1.startsWith('{{QUOTE_REPACE_BACKLOG_TO_MARKDOWN')
            ) {
                paragraphs.push(p1);

                return `{{PARAGRAPHS_REPACE_BACKLOG_TO_MARKDOWN-${paragraphs.length - 1}}}`;
            }

            return p1;
        }
    })());
    // パラグラフの塊は最後に空行を開けさせる
    val = val.replace(/\n{{PARAGRAPHS_REPACE_BACKLOG_TO_MARKDOWN-.*?}}\n(?!{{)/g, (p1) => {
        return `${p1}\n`;
    });


    // 範囲指定型以外のBacklog記法を置き換える
    patterns.forEach(({pattern, replacement}) => {
        val = val.replace(pattern, replacement);
    });


    // 範囲指定系を埋めもどす前に無駄な改行を削除する
    while (/\n\n\n/g.test(val)) {
        val = val.replace('\n\n\n', '\n\n');
    }


    // コード範囲指定を戻す
    val = val.replace(/{{CODE_REPACE_BACKLOG_TO_MARKDOWN-(.*?)}}/g, (m, p1) => {
        let content = codes[Number(p1)].trim();

        if (content) {
            return '\n```\n' + codes[Number(p1)].trim() + '\n```\n';
        }

        return '\n```\n```\n';
    });


    // 引用範囲指定を戻す
    val = val.replace(/{{QUOTE_REPACE_BACKLOG_TO_MARKDOWN-(.*?)}}/g, (m, p1) => {
        let content = quotes[Number(p1)].trim();

        content = content.split('\n').join('\n> ');

        return '\n> ' + content + '\n';
    });


    // パラグラフを戻す
    val = val.replace(/{{PARAGRAPHS_REPACE_BACKLOG_TO_MARKDOWN-(.*?)}}/g, (m, p1) => {
        let content = paragraphs[Number(p1)].trim();

        content = textLevelSemanticsCheck(content);

        return content;
    });


    return val.trim();
});
