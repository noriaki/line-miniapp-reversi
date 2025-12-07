# Research & Design Decisions

## Summary

- **Feature**: `game-result-share-v2`
- **Discovery Scope**: Extension（既存システムへの機能追加）
- **Key Findings**:
  - Next.js `ImageResponse` は flexbox レイアウトのみサポート（`display: grid` 非対応）
  - ISR は `generateStaticParams` が空配列を返すことで、ビルド時生成なし・リクエスト時生成が可能
  - LIFF `shareTargetPicker()` は Flex Message を含む複数のメッセージ形式をサポート

## Research Log

### Next.js ImageResponse の制約と仕様

- **Context**: OG画像生成における技術制約の確認
- **Sources Consulted**:
  - [Next.js Functions: ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response)
  - [Metadata Files: opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
  - [Getting Started: Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- **Findings**:
  - ImageResponse は `@vercel/og`、Satori、Resvg を使用して HTML/CSS を PNG に変換
  - **サポートされるCSS**: flexbox、absolute positioning、カスタムフォント、text wrapping、centering、nested images
  - **非サポート**: `display: grid`、高度なレイアウト
  - バンドルサイズ上限: 500KB（JSX, CSS, フォント, 画像含む）
  - フォント形式: ttf, otf, woff（パース速度の観点から ttf/otf 推奨）
  - 出力形式: PNG（デフォルト）、1200x630px（OGP標準）
  - 日本語フォント: 外部フォントファイル読み込み必要（Noto Sans JP 等）
- **Implications**:
  - 盤面描画は flexbox で実現可能（8x8 グリッドを flex-wrap で表現）
  - 日本語テキストには Google Fonts 等から Noto Sans JP を読み込む必要あり
  - カスタムフォント読み込みはバンドルサイズに影響するため、必要最小限のウェイトを選択

### Next.js 16 ISR（Incremental Static Regeneration）

- **Context**: 結果ページのキャッシュ戦略の決定
- **Sources Consulted**:
  - [Next.js Guides: ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
  - [Next.js Functions: generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
  - [Next.js Guides: Caching](https://nextjs.org/docs/app/guides/caching)
- **Findings**:
  - `generateStaticParams` が空配列を返す場合、ビルド時には何も生成されない
  - `dynamicParams: true`（デフォルト）で未知のパスもリクエスト時に生成・キャッシュ
  - `revalidate` を設定しない場合、無期限キャッシュとなる
  - Full Route Cache はデプロイ時にクリアされる（Next.js の仕様）
  - ISR は `output: 'export'`（静的エクスポート）と非互換
- **Implications**:
  - `next.config.ts` から `output: 'export'` を削除する必要あり
  - 盤面データは URL にエンコードされており不変のため、無期限キャッシュが最適
  - デプロイごとにキャッシュがクリアされるため、デザイン変更は自動的に反映

### Next.js 16 Dynamic Route Parameters

- **Context**: Next.js 16 での params の取り扱い方法の確認
- **Sources Consulted**:
  - [Next.js App Router Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- **Findings**:
  - Next.js 16 では `params` は Promise として渡される
  - `await params` でパラメータを取得する必要あり
  - 型定義: `params: Promise<{ side: string; encodedState: string }>`
- **Implications**:
  - ページコンポーネントと `opengraph-image.tsx` の両方で `await params` パターンを使用

### LIFF shareTargetPicker API

- **Context**: LINE シェア機能の実装方法の確認
- **Sources Consulted**:
  - [LIFF v2 API reference](https://developers.line.biz/en/reference/liff/)
  - [LIFF Release notes](https://developers.line.biz/en/docs/liff/release-notes/)
- **Findings**:
  - LIFF SDK 最新バージョン: 2.27.3（2025/11/17 リリース）
  - `liff.shareTargetPicker()` は Text, Image, Video, Audio, Location, Template, Flex Message をサポート
  - `liff.isApiAvailable('shareTargetPicker')` で API 利用可能性をチェック可能
  - Template message では URI action のみ設定可能
  - LINE Developers Console で「Agreement Regarding Use of Information」への同意が必要
  - `isMultiple` プロパティで複数送信先選択の有無を制御可能（デフォルト: true）
- **Implications**:
  - Flex Message 形式でシェアコンテンツを構築
  - API 利用可能性チェックを実装し、非対応環境でのエラーハンドリングを考慮
  - Hero 画像 URL は `/r/{side}/{encodedState}/opengraph-image` 形式

### Web Share API

- **Context**: LINE 以外のプラットフォームへのシェア機能の実装
- **Sources Consulted**:
  - [MDN Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
  - [MDN Navigator: share() method](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- **Findings**:
  - `navigator.share()` は URL、title、text、files を受け付ける
  - 少なくとも1つのプロパティが必要
  - Transient activation（ユーザーアクション）が必要
  - `navigator.canShare()` で事前検証可能
  - `web-share` Permissions Policy でゲートされる
- **Implications**:
  - URL + text のみでシェア（画像 Blob は複雑さのため不使用）
  - `navigator.canShare` でサポート確認し、非対応環境ではボタン非表示
  - ユーザーアクション（ボタンクリック）から呼び出す必要あり

### Base64URL エンコーディング

- **Context**: 盤面状態の URL セーフなエンコード方式の決定
- **Sources Consulted**:
  - [RFC 4648 - The Base16, Base32, and Base64 Data Encodings](https://tools.ietf.org/html/rfc4648)
  - [Base64 - Wikipedia](https://en.wikipedia.org/wiki/Base64)
  - [Stack Overflow: Base64URL decoding via JavaScript](https://stackoverflow.com/questions/5234581/base64url-decoding-via-javascript)
- **Findings**:
  - Base64URL は `+` を `-`、`/` を `_` に置換
  - パディング `=` は省略可能（長さが既知の場合）
  - 16 バイト = 128 ビット → Base64 で 22 文字（パディングなし）
  - 計算: `ceil(16 * 8 / 6) = ceil(21.33) = 22` 文字
  - Node.js v14.18.0+ では `Buffer.from(data).toString('base64url')` が利用可能
  - ブラウザでは `btoa()` + 文字置換 または `Uint8Array.toBase64()` (新しい API)
- **Implications**:
  - サーバーサイド（Next.js）: `Buffer.toString('base64url')` を使用
  - クライアントサイド: `btoa()` + 文字置換のフォールバック実装
  - 長さ検証: デコード時に 22 文字であることを確認

### TypeScript BigInt サポート

- **Context**: ビットボード演算に必要な BigInt の互換性確認
- **Sources Consulted**:
  - 既存の `tsconfig.json`（target: ES2017）
- **Findings**:
  - 現在の `target: ES2017` では BigInt のネイティブサポートが不十分
  - BigInt は ES2020 で正式サポート
  - BigInt リテラル（`123n`）の使用には ES2020+ が必要
- **Implications**:
  - `tsconfig.json` の `target` を `ES2020` 以上に変更する必要あり
  - または `lib` に `ES2020` を追加

## Architecture Pattern Evaluation

| Option              | Description                                      | Strengths                                       | Risks / Limitations                          | Notes                            |
| ------------------- | ------------------------------------------------ | ----------------------------------------------- | -------------------------------------------- | -------------------------------- |
| ISR + ImageResponse | Next.js 標準機能を活用したサーバーサイド画像生成 | 外部依存なし、キャッシュ効率良好、Vercel 最適化 | `output: 'export'` 削除が必要                | **採用** - 要件に最適            |
| html2canvas         | クライアントサイドでの画像生成                   | サーバー負荷なし                                | パフォーマンス問題、ブラウザ依存、OGP 非対応 | 却下                             |
| 外部ストレージ (R2) | 生成画像の永続化                                 | 高可用性                                        | 複雑さ増加、コスト発生、状態管理             | 却下（オーバーエンジニアリング） |

## Design Decisions

### Decision: ISR with Indefinite Cache

- **Context**: 結果ページのレンダリング戦略の決定
- **Alternatives Considered**:
  1. Static Export - ビルド時に全ページ生成（不可能：無限の盤面パターン）
  2. SSR - リクエストごとにサーバーレンダリング（非効率）
  3. ISR with revalidate - 定期的なキャッシュ更新（不要：盤面データは不変）
- **Selected Approach**: ISR with Indefinite Cache（`revalidate` 未設定）
- **Rationale**: 盤面データは URL にエンコードされており不変。一度生成されたページは永続的にキャッシュ可能。デプロイ時にキャッシュクリアされるため、デザイン更新も問題なし。
- **Trade-offs**:
  - Benefit: 最高のパフォーマンス、サーバー負荷最小化
  - Compromise: `output: 'export'` 削除による既存ビルドパイプラインへの影響
- **Follow-up**: Vercel へのデプロイ動作確認

### Decision: Bitboard + Base64URL Encoding

- **Context**: 盤面状態を URL に埋め込む形式の決定
- **Alternatives Considered**:
  1. JSON Base64 - 可読性あり、サイズ大（約 100+ 文字）
  2. 64 文字の文字列 - 各セルを 1 文字で表現（64 文字）
  3. Bitboard + Base64URL - 2 つの 64-bit 値を 16 バイトで表現（22 文字）
- **Selected Approach**: Bitboard + Base64URL（22 文字）
- **Rationale**: URL の短さは UX に直結。ビットボードは既存のリバーシ実装で広く使用されるパターン。22 文字は SNS シェア時の文字数制限にも余裕あり。
- **Trade-offs**:
  - Benefit: 最短の URL 表現、効率的なストレージ
  - Compromise: BigInt 演算が必要（ES2020+ 必要）、実装の複雑さ
- **Follow-up**: `tsconfig.json` の `target` 更新

### Decision: Side Parameter in URL

- **Context**: プレイヤーの手番（先攻/後攻）の表現方法
- **Alternatives Considered**:
  1. URL パラメータ: `/r/[encodedState]?side=b`
  2. パスパラメータ: `/r/[side]/[encodedState]`
  3. エンコード状態に含める: 盤面データ + 1 ビット
- **Selected Approach**: パスパラメータ `/r/[side]/[encodedState]`
- **Rationale**: パスベースの方がキャッシュ効率が良い（異なる URL = 異なるキャッシュエントリ）。また、OGP では side は含めないため、パス構造で明確に分離。
- **Trade-offs**:
  - Benefit: キャッシュ効率、URL 構造の明確さ
  - Compromise: 同じ盤面でも side ごとに別ページとしてキャッシュ
- **Follow-up**: なし

### Decision: App Router Directory Migration

- **Context**: 現在 `/app/` にある App Router を `/src/app/` に移動
- **Alternatives Considered**:
  1. `/app/` のまま維持 - 既存構造を変更しない
  2. `/src/app/` へ移動 - プロジェクト全体の一貫性
- **Selected Approach**: `/src/app/` へ移動
- **Rationale**: 他のすべてのソースコードが `/src/` 配下にあり、一貫性を保つため。Next.js は両方のディレクトリ構造をサポート。
- **Trade-offs**:
  - Benefit: ディレクトリ構造の一貫性
  - Compromise: 既存ファイルの移動、import パスの更新不要（`@/` エイリアス使用）
- **Follow-up**: CI/CD パイプラインへの影響確認

### Decision: OG Image Without Player Side

- **Context**: OG 画像にプレイヤー情報（side）を含めるかどうか
- **Alternatives Considered**:
  1. side 含める - プレイヤー視点の画像
  2. side 含めない - 汎用的な盤面画像
- **Selected Approach**: side を含めない汎用画像
- **Rationale**: OG 画像は SNS のプレビューカードとして使用される。誰がシェアしたかに関係なく、同じ盤面なら同じ画像を表示することで、キャッシュ効率が向上。プレイヤー視点の表示は結果ページ（HTML）で対応。
- **Trade-offs**:
  - Benefit: キャッシュ効率（同じ盤面 = 同じ画像）
  - Compromise: プレイヤー視点のプレビューは不可
- **Follow-up**: なし

## Risks & Mitigations

- **Risk 1**: `output: 'export'` 削除による既存デプロイへの影響
  - **Mitigation**: Vercel は両方のモードをサポート。ローカルビルドの `out/` ディレクトリ生成は不要になるが、Vercel デプロイには影響なし。CI/CD パイプラインの確認が必要。

- **Risk 2**: BigInt 演算のブラウザ互換性
  - **Mitigation**: ES2020 以降のブラウザで広くサポート。LINE アプリ内ブラウザ（WebView）は Chrome/Safari ベースであり、BigInt をサポート。念のため、対象ブラウザでの動作確認を実施。

- **Risk 3**: 日本語フォント読み込みによるOG画像生成パフォーマンス
  - **Mitigation**: Noto Sans JP の必要なウェイトのみ読み込み。Google Fonts CDN からの読み込みをキャッシュ。初回アクセスのみ遅延があるが、ISR キャッシュにより 2 回目以降は即座にレスポンス。

- **Risk 4**: 不正なエンコード文字列によるエラー
  - **Mitigation**: デコード時に厳密なバリデーション（長さチェック、Base64URL 文字チェック、ビットボード整合性チェック）を実装。不正な場合はエラーページへ誘導。

## References

- [Next.js Functions: ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response) - OG 画像生成 API
- [Next.js Guides: ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration) - ISR 設定ガイド
- [LIFF v2 API reference](https://developers.line.biz/en/reference/liff/) - LIFF SDK API リファレンス
- [MDN Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) - Web Share API 仕様
- [RFC 4648](https://tools.ietf.org/html/rfc4648) - Base64URL エンコーディング仕様
