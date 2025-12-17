# Messaging APIリファレンス

本ドキュメントは、Originalドキュメント（[Messaging APIリファレンス](https://developers.line.biz/ja/reference/messaging-api/)）のうち、[Flex Messageのパート](https://developers.line.biz/ja/reference/messaging-api/#flex-message)を抽出したドキュメントです。

## メッセージオブジェクト

送信するメッセージの内容を表すJSONオブジェクトです。

### Flex Message

Flex Messageは、[CSS Flexible Box（CSS Flexbox）](https://www.w3.org/TR/css-flexbox-1/)の基礎知識を使って、レイアウトを自由にカスタマイズできるメッセージです。Flex Messageの概要については、『Messaging APIドキュメント』の「[Flex Messageを送信する](https://developers.line.biz/ja/docs/messaging-api/using-flex-messages/)」を参照してください。

- [コンテナ](https://developers.line.biz/ja/reference/messaging-api/#container)
  - [バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)
  - [カルーセル](https://developers.line.biz/ja/reference/messaging-api/#f-carousel)
- [コンポーネント](https://developers.line.biz/ja/reference/messaging-api/#flex-component)
  - [ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)
  - [ボタン](https://developers.line.biz/ja/reference/messaging-api/#button)
  - [画像](https://developers.line.biz/ja/reference/messaging-api/#f-image)
  - [動画](https://developers.line.biz/ja/reference/messaging-api/#f-video)
  - [アイコン](https://developers.line.biz/ja/reference/messaging-api/#icon)
  - [テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)
  - [スパン](https://developers.line.biz/ja/reference/messaging-api/#span)
  - [セパレータ](https://developers.line.biz/ja/reference/messaging-api/#separator)
  - [フィラー](https://developers.line.biz/ja/reference/messaging-api/#filler)（非推奨）

<!-- parameter start (props: required) -->

type

String

`flex`

<!-- parameter end -->
<!-- parameter start (props: required) -->

altText

String

代替テキスト。ユーザーがメッセージを受信した際に、端末の通知やトークリスト、[引用メッセージ](https://developers.line.biz/ja/docs/messaging-api/sending-messages/#send-quote-messages)でFlex Messageの代替として表示されます。\
最大文字数：1500

<!-- parameter end -->
<!-- parameter start (props: required) -->

contents

Object

Flex Messageの[コンテナ](https://developers.line.biz/ja/reference/messaging-api/#container)

<!-- parameter end -->

_Flex Messageの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "flex",
  "altText": "this is a flex message",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "hello"
        },
        {
          "type": "text",
          "text": "world"
        }
      ]
    }
  }
}
```

<!-- tab end -->

</code-tabs>

#### 動作環境

Flex Messageは、すべてのバージョンのLINEでサポートされます。なお、以下の機能は、LINEの特定のバージョンのみサポートしています。

| 機能                                                                                                                                                                                                                                                                                                                                                                                                                  | iOS版LINE<br>Android版LINE | PC版LINE<br>（macOS版、Windows版） |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------: | :--------------------------------: |
| <ul><li>[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)の`maxWidth`プロパティ</li><li>[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)の`maxHeight`プロパティ</li><li>[テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)の`lineSpacing`プロパティ</li><li>[動画](https://developers.line.biz/ja/reference/messaging-api/#f-video) ※1</li></ul> |        11.22.0以上         |             7.7.0以上              |
| <ul><li>[バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)の`size`プロパティの`deca`と`hecto` ※2</li><li>[ボタン](https://developers.line.biz/ja/reference/messaging-api/#button)、[テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)、および[アイコン](https://developers.line.biz/ja/reference/messaging-api/#icon)の`scaling`プロパティ</li></ul>                    |         13.6.0以上         |             7.17.0以上             |

※1 動画をサポートしていないLINEのバージョンにおいてもコンテンツを適切に表示するには、`altContent`プロパティを指定します。このプロパティで指定した画像が動画の代わりに表示されます。

※2 LINEのバージョンが`deca`と`hecto`をサポートするバージョンに満たない場合、バブルのサイズは`kilo`として表示されます。

#### コンテナ

コンテナは、Flex Messageの最上位の構造です。以下のタイプのコンテナを利用できます。

- [バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)
- [カルーセル](https://developers.line.biz/ja/reference/messaging-api/#f-carousel)

コンテナのJSONデータのサンプルや用途については、『Messaging APIドキュメント』の「[Flex Messageの要素](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/)」を参照してください。

##### バブル

1つのメッセージバブルを構成するコンテナです。ヘッダー、ヒーロー、ボディ、およびフッターの4つのブロックを含めることができます。各ブロックの用途について詳しくは、『Messaging APIドキュメント』の「[ブロック](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/#block)」を参照してください。

バブルを定義するJSONデータの最大サイズは、30KBです。

<!-- parameter start (props: required) -->

type

String

`bubble`

<!-- parameter end -->
<!-- parameter start (props: optional) -->

size

String

バブルの大きさ。`nano`、`micro`、`deca`、`hecto`、`kilo`、`mega`、`giga`のいずれかの値を指定できます。デフォルト値は`mega`です。

`deca`、`hecto`を使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：13.6.0以降
- macOS版とWindows版のLINE：7.17.0以降

LINEのバージョンが`deca`と`hecto`をサポートするバージョンに満たない場合、バブルのサイズは`kilo`として表示されます。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

direction

String

テキストの書字方向と、水平ボックス内でコンポーネントを配置する向き。以下のいずれかの値を指定します。

- `ltr`：テキストは左横書き、コンポーネントは左から右に配置
- `rtl`：テキストは右横書き、コンポーネントは右から左に配置

デフォルト値は`ltr`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

header

Object

ヘッダー。[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

hero

Object

ヒーロー。[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)、[画像](https://developers.line.biz/ja/reference/messaging-api/#f-image)、[動画](https://developers.line.biz/ja/reference/messaging-api/#f-video)のいずれかを指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

body

Object

ボディ。[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

footer

Object

フッター。[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

styles

Object

各ブロックのスタイル。[バブルスタイル](https://developers.line.biz/ja/reference/messaging-api/#bubble-style)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

action

Object

バブルがタップされたときのアクション。[アクションオブジェクト](https://developers.line.biz/ja/reference/messaging-api/#action-objects)を指定します。

<!-- parameter end -->

_バブルの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "Header text"
      }
    ]
  },
  "hero": {
    "type": "image",
    "url": "https://example.com/flex/images/image.jpg"
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "Body text"
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "text",
        "text": "Footer text"
      }
    ]
  },
  "styles": {
    "comment": "See the example of a bubble style object"
  }
}
```

<!-- tab end -->

</code-tabs>

##### ブロックのスタイルを定義するオブジェクト

バブル内のブロックのスタイルは、以下の2つのオブジェクトを使って定義します。

_バブルスタイルとブロックスタイルの例_

<code-tabs>

<!-- tab start `json` -->

```json
  "styles": {
    "header": {
      "backgroundColor": "#00ffff"
    },
    "hero": {
      "separator": true,
      "separatorColor": "#000000"
    },
    "footer": {
      "backgroundColor": "#00ffff",
      "separator": true,
      "separatorColor": "#000000"
    }
  }
```

<!-- tab end -->

</code-tabs>

###### バブルスタイル

<!-- parameter start (props: optional) -->

header

Object

ヘッダーのスタイル。[ブロックスタイル](https://developers.line.biz/ja/reference/messaging-api/#block-style)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

hero

Object

ヒーローのスタイル。[ブロックスタイル](https://developers.line.biz/ja/reference/messaging-api/#block-style)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

body

Object

ボディのスタイル。[ブロックスタイル](https://developers.line.biz/ja/reference/messaging-api/#block-style)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

footer

Object

フッターのスタイル。[ブロックスタイル](https://developers.line.biz/ja/reference/messaging-api/#block-style)を指定します。

<!-- parameter end -->

###### ブロックスタイル

<!-- parameter start (props: optional) -->

backgroundColor

String

ブロックの背景色。16進数カラーコードで設定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

separator

Boolean

ブロックの上にセパレータを配置する場合は`true`を指定します。デフォルト値は`false`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

separatorColor

String

セパレータの色。16進数カラーコードで設定します。

<!-- parameter end -->

<!-- note start -->

**注意**

先頭のブロックの上にはセパレータを配置できません。

<!-- note end -->

##### カルーセル

カルーセルは、子要素として1つ以上のバブルを持つコンテナです。カルーセル内のバブルは、横にスクロールして閲覧できます。

カルーセルを定義するJSONデータの最大サイズは、50KBです。

<!-- parameter start (props: required) -->

type

String

`carousel`

<!-- parameter end -->
<!-- parameter start (props: required) -->

contents

Array of objects

このカルーセル内の[バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)。最大バブル数：12

<!-- parameter end -->

<!-- note start -->

**バブルの幅**

1つのカルーセルに、異なる幅（`size`プロパティ）のバブルを含めることはできません。バブルの幅は、カルーセルごとに揃えてください。

<!-- note end -->

<!-- tip start -->

**バブルの高さ**

カルーセルの中で最大の高さのバブルと一致するように、各バブルのボディが伸長します。ただし、ボディがないバブルの大きさは変わりません。

<!-- tip end -->

_カルーセルの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "carousel",
  "contents": [
    {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "First bubble"
          }
        ]
      }
    },
    {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Second bubble"
          }
        ]
      }
    }
  ]
}
```

<!-- tab end -->

</code-tabs>

#### コンポーネント

コンポーネントは、ブロックを構成する要素です。以下のコンポーネントを利用できます。

- [ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)
- [ボタン](https://developers.line.biz/ja/reference/messaging-api/#button)
- [画像](https://developers.line.biz/ja/reference/messaging-api/#f-image)
- [動画](https://developers.line.biz/ja/reference/messaging-api/#f-video)
- [アイコン](https://developers.line.biz/ja/reference/messaging-api/#icon)
- [テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)
- [スパン](https://developers.line.biz/ja/reference/messaging-api/#span)
- [セパレータ](https://developers.line.biz/ja/reference/messaging-api/#separator)
- [フィラー](https://developers.line.biz/ja/reference/messaging-api/#filler)（非推奨）

各コンポーネントのJSONデータのサンプルや用途については、『Messaging APIドキュメント』の「[Flex Messageの要素](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/)」と「[Flex Messageのレイアウト](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/)」を参照してください。

##### ボックス

ボックスは、水平または垂直のレイアウト方向を定義します。ボックスを含む、他のコンポーネントを含むことができます。

<!-- parameter start (props: required) -->

type

String

`box`

<!-- parameter end -->
<!-- parameter start (props: required) -->

layout

String

このボックス内のコンポーネントを配置する向き。詳しくは、『Messaging APIドキュメント』の「[ボックスコンポーネントの向き](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#box-component-orientation)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: required) -->

contents

Array of objects

このボックス内のコンポーネント。以下のコンポーネントを指定できます。

- `layout`プロパティが`horizontal`または`vertical`の場合：[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)、[ボタン](https://developers.line.biz/ja/reference/messaging-api/#button)、[画像](https://developers.line.biz/ja/reference/messaging-api/#f-image)、[テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)、[セパレータ](https://developers.line.biz/ja/reference/messaging-api/#separator)、および[フィラー](https://developers.line.biz/ja/reference/messaging-api/#filler)
- `layout`プロパティが`baseline`の場合：[アイコン](https://developers.line.biz/ja/reference/messaging-api/#icon)、[テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)、および[フィラー](https://developers.line.biz/ja/reference/messaging-api/#filler)

なお、配列に指定した順に描画されます。空配列を指定することもできます。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

backgroundColor

String

ボックスの背景色。RGBカラーに加えて、アルファチャネル（透明度）も設定できます。16進数カラーコードで設定します。（例：#RRGGBBAA）デフォルト値は`#00000000`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

borderColor

String

ボックスの境界線の色。16進数カラーコードで設定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

borderWidth

String

ボックスの境界線の太さ。ピクセルまたは`none`、`light`、`normal`、`medium`、`semi-bold`、`bold`のいずれかの値を指定できます。`none`では、境界線は描画されず、それ以外は列挙した順に太くなります。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

cornerRadius

String

ボックスの境界線の角を丸くするときの半径。ピクセル、または`none`、`xs`、`sm`、`md`、`lg`、`xl`、`xxl`のいずれかの値を指定できます。`none`では、角は丸くならず、それ以外は列挙した順に半径が大きくなります。デフォルト値は`none`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

width

String

ボックスの幅。%（親要素の幅を基準にした割合）またはピクセルを指定します。詳しくは、『Messaging APIドキュメント』の「[ボックスの幅](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#box-width)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

maxWidth

String

ボックスの最大幅。%（親要素の幅を基準にした割合）またはピクセルを指定します。詳しくは、『Messaging APIドキュメント』の「[ボックスの最大幅](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#box-max-width)」を参照してください。

このプロパティを使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：11.22.0以降
- macOS版とWindows版のLINE：7.7.0以降

<!-- parameter end -->
<!-- parameter start (props: optional) -->

height

String

ボックスの高さ。%（親要素の高さを基準にした割合）またはピクセルを指定します。詳しくは、『Messaging APIドキュメント』の「[ボックスの高さ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#box-height)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

maxHeight

String

ボックスの最大高。%（親要素の高さを基準にした割合）またはピクセルを指定します。詳しくは、『Messaging APIドキュメント』の「[ボックスの最大高](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#box-max-height)」を参照してください。

このプロパティを使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：11.22.0以降
- macOS版とWindows版のLINE：7.7.0以降

<!-- parameter end -->
<!-- parameter start (props: optional) -->

flex

Number

親要素内での、このコンポーネントの幅または高さの比率。詳しくは、『Messaging APIドキュメント』の「[コンポーネントのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

spacing

String

このボックス内のコンポーネント間の最小スペース。デフォルト値は`none`です。詳しくは、『Messaging APIドキュメント』の「[ボックスの`spacing`プロパティ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#spacing-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

margin

String

親要素内での、このコンポーネントの前に挿入する余白の最小サイズ。詳しくは、『Messaging APIドキュメント』の「[コンポーネントの`margin`プロパティ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#margin-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

paddingAll

String

このボックスの境界線と、子要素の間の余白。詳しくは、『Messaging APIドキュメント』の「[ボックスのパディングで子コンポーネントを配置する](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#padding-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

paddingTop

String

このボックスの上端の境界線と、子要素の上端の間の余白。詳しくは、『Messaging APIドキュメント』の「[ボックスのパディングで子コンポーネントを配置する](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#padding-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

paddingBottom

String

このボックスの下端の境界線と、子要素の下端の間の余白。詳しくは、『Messaging APIドキュメント』の「[ボックスのパディングで子コンポーネントを配置する](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#padding-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

paddingStart

String

- [バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)の書字方向がLTRの場合：このボックスの左端の境界線と、子要素の左端の間の余白
- [バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)の書字方向がRTLの場合：このボックスの右端の境界線と、子要素の右端の間の余白

詳しくは、『Messaging APIドキュメント』の「[ボックスのパディングで子コンポーネントを配置する](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#padding-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

paddingEnd

String

- [バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)の書字方向がLTRの場合：このボックスの右端の境界線と、子要素の右端の間の余白
- [バブル](https://developers.line.biz/ja/reference/messaging-api/#bubble)の書字方向がRTLの場合：このボックスの左端の境界線と、子要素の左端の間の余白

詳しくは、『Messaging APIドキュメント』の「[ボックスのパディングで子コンポーネントを配置する](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#padding-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

position

String

このボックスを配置する際の基準位置。以下のいずれかの値を指定します。

- `relative`：直前のボックスを基準にします。
- `absolute`：親要素の左上を基準にします。

デフォルト値は`relative`です。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetTop

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetBottom

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetStart

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetEnd

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

action

Object

タップされたときのアクション。[アクションオブジェクト](https://developers.line.biz/ja/reference/messaging-api/#action-objects)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

justifyContent

String

親要素の主軸に沿った子要素の配置。親要素が水平ボックスの場合、子要素の`flex`プロパティを0に指定したときのみ動作します。詳しくは、『Messaging APIドキュメント』の「[余白を使った子コンポーネントの配置](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#justify-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

alignItems

String

親要素の交差軸に沿った子要素の配置。詳しくは、『Messaging APIドキュメント』の「[余白を使った子コンポーネントの配置](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#justify-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

background.type

String

背景の種類。以下の値を指定します。

- `linearGradient`：線形グラデーション。詳しくは、『Messaging APIドキュメント』の「[線形グラデーション背景](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#linear-gradient-bg)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

background.angle

String

線形グラデーションの勾配の角度。0度以上、360度未満の範囲で、`90deg`（90度）や`23.5deg`（23.5度）のように整数または小数で角度を指定します。`0deg`は下から上、`45deg`は左下から右上、`90deg`は左から右、`180deg`は上から下のように数字が増えると時計回りで角度が変わります。詳しくは、『Messaging APIドキュメント』の「[線形グラデーションの角度](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#linear-gradient-bg-angle)」を参照してください。

`background.type`が`linearGradient`の場合は必須です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

background.startColor

String

グラデーションの開始点の色。`#RRGGBB`または`#RRGGBBAA`のような16進数カラーコードで設定します。

`background.type`が`linearGradient`の場合は必須です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

background.endColor

String

グラデーションの終了点の色。`#RRGGBB`または`#RRGGBBAA`のような16進数カラーコードで設定します。

`background.type`が`linearGradient`の場合は必須です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

background.centerColor

String

グラデーションの中間色。`#RRGGBB`または`#RRGGBBAA`のような16進数カラーコードで設定します。`background.centerColor`を指定すると3色のグラデーションになります。詳しくは、『Messaging APIドキュメント』の「[グラデーションの中間色](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#linear-gradient-bg-center-color)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

background.centerPosition

String

中間色の位置。開始点の`0%`から、終了点の`100%`の範囲で整数または小数を指定します。デフォルト値は`50%`です。詳しくは、『Messaging APIドキュメント』の「[グラデーションの中間色](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#linear-gradient-bg-center-color)」を参照してください。

<!-- parameter end -->

_ボックスの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "bubble",
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "image",
        "url": "https://example.com/flex/images/image.jpg"
      },
      {
        "type": "separator"
      },
      {
        "type": "text",
        "text": "Text in the box"
      },
      {
        "type": "box",
        "layout": "vertical",
        "contents": [],
        "width": "30px",
        "height": "30px",
        "background": {
          "type": "linearGradient",
          "angle": "90deg",
          "startColor": "#FFFF00",
          "endColor": "#0080ff"
        }
      }
    ],
    "height": "400px",
    "justifyContent": "space-evenly",
    "alignItems": "center"
  }
}
```

<!-- tab end -->

</code-tabs>

##### ボタン

ボタンを描画するコンポーネントです。ユーザーが、ボタンをタップしたときに実行される、[アクション](https://developers.line.biz/ja/docs/messaging-api/actions/)を指定できます。

<!-- parameter start (props: required) -->

type

String

`button`

<!-- parameter end -->
<!-- parameter start (props: required) -->

action

Object

タップされたときのアクション。[アクションオブジェクト](https://developers.line.biz/ja/reference/messaging-api/#action-objects)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

flex

Number

親要素内での、このコンポーネントの幅または高さの比率。水平ボックス内のコンポーネントでは、`flex`プロパティのデフォルト値は`1`です。垂直ボックス内のコンポーネントでは、`flex`プロパティのデフォルト値は`0`です。詳しくは、『Messaging APIドキュメント』の「[コンポーネントのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

margin

String

親要素内での、このコンポーネントの前に挿入する余白の最小サイズ。詳しくは、『Messaging APIドキュメント』の「[コンポーネントの`margin`プロパティ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#margin-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

position

String

`offsetTop`、`offsetBottom`、`offsetStart`、`offsetEnd`の基準。以下のいずれかの値を指定します。

- `relative`：直前のボックスを基準にします。
- `absolute`：親要素の左上を基準にします。

デフォルト値は`relative`です。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetTop

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetBottom

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetStart

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetEnd

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

height

String

ボタンの高さ。`sm`または`md`のいずれかの値を指定できます。デフォルト値は`md`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

style

String

ボタンの表示形式。以下のいずれかの値を指定します。

- `primary`：濃色のボタン向けのスタイル
- `secondary`：淡色のボタン向けのスタイル
- `link`：HTMLのリンクのスタイル。

デフォルト値は`link`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

color

String

`style`プロパティが`link`の場合は文字の色。`style`プロパティが`primary`または`secondary`の場合は背景色です。16進数カラーコードで設定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

gravity

String

垂直方向の位置合わせ方式。詳しくは、『Messaging APIドキュメント』の「[テキスト、画像、ボタンを垂直方向に整列させる](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#gravity-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

adjustMode

String

テキストのフォントサイズを調整する方式。以下の値を指定します。

- `shrink-to-fit`：コンポーネントの幅に合わせて自動縮小されます。このプロパティはベストエフォートで機能しますので、プラットフォームによって動作が異なる、あるいは動作しないことがあります。詳しくは、『Messaging APIドキュメント』の「[フォントサイズの自動縮小](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#adjusts-fontsize-to-fit)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

scaling

Boolean

`true`を指定すると、LINEアプリのフォントサイズ設定に応じて、テキストのフォントサイズが自動的に拡大縮小されます。デフォルト値は`false`です。詳しくは、『Messaging APIドキュメント』の「[フォントサイズ設定に応じたサイズへの拡大縮小](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#size-scaling)」を参照してください。

このプロパティを使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：13.6.0以降
- macOS版とWindows版のLINE：7.17.0以降

<!-- parameter end -->

_ボタンの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "button",
  "action": {
    "type": "uri",
    "label": "Tap me",
    "uri": "https://example.com"
  },
  "style": "primary",
  "color": "#0000ff"
}
```

<!-- tab end -->

</code-tabs>

##### 画像

画像を描画するコンポーネントです。

<!-- parameter start (props: required) -->

type

String

`image`

<!-- parameter end -->
<!-- parameter start (props: required) -->

url

String

画像のURL（最大文字数：2000）\
プロトコル：HTTPS（TLS 1.2以降）\
画像フォーマット：JPEGまたはPNG\
最大画像サイズ：1024 x 1024ピクセル\
最大ファイルサイズ：10MB（`animated`プロパティが`true`の場合は300KB）

URLはUTF-8を用いてパーセントエンコードしてください。詳しくは、「[リクエストボディのプロパティに指定するURLのエンコードについて](https://developers.line.biz/ja/reference/messaging-api/#url-encoding)」を参照してください。

<!-- tip start -->

**推奨ファイルサイズ**

メッセージの表示が遅延することを防ぐために、個々の画像ファイルサイズを小さくしてください（1MB以下推奨）。

<!-- tip end -->

<!-- parameter end -->
<!-- parameter start (props: optional) -->

flex

Number

親要素内での、このコンポーネントの幅または高さの比率。詳しくは、『Messaging APIドキュメント』の「[コンポーネントのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

margin

String

親要素内での、このコンポーネントの前に挿入する余白の最小サイズ。詳しくは、『Messaging APIドキュメント』の「[コンポーネントの`margin`プロパティ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#margin-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

position

String

`offsetTop`、`offsetBottom`、`offsetStart`、`offsetEnd`の基準。以下のいずれかの値を指定します。

- `relative`：直前のボックスを基準にします。
- `absolute`：親要素の左上を基準にします。

デフォルト値は`relative`です。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetTop

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetBottom

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetStart

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetEnd

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

align

String

水平方向の位置合わせ方式。詳しくは、『Messaging APIドキュメント』の「[テキストや画像を水平方向に整列させる](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#align-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

gravity

String

垂直方向の位置合わせ方式。詳しくは、『Messaging APIドキュメント』の「[テキスト、画像、ボタンを垂直方向に整列させる](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#gravity-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

size

String

画像の幅の最大サイズ。デフォルト値は`md`です。詳しくは、『Messaging APIドキュメント』の「[画像のサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#image-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

aspectRatio

String

画像のアスペクト比。`{幅}:{高さ}`の形式で指定します。`{幅}`と`{高さ}`は、それぞれ1～100000の値で入力します。ただし、`{高さ}`には`{幅}`の3倍を超える値は指定できません。デフォルト値は`1:1`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

aspectMode

String

画像のアスペクト比と`aspectRatio`プロパティで指定されるアスペクト比が一致しない場合の、画像の表示方式。詳しくは、「[描画領域について](https://developers.line.biz/ja/reference/messaging-api/#drawing-area)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

backgroundColor

String

画像の背景色。16進数カラーコードで設定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

action

Object

タップされたときのアクション。[アクションオブジェクト](https://developers.line.biz/ja/reference/messaging-api/#action-objects)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

animated

Boolean

`true`を指定すると画像（APNG）のアニメーションを再生します。メッセージ全体で10枚の画像まで`true`を指定できます。上限を超えて指定した場合、メッセージは送信できません。デフォルト値は`false`です。データサイズが300KBを超える場合は再生されません。

<!-- parameter end -->

<!-- tip start -->

**アニメーション画像の作成方法**

アニメーションの画像はAPNG作成ツールを使用して作成してください。APNGの作成方法は、アニメーションスタンプの作成方法を参考にしてください。詳しくは、LINE Creators Marketにあるアニメーションスタンプの[制作ガイドライン](https://creator.line.me/ja/guideline/animationsticker/)を参照してください。

<!-- tip end -->

<!-- note start -->

**アニメーション画像が再生されないときは？**

「画像は表示されるがアニメーションが再生されない」というときは、以下を確認してください。

- `animated`プロパティの値を`true`にしているか
- 画像のデータサイズが300KB以下か

またメッセージを受信したLINEアプリの設定に起因して、アニメーションが再生されない場合もあります。併せて以下も確認してください。

- LINEアプリの設定で`GIF自動再生`がオンになっているか

アニメーションはAPNGの`acTL`チャンクの`num_plays`フィールドで指定した回数分、ループ再生されます。0を指定することで無限にループ再生も可能です。

<!-- note end -->

_画像の例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "image",
  "url": "https://example.com/flex/images/image.jpg",
  "size": "full",
  "aspectRatio": "1.91:1"
}
```

<!-- tab end -->

</code-tabs>

###### 描画領域について

`size`プロパティで画像の最大の幅を指定し、`aspectRatio`プロパティで画像のアスペクト比（幅：高さの比率）を指定します。`size`プロパティと`aspectRatio`プロパティで決定される矩形の領域を、**描画領域**と呼びます。この描画領域に画像が表示されます。

- `flex`プロパティによって算出された[コンポーネントの幅](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-size)が、`size`プロパティで指定された画像の幅よりも小さい場合、描画領域の幅はコンポーネントの幅に縮小されます。
- 画像のアスペクト比と`aspectRatio`プロパティで指定されるアスペクト比が一致しない場合、`aspectMode`プロパティに基づいて画像が表示されます。デフォルト値は`fit`です。
  - `aspectMode`が`cover`の場合：描画領域全体に画像を表示します。描画領域に収まらない部分は切り詰められます。
  - `aspectMode`が`fit`の場合：描画領域に画像全体を表示します。縦長の画像では左右に、横長の画像では上下に背景が表示されます。

##### 動画

動画を描画するコンポーネントです。

動画を使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：11.22.0以降
- macOS版とWindows版のLINE：7.7.0以降

LINEのバージョンが動画をサポートするバージョンに満たない場合、動画の`altContent`プロパティに指定したコンポーネントが代替コンテンツとして表示されます。

<!-- note start -->

**動画が正しく再生できない**

動画を含むメッセージの送信に成功したとしても、ユーザーの端末上で動画を正しく再生できない場合があります。詳しくは、FAQの「[メッセージとして送信した動画が再生できないのはなぜですか？](https://developers.line.biz/ja/faq/#why-cant-i-play-a-video-i-sent)」を参照してください。

<!-- note end -->

<!-- note start -->

**動画のアスペクト比**

一定以上に縦長・横長の動画を送信した場合、一部の環境では動画の一部が欠けて表示される場合があります。

また、`url`プロパティで指定する動画のアスペクト比と、以下の2つのアスペクト比は一致させてください。アスペクト比が異なると、予期せぬレイアウトになることがあります。

- `aspectRatio`プロパティで指定するアスペクト比
- `previewUrl`プロパティで指定するプレビュー画像のアスペクト比

![LINEのトークルームの動画。アスペクト比16:9の映像の背面に、アスペクト比1:1のプレビュー映像が表示されています。](https://developers.line.biz/media/messaging-api/messages/image-overlapping-ja.png)

<!-- note end -->

<!-- note start -->

**動画コンポーネントの使用条件**

動画コンポーネントを使うには、以下の条件をすべて満たす必要があります。

- 動画コンポーネントをヒーローの[ブロック](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/#block)直下に指定する。
- バブルの`size`プロパティに`kilo` `mega` `giga`のいずれかを指定する。
- バブルがカルーセルの子要素ではない。

<!-- note end -->

<!-- parameter start (props: required) -->

type

String

`video`

<!-- parameter end -->
<!-- parameter start (props: required) -->

url

String

動画ファイルのURL（最大文字数：2000）\
プロトコル：HTTPS（TLS 1.2以降）\
動画フォーマット：mp4\
最大ファイルサイズ：200MB

URLはUTF-8を用いてパーセントエンコードしてください。詳しくは、「[リクエストボディのプロパティに指定するURLのエンコードについて](https://developers.line.biz/ja/reference/messaging-api/#url-encoding)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: required) -->

previewUrl

String

プレビュー画像のURL（最大文字数：2000）\
プロトコル：HTTPS（TLS 1.2以降）\
画像フォーマット：JPEGまたはPNG\
最大ファイルサイズ：1MB

URLはUTF-8を用いてパーセントエンコードしてください。詳しくは、「[リクエストボディのプロパティに指定するURLのエンコードについて](https://developers.line.biz/ja/reference/messaging-api/#url-encoding)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: required) -->

altContent

component

代替コンテンツ。動画コンポーネントをサポートするバージョン未満のLINEで表示されます。[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)または[画像](https://developers.line.biz/ja/reference/messaging-api/#f-image)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

aspectRatio

String

動画のアスペクト比。`{幅}:{高さ}`の形式で指定します。`{幅}`と`{高さ}`は、それぞれ1～100000の値で入力します。ただし、`{高さ}`には`{幅}`の3倍を超える値は指定できません。デフォルト値は`1:1`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

action

Object

[URIアクション](https://developers.line.biz/ja/reference/messaging-api/#uri-action)。詳しくは、『Messaging APIドキュメント』の「[URIアクション](https://developers.line.biz/ja/docs/messaging-api/create-flex-message-including-video/#uri-action)」を参照してください。

<!-- parameter end -->

_動画の例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "bubble",
  "size": "mega",
  "hero": {
    "type": "video",
    "url": "https://example.com/video.mp4",
    "previewUrl": "https://example.com/video_preview.jpg",
    "altContent": {
      "type": "image",
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover",
      "url": "https://example.com/image.jpg"
    },
    "aspectRatio": "20:13"
  }
}
```

<!-- tab end -->

</code-tabs>

##### アイコン

隣接するテキストを装飾するために、アイコンを描画するコンポーネントです。このコンポーネントは、[ベースラインボックス](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#baseline-box)内でのみ使用できます。

<!-- parameter start (props: required) -->

type

String

`icon`

<!-- parameter end -->
<!-- parameter start (props: required) -->

url

String

画像のURL（最大文字数：2000）\
プロトコル：HTTPS（TLS 1.2以降）\
画像フォーマット：JPEGまたはPNG\
最大画像サイズ：1024 x 1024ピクセル\
最大ファイルサイズ：1MB

URLはUTF-8を用いてパーセントエンコードしてください。詳しくは、「[リクエストボディのプロパティに指定するURLのエンコードについて](https://developers.line.biz/ja/reference/messaging-api/#url-encoding)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

margin

String

親要素内での、このコンポーネントの前に挿入する余白の最小サイズ。詳しくは、『Messaging APIドキュメント』の「[コンポーネントの`margin`プロパティ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#margin-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

position

String

`offsetTop`、`offsetBottom`、`offsetStart`、`offsetEnd`の基準。以下のいずれかの値を指定します。

- `relative`：直前のボックスを基準にします。
- `absolute`：親要素の左上を基準にします。

デフォルト値は`relative`です。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetTop

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetBottom

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetStart

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetEnd

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

size

String

アイコンの幅の最大サイズ。デフォルト値は`md`です。詳しくは、『Messaging APIドキュメント』の「[アイコン、テキスト、スパンのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#other-component-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

scaling

Boolean

`true`を指定すると、LINEアプリのフォントサイズ設定に応じて、アイコンが自動的に拡大縮小されます。デフォルト値は`false`です。詳しくは、『Messaging APIドキュメント』の「[フォントサイズ設定に応じたサイズへの拡大縮小](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#size-scaling)」を参照してください。

このプロパティを使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：13.6.0以降
- macOS版とWindows版のLINE：7.17.0以降

<!-- parameter end -->
<!-- parameter start (props: optional) -->

aspectRatio

String

アイコンのアスペクト比。`{幅}:{高さ}`の形式で指定します。`{幅}`と`{高さ}`は、それぞれ1～100000の値で入力します。ただし、`{高さ}`には`{幅}`の3倍を超える値は指定できません。デフォルト値は`1:1`です。

<!-- parameter end -->

アイコンの`flex`プロパティの値は、`0`に固定されます。

_アイコンの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "icon",
  "url": "https://example.com/icon/png/caution.png",
  "size": "lg",
  "aspectRatio": "1.91:1"
}
```

<!-- tab end -->

</code-tabs>

##### テキスト

文字列を描画するコンポーネントです。色、サイズ、および太さを指定できます。

<!-- parameter start (props: required) -->

type

String

`text`

<!-- parameter end -->
<!-- parameter start (props: optional) -->

text

String

テキスト。`text`プロパティまたは`contents`プロパティのいずれかを必ず設定してください。`contents`プロパティを設定すると、`text`は無視されます。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

contents

Array of objects

[スパン](https://developers.line.biz/ja/reference/messaging-api/#span)の配列。`text`プロパティまたは`contents`プロパティのいずれかを必ず設定してください。`contents`プロパティを設定すると、`text`は無視されます。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

adjustMode

String

テキストのフォントサイズを調整する方式。以下の値を指定します。

- `shrink-to-fit`：コンポーネントの幅に合わせて自動縮小されます。このプロパティはベストエフォートで機能しますので、プラットフォームによって動作が異なる、あるいは動作しないことがあります。詳しくは、『Messaging APIドキュメント』の「[フォントサイズの自動縮小](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#adjusts-fontsize-to-fit)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

flex

Number

親要素内での、このコンポーネントの幅または高さの比率。詳しくは、『Messaging APIドキュメント』の「[コンポーネントのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

margin

String

親要素内での、このコンポーネントの前に挿入する余白の最小サイズ。詳しくは、『Messaging APIドキュメント』の「[コンポーネントの`margin`プロパティ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#margin-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

position

String

`offsetTop`、`offsetBottom`、`offsetStart`、`offsetEnd`の基準。以下のいずれかの値を指定します。

- `relative`：直前のボックスを基準にします。
- `absolute`：親要素の左上を基準にします。

デフォルト値は`relative`です。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetTop

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetBottom

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetStart

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

offsetEnd

String

オフセット。詳しくは、『Messaging APIドキュメント』の「[オフセット](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-offset)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

size

String

フォントサイズ。デフォルト値は`md`です。詳しくは、『Messaging APIドキュメント』の「[アイコン、テキスト、スパンのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#other-component-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

scaling

Boolean

`true`を指定すると、LINEアプリのフォントサイズ設定に応じて、テキストのフォントサイズが自動的に拡大縮小されます。デフォルト値は`false`です。詳しくは、『Messaging APIドキュメント』の「[フォントサイズ設定に応じたサイズへの拡大縮小](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#size-scaling)」を参照してください。

このプロパティが`true`の場合、`contents`プロパティで指定した[スパン](https://developers.line.biz/ja/reference/messaging-api/#span)のテキストも、フォントサイズが自動的に拡大縮小されます。

このプロパティを使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：13.6.0以降
- macOS版とWindows版のLINE：7.17.0以降

<!-- parameter end -->
<!-- parameter start (props: optional) -->

align

String

水平方向の位置合わせ方式。詳しくは、『Messaging APIドキュメント』の「[テキストや画像を水平方向に整列させる](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#align-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

gravity

String

垂直方向の位置合わせ方式。デフォルト値は`top`です。詳しくは、『Messaging APIドキュメント』の「[テキスト、画像、ボタンを垂直方向に整列させる](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#gravity-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

wrap

Boolean

`true`を指定するとテキストを折り返します。デフォルト値は`false`です。`true`に設定した場合、改行文字（`\n`）を使って改行できます。詳しくは、『Messaging APIドキュメント』の「[テキストを折り返す](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/#text-wrap)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

lineSpacing

String

折り返したテキスト内の行間。0より大きい整数または小数をピクセルで指定します。開始行の上部と最終行の下部には適用されません。詳しくは、『Messaging APIドキュメント』の「[テキスト内の行間を広げる](https://developers.line.biz/ja/docs/messaging-api/flex-message-elements/#text-line-spacing)」を参照してください。

このプロパティを使用できるLINEのバージョンは以下のとおりです。

- iOS版とAndroid版のLINE：11.22.0以降
- macOS版とWindows版のLINE：7.7.0以降

<!-- parameter end -->
<!-- parameter start (props: optional) -->

maxLines

Number

最大行数。テキストがこの行数に収まらない場合は、最終行の末尾に省略記号（…）が表示されます。`0`ではすべてのテキストが表示されます。デフォルト値は`0`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

weight

String

フォントの太さ。`regular`、`bold`のいずれかの値を指定できます。`bold`を指定すると太字になります。デフォルト値は`regular`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

color

String

フォントの色。16進数カラーコードで設定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

action

Object

タップされたときのアクション。[アクションオブジェクト](https://developers.line.biz/ja/reference/messaging-api/#action-objects)を指定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

style

String

テキストのスタイル。以下のいずれかの値を指定します。

- `normal`：標準
- `italic`：斜体デフォルト

値は`normal`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

decoration

String

テキストの装飾。以下のいずれかの値を指定します。

- `none`：装飾なし
- `underline`：下線
- `line-through`：取り消し線

デフォルト値は`none`です。

<!-- parameter end -->

_テキストの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "text",
  "text": "Hello, World!",
  "size": "xl",
  "weight": "bold",
  "color": "#0000ff"
}
```

<!-- tab end -->

</code-tabs>

##### スパン

スタイルが異なる複数の文字列を描画するコンポーネントです。色、サイズ、太さ、および装飾を指定できます。スパンは、[テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)の`contents`プロパティに設定します。

<!-- parameter start (props: required) -->

type

String

`span`

<!-- parameter end -->
<!-- parameter start (props: optional) -->

text

String

テキスト。親のテキストの`wrap`プロパティを`true`に設定した場合は、改行文字（`\n`）を使って改行できます。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

color

String

フォントの色。16進数カラーコードで設定します。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

size

String

フォントサイズ。詳しくは、『Messaging APIドキュメント』の「[アイコン、テキスト、スパンのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#other-component-size)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

weight

String

フォントの太さ。`regular`、`bold`のいずれかの値を指定できます。`bold`を指定すると太字になります。デフォルト値は`regular`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

style

String

テキストのスタイル。以下のいずれかの値を指定します。

- `normal`：標準
- `italic`：斜体

デフォルト値は`normal`です。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

decoration

String

テキストの装飾。以下のいずれかの値を指定します。

- `none`：装飾なし
- `underline`：下線
- `line-through`：取り消し線

デフォルト値は`none`です。

<!-- note start -->

**注意**

[テキスト](https://developers.line.biz/ja/reference/messaging-api/#f-text)の`decoration`プロパティで設定した装飾は、スパンの`decoration`プロパティで上書きできません。

<!-- note end -->

<!-- parameter end -->

_スパンの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "span",
  "text": "蛙",
  "size": "xxl",
  "weight": "bold",
  "style": "italic",
  "color": "#4f8f00"
}
```

<!-- tab end -->

</code-tabs>

##### セパレータ

[ボックス](https://developers.line.biz/ja/reference/messaging-api/#box)内に分割線を描画するコンポーネントです。水平ボックスに含めた場合は垂直線、垂直ボックスに含めた場合は水平線が描画されます。

<!-- parameter start (props: required) -->

type

String

`separator`

<!-- parameter end -->
<!-- parameter start (props: optional) -->

margin

String

親要素内での、このコンポーネントの前に挿入する余白の最小サイズ。詳しくは、『Messaging APIドキュメント』の「[コンポーネントの`margin`プロパティ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#margin-property)」を参照してください。

<!-- parameter end -->
<!-- parameter start (props: optional) -->

color

String

セパレータの色。16進数カラーコードで設定します。

<!-- parameter end -->

_セパレータの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "separator",
  "color": "#000000"
}
```

<!-- tab end -->

</code-tabs>

##### フィラー

<!-- warning start -->

**フィラーは非推奨のコンポーネントです**

スペースを作るには、フィラーの代わりに各コンポーネントのプロパティを使用してください。詳しくは、『Messaging APIドキュメント』の「[コンポーネントの位置](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-position)」を参照してください。

<!-- warning end -->

スペースを作るためのコンポーネントです。ボックス内のコンポーネントの間、前、または後にスペースを入れることができます。

<!-- parameter start (props: required) -->

type

String

`filler`

<!-- parameter end -->
<!-- parameter start (props: optional) -->

flex

Number

親要素内での、このコンポーネントの幅または高さの比率。詳しくは、『Messaging APIドキュメント』の「[コンポーネントのサイズ](https://developers.line.biz/ja/docs/messaging-api/flex-message-layout/#component-size)」を参照してください。

<!-- parameter end -->

フィラーでは親要素の`spacing`プロパティが無視されます。

_フィラーの例_

<code-tabs>

<!-- tab start `json` -->

```json
{
  "type": "filler"
}
```

<!-- tab end -->

</code-tabs>
