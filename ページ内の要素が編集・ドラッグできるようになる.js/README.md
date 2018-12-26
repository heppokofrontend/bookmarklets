# ページ内の要素が編集・ドラッグできるようになる.js

Chrome 71, Firefox 64にて動作確認しました。

このブックマークレットを実行すると、付箋のような感覚で各種要素をドラッグで操作することができます。また、要素内のテキストを編集することができます。

打ち合わせの際や、指示書の作成、サンプル画面のキャプチャなどの場面でご利用ください🙆‍♀️。

## 利用方法

- ドラッグ中にマウスホイールを動かすか、上下矢印キーを押下することで`z-index`プロパティを操作できます（最低値： 0）。
- Altキー、commandキーまたはCtrlキーを押下しながら要素をクリックすることで対象の要素のテキストを編集することができるようになります。

次のコードを実行することで、ドラッグ中の要素の背景色が変更できます。

|コード|処理|
|:--|:--|
|`STICKY_NOTE.colorRed()`|赤色（デフォルト）になる|
|`STICKY_NOTE.colorGreen()`|緑色になる|
|`STICKY_NOTE.colorBlue()`|青色になる|


## 原案

> fukuwarai.js  
> http://d.hatena.ne.jp/KAZUMiX/20071120/fukuwarai

SSH環境下などで利用できなかったり、iij4uサーバが運営終了に伴い現在は元ソースが参照できないようなので同僚向けに用意しました。

fukuwarai.js を書いた[KAUZMiX氏](https://twitter.com/KAZUMiX)にローカルからサルベーシできたとのご連絡をいただきましたので、原案の元ソースはこちらをご覧ください。

参照：[http://refactor.jp/d/javascript/switchCss/](http://refactor.jp/d/javascript/switchCss/)

