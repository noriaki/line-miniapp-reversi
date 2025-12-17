# ゲーム結果シェア機能（OG画像生成方式）

リバーシゲーム終了時に、盤面状態をURLエンコードしたシェア専用ページを生成し、LINEのFlex MessageまたはOS標準のWeb Share APIを通じてシェアする機能。

## 技術アプローチ

- 盤面状態を16バイト（ビットボード方式）でエンコードし、Base64URL形式の22文字としてURLに埋め込む
- シェアページ `/share/[encodedState]` でNext.js `ImageResponse` によるサーバーサイドOG画像生成
- 外部ストレージ（R2等）不要、画像はオンデマンド生成

## 制約

- LINEミニアプリ（LIFF SDK）環境
- Flex Message形式でのLINEシェア
- Web Share APIはURL+テキストのみ（画像Blobは使用しない）
- Next.js App Router + Vercelデプロイ
