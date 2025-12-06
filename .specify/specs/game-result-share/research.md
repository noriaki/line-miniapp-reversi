# Research & Design Decisions

## Summary

- **Feature**: `game-result-share`
- **Discovery Scope**: Complex Integration（既存システム拡張 + 外部API統合）
- **Key Findings**:
  - LIFF `shareTargetPicker()` はFlex Message形式でURIアクションのみ使用可能
  - Web Share APIはファイル共有時に`files`プロパティのみを使用する必要がある
  - html2canvasによるクライアントサイド画像生成は外部リソースに制限がある
  - 静的エクスポート環境では、画像アップロード用のサーバーレスAPI（Cloudflare R2 + Workers または Vercel Blob）が必要

## Research Log

### LIFF shareTargetPicker API

- **Context**: LINEシェア機能の実装方法を調査
- **Sources Consulted**:
  - [LIFF v2 API Reference](https://developers.line.biz/en/reference/liff/)
  - [LIFF Share Target Picker Documentation](https://developers.line.biz/en/docs/liff/developing-liff-apps/)
- **Findings**:
  - `liff.shareTargetPicker(messages, options)` で最大5メッセージを送信可能
  - Template Message / Flex Message では **URIアクションのみ** 使用可能
  - `liff.isApiAvailable("shareTargetPicker")` で事前に利用可否を確認
  - LINE 10.3.0以降で対応（iOS/Android両対応）
  - 成功時は `{ status: "success" }` を返す Promise
  - ユーザーキャンセル時は値なしで resolve
- **Implications**:
  - Flex Messageのボタンアクションは全てURI形式で設計する
  - LINEログイン状態を確認してからAPI呼び出しを行う
  - `isApiAvailable` による事前チェックを実装する

### Web Share API File Sharing

- **Context**: OS標準シェア機能でファイル共有する方法を調査
- **Sources Consulted**:
  - [MDN Web Docs - Navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
  - [Web Share API - W3C](https://www.w3.org/TR/web-share/)
  - [Can I Use - Web Share](https://caniuse.com/web-share)
- **Findings**:
  - `navigator.canShare()` でファイル共有可否を事前確認
  - ファイル共有時は **`files` プロパティのみ使用**（他プロパティ併用するとテキストのみ共有される問題あり）
  - ユーザーアクション（ボタンクリック等）からのみ呼び出し可能
  - 対応ブラウザ: Chrome (Desktop/Android), Safari (macOS/iOS), Edge, Firefox (partial)
  - Image, Video, Audio, Text ファイル共有可能
- **Implications**:
  - ファイルと テキストを別々にシェアする設計は避け、画像内にテキスト情報を含める
  - `navigator.canShare` で機能検出し、非対応環境ではボタン非表示
  - Blobからファイルオブジェクトを生成して共有

### Canvas Image Generation (html2canvas)

- **Context**: ゲーム盤面を画像として生成する方法を調査
- **Sources Consulted**:
  - [html2canvas - GitHub](https://github.com/niklasvh/html2canvas)
  - [Export React components as images using html2canvas](https://blog.logrocket.com/export-react-components-as-images-html2canvas/)
- **Findings**:
  - クライアントサイドでDOM要素を Canvas に描画し、画像（PNG/JPEG）を生成
  - TypeScript 対応（型定義パッケージあり）
  - `scale` オプションで解像度調整可能（`scale: 2` で2倍解像度）
  - **制限**: 外部オリジンの画像は描画されない（CORSプロキシ必要）
  - **制限**: ビューポート外の要素は描画されない
  - **制限**: 一部のCSS（backdrop-filter等）は非対応
- **Implications**:
  - シェア用画像は専用のDOM要素として構築し、html2canvasでキャプチャ
  - プロフィール画像などの外部リソースは含めない設計とする
  - 固定サイズでレンダリングし、一貫した画像品質を確保

### Image Upload & Storage

- **Context**: 生成した画像を外部ストレージにアップロードする方法を調査
- **Sources Consulted**:
  - [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
  - [Uploading Files to Cloudflare R2 with Pre-Signed URLs](https://ruanmartinelli.com/blog/cloudflare-r2-pre-signed-urls/)
- **Findings**:
  - Cloudflare R2: S3互換API、Presigned URLでブラウザから直接アップロード可能
  - Vercel Blob: サーバーレス環境向けファイルストレージ（Next.js統合）
  - Presigned URL生成にはサーバーサイド処理（Workers / API Route）が必要
  - CORS設定が必要（`AllowedMethods: ["PUT"]`, `AllowedHeaders: ["Content-Type"]`）
  - Content-Lengthによるサイズ検証は信頼性が低い（セキュリティ考慮）
- **Implications**:
  - Next.js静的エクスポート（`output: 'export'`）環境のため、外部サービスでAPI提供が必要
  - Cloudflare Workers + R2 の組み合わせを推奨（既存インフラ親和性）
  - 画像URLの有効期限・パブリックアクセス設定の検討が必要

## Architecture Pattern Evaluation

| Option                               | Description                                                   | Strengths                        | Risks / Limitations                      | Notes        |
| ------------------------------------ | ------------------------------------------------------------- | -------------------------------- | ---------------------------------------- | ------------ |
| Client-side Canvas + External Upload | html2canvasで画像生成し、Presigned URLでR2/Blobにアップロード | シンプル、静的サイトと互換性高い | アップロード用API別途必要、CORS設定      | 推奨パターン |
| Server-side Image Generation         | サーバーで画像を生成（Puppeteer等）                           | 一貫した品質、外部リソース使用可 | 静的エクスポートと非互換、インフラコスト | 不採用       |
| Data URL Inline                      | Base64エンコードで画像をインライン化                          | アップロード不要                 | Flex Messageサイズ制限、パフォーマンス   | 不採用       |

## Design Decisions

### Decision: クライアントサイド画像生成 + 外部ストレージアップロード

- **Context**: ゲーム終了時の盤面画像をシェア可能なURL形式で提供する必要がある
- **Alternatives Considered**:
  1. Server-side Puppeteer — 静的エクスポートと非互換
  2. Data URL inline — Flex Messageサイズ制限（約5KB）に抵触
  3. Screenshot API service — 外部依存・コスト増
- **Selected Approach**: html2canvasでクライアント側生成 → Cloudflare R2にPresigned URLでアップロード
- **Rationale**: 既存の静的エクスポート構成を維持しつつ、シェア画像URLを実現可能
- **Trade-offs**:
  - 追加インフラ（Cloudflare Workers + R2）が必要
  - 初回シェア時にアップロード待ち時間発生（UX考慮必要）
- **Follow-up**: Workers / R2 のインフラセットアップは別途実施

### Decision: Flex Message構造（Hero Image + Body + Action Button）

- **Context**: LINEシェアで視覚的に魅力的なコンテンツを送信する
- **Alternatives Considered**:
  1. Image Message only — テキスト・ボタン追加不可
  2. Template Message — デザインの自由度が低い
  3. Flex Message — カスタマイズ性高、URIアクション対応
- **Selected Approach**: Flex Message（Bubble）形式でHero画像 + Bodyテキスト + Footerボタン
- **Rationale**: ブランディング、招待文、アプリ起動ボタンを1メッセージに統合可能
- **Trade-offs**: Flex Message構造の複雑さ、デバッグの難しさ
- **Follow-up**: Flex Message Simulator でプレビュー確認

### Decision: シェアボタンの配置と表示制御

- **Context**: ゲーム終了時のUIにシェアボタンを追加する
- **Alternatives Considered**:
  1. 単一シェアボタン（LINE優先）— OS標準シェア未対応
  2. 2ボタン並列表示 — 明確な選択肢提供
  3. ドロップダウン/モーダル選択 — 追加タップ必要
- **Selected Approach**: 2ボタン並列表示（「LINEでシェア」「その他でシェア」）
- **Rationale**: LINE優先しつつ、Web Share API対応環境では代替手段を提供
- **Trade-offs**: ボタン2つ分のスペース消費、Web Share非対応時は1ボタン表示
- **Follow-up**: Web Share API非対応時のボタン非表示ロジック実装

## Risks & Mitigations

- **画像アップロード失敗** — リトライ機能 + ローカルダウンロードへのフォールバック
- **LINEログイン未完了でのシェア試行** — ログイン誘導フローを実装
- **html2canvas描画の不整合** — 固定サイズの専用DOM要素を用意し、複雑なCSSを避ける
- **Presigned URLの有効期限切れ** — 短い有効期限（15分）+ シェア時に新規URL取得
- **外部ストレージコスト** — R2無料枠（10GB/月）で開始、使用量監視

## References

- [LIFF v2 API Reference](https://developers.line.biz/en/reference/liff/) — shareTargetPicker仕様
- [MDN - Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) — ブラウザシェア機能
- [html2canvas - GitHub](https://github.com/niklasvh/html2canvas) — Canvas画像生成ライブラリ
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) — ストレージアップロード
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/) — Flex Message設計ツール
