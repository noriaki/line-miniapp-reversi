# 設計ガイダンス: ゲーム結果シェア機能

このドキュメントは `/kiro:spec-design` エージェントが最適な技術設計を導出するためのガイダンスです。

---

## 技術的前提条件

### 確定している技術選択

| 項目             | 選択                          | 理由                                                             |
| ---------------- | ----------------------------- | ---------------------------------------------------------------- |
| 画像生成         | Next.js `ImageResponse`       | サーバーサイド生成、外部ストレージ不要                           |
| 盤面エンコード   | ビットボード + Base64URL      | 16バイト→22文字で十分短い                                        |
| 結果ページ       | `/r/[side]/[encodedState]`    | 動的ルートでOG画像・メタデータ生成                               |
| Web Share        | URL + テキストのみ            | 画像Blobは複雑さ増加のため不採用                                 |
| ビルド設定       | `output: 'export'` を**削除** | 動的OG画像生成・ISRと非互換                                      |
| レンダリング方式 | **ISR（無期限キャッシュ）**   | 盤面データは不変、再デプロイでキャッシュクリア、高パフォーマンス |

### Next.js 設定変更（重要）

現在の `output: 'export'`（静的エクスポート）設定を削除し、ISRモードに変更する:

```diff
// next.config.ts
const nextConfig: NextConfig = {
-  output: 'export',
   // ... other config
};
```

**理由**:

- `opengraph-image.tsx` による動的OG画像生成は静的エクスポートと互換性がない
- ISR（Incremental Static Regeneration）は静的エクスポートでサポートされない
- Vercelへのデプロイは設定変更なしで継続可能

### ISR（無期限キャッシュ）の動作

```text
1. ユーザーが /r/b/ABC123 にアクセス（初回）
   → Next.js がページとOG画像を生成
   → Full Route Cache に保存

2. 別のユーザーが /r/b/ABC123 にアクセス（2回目以降）
   → キャッシュから即座に返却（サーバー処理なし）

3. 新しいバージョンをデプロイ
   → Full Route Cache がクリア（Next.js の仕様）

4. ユーザーが /r/b/ABC123 にアクセス（デプロイ後初回）
   → 新しいコードでページとOG画像を再生成
   → キャッシュに保存
```

**ポイント**:

- `generateStaticParams` は空配列を返す（ビルド時には何も生成しない）
- `dynamicParams: true`（デフォルト）で未知のパスも許可
- `revalidate` を設定しない = 無期限キャッシュ
- 盤面データはURLにエンコードされており不変なため、無期限キャッシュが最適

### 採用しない技術要素

以下は本機能では**採用しない**（現在コードベースに存在しない）:

- html2canvas（クライアントサイド画像生成）
- Cloudflare R2（外部画像ストレージ）
- Presigned URL API
- PendingShareStorage（sessionStorageでのログインリダイレクト間状態保持）

---

## ImageResponse の制約（Next.js 16 公式ドキュメントより）

### CSS サポート

| サポート状況   | 詳細                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| **サポート**   | flexbox、absolute positioning、カスタムフォント、text wrapping、centering、nested images |
| **非サポート** | `display: grid`、高度なレイアウト                                                        |

### その他の制約

| 制約           | 詳細                                                 |
| -------------- | ---------------------------------------------------- |
| バンドルサイズ | **最大 500KB**（JSX, CSS, フォント, 画像含む）       |
| フォント形式   | **ttf, otf, woff**（ttf/otf 推奨、パース速度のため） |
| 画像形式       | **PNG 出力**（デフォルト）                           |
| 画像サイズ     | **1200x630px**（OGP標準）                            |
| 日本語フォント | 外部フォントファイル読み込み必要（Noto Sans JP等）   |

### レンダリングエンジン

- `@vercel/og`、Satori、Resvg を使用してHTML/CSSをPNGに変換
- `ImageResponse` は Route Handler または `opengraph-image.tsx` で使用可能

---

## OG画像生成の実装パターン（Next.js 16）

### 基本構造

```typescript
// /src/app/r/[side]/[encodedState]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

// メタデータエクスポート
export const alt = 'リバーシ対戦結果'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 画像生成関数
export default async function Image({
  params,
}: {
  params: Promise<{ side: string; encodedState: string }>
}) {
  const { encodedState } = await params // Next.js 16: params は Promise

  // 盤面デコード
  const board = decodeBoard(encodedState)

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        // ... レイアウト
      }}>
        {/* 盤面描画 */}
      </div>
    ),
    { ...size }
  )
}
```

### 重要な注意点

1. **`params` は Promise**: Next.js 16 では `await params` が必要
2. **side 非依存**: OG画像は盤面とスコアのみ表示（プレイヤー情報なし）
3. **静的最適化**: デフォルトでビルド時生成＋キャッシュ（Dynamic API 未使用時）

---

## 結果ページの実装パターン（Next.js 16）

### ISR 設定

```typescript
// /src/app/r/[side]/[encodedState]/page.tsx

// ISR: ビルド時には何も生成しない
export async function generateStaticParams() {
  return []
}

// revalidate を設定しない = 無期限キャッシュ
// dynamicParams: true（デフォルト）= 未知のパスも許可

export default async function ResultPage({
  params,
}: {
  params: Promise<{ side: string; encodedState: string }>
}) {
  const { side, encodedState } = await params // Next.js 16: params は Promise

  // バリデーション
  if (!['b', 'w'].includes(side)) {
    // エラーページへ
  }

  // 盤面デコード
  const board = decodeBoard(encodedState)

  return (
    // 結果表示UI
  )
}
```

### メタデータ生成

```typescript
// /src/app/r/[side]/[encodedState]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ side: string; encodedState: string }>;
}): Promise<Metadata> {
  const { encodedState } = await params;
  const board = decodeBoard(encodedState);
  const { black, white } = countStones(board);

  return {
    title: `リバーシ対戦結果 - 黒 ${black} : 白 ${white}`,
    description: `対戦結果をシェアしよう！`,
    // og:image は opengraph-image.tsx から自動生成
  };
}
```

---

## LINE Flex Message の設計

### Hero画像URL

Next.js の `opengraph-image.tsx` は以下のパスで自動的に画像を提供:

```text
https://{domain}/r/{side}/{encodedState}/opengraph-image
```

**注意**:

- HTTPS 必須（Vercel デプロイでは自動対応）
- 画像URLに有効期限なし（オンデマンド生成のため）

### Flex Message 設計のポイント

```text
検討事項:
- Hero画像のURL形式: /r/[side]/[encodedState]/opengraph-image
- Body部分の3カラムレイアウト（勝者表示）
- Footer CTAボタンの遷移先
- altText の内容
- aspectMode: "cover" 推奨（1200x630 → 20:9）
```

---

## ビットボードエンコード/デコードの設計

### エンコード設計のポイント

```text
検討事項:
- BigInt演算のブラウザ互換性（ES2020+）
  → tsconfig.json の target 確認が必要
- エンディアン（リトルエンディアン推奨）
- Base64URL（パディングなし）の実装
- 不正なエンコード文字列の検証方法
```

### tsconfig.json の確認

BigInt を使用するため、以下の設定が必要:

```json
{
  "compilerOptions": {
    "target": "ES2020" // または "ESNext"
  }
}
```

---

## OG画像レイアウトの設計

### レイアウト設計のポイント

```text
検討事項:
- 1200x630px内での盤面サイズ最適化
- 石の描画方法（flexbox で実現可能な範囲）
  - グラデーション: radial-gradient の互換性確認
  - 影: box-shadow の互換性確認
- テキスト配置（勝敗、スコア、ブランド名）
- ImageResponse CSSの制約内でのスタイリング
- プレイヤー情報(side)は含めない（汎用画像として設計）
```

---

## シェアフローの状態管理

### 状態管理のポイント

```text
検討事項:
- useShare フックの状態モデル簡素化
- isSharing フラグの排他制御
- エラーハンドリング戦略
```

---

## 結果ページの表示切り替え

### 表示切り替えのポイント

```text
検討事項:
- sideパラメータ（b/w）に基づくプレイヤー/AI位置の切り替え
  - b（先攻/黒）: プレイヤーを上部（黒側）、AIを下部（白側）
  - w（後攻/白）: プレイヤーを下部（白側）、AIを上部（黒側）
- 不正なsideパラメータのバリデーション
```

---

## アーキテクチャ境界の検討

### コンポーネント責務分離

```text
App Routes (in /src/app/):
  - /src/app/r/[side]/[encodedState]/page.tsx: 結果ページ
  - /src/app/r/[side]/[encodedState]/opengraph-image.tsx: OG画像生成（side非依存）

UI Layer:
  - ResultPage: 結果表示 + シェアボタン統合（新規）
  - ShareButtons: シェアボタン表示（新規）
  - BoardDisplay: 盤面表示コンポーネント（GameBoardから抽出検討）

Hooks Layer:
  - useShare: シェア状態・操作管理（簡素化）

Lib Layer:
  - board-encoder: エンコード/デコード（新規）
  - share-service: シェアロジック（簡素化）
  - flex-message-builder: Flex Message構築（新規）

Game Page:
  - GameBoard: ゲーム終了時に結果ページへ自動遷移トリガーのみ追加
    ※ゲームページはプレイに集中、結果表示・シェア機能は含まない
```

### データフロー

```text
ゲーム終了
    ↓
自動遷移開始（500ms以内）
    ↓
盤面エンコード + side決定 (board-encoder)
    ↓
結果ページ /r/[side]/[encodedState] へ遷移
    ↓
┌─────────────────────────────────┐
│ 結果ページ表示                   │
│ - 盤面デコード・表示             │
│ - side に基づく配置切り替え       │
│ - スコア・勝敗表示               │
│ - シェアボタン表示               │
└─────────────────────────────────┘
    ↓
┌─────────────┬─────────────┐
│ LINEシェア   │ Web Share   │
│ Flex Message │ URL+テキスト │
└─────────────┴─────────────┘
    ↓
受信者がURLアクセス
    ↓
┌─────────────┬─────────────┐
│ OG画像取得   │ ページ表示   │
│ (bot/crawler)│ (ユーザー)  │
└─────────────┴─────────────┘
    ↓
ISRキャッシュ（無期限）
```

---

## 既存コードとの統合ポイント

### 参照すべきファイル

| ファイル                        | 参照理由                                           |
| ------------------------------- | -------------------------------------------------- |
| `/src/lib/game/types.ts`        | Board, Player, Cell型定義                          |
| `/src/hooks/useGameState.ts`    | gameStatus.type === 'finished' の判定              |
| `/src/hooks/useLiff.ts`         | liff.isLoggedIn(), liff.login(), shareTargetPicker |
| `/src/hooks/useMessageQueue.ts` | トースト通知パターン                               |
| `/src/components/GameBoard.tsx` | ゲーム終了時遷移トリガー追加ポイント               |

### ディレクトリ構造の統一

既存の `/app/` ディレクトリを `/src/app/` に移動し、プロジェクト全体で `/src/` 配下に統一する:

```text
/src/
├── app/           # App Router (移動)
│   ├── page.tsx
│   ├── layout.tsx
│   └── r/[side]/[encodedState]/
│       ├── page.tsx
│       └── opengraph-image.tsx
├── components/
├── hooks/
├── lib/
├── contexts/
└── types/
```

---

## テスト戦略の検討

### 単体テスト優先度

1. **高**: board-encoder（エンコード/デコードの可逆性）
2. **高**: OG画像生成（正常/異常エンコードでの動作）
3. **中**: flex-message-builder（構造検証）
4. **中**: useShare フック（状態遷移）

### 結果ページのテスト

結果ページ単体でのUI/UX検証は重要。テスト手法は設計フェーズでコード調査を踏まえて決定:

- 結果ページへの直接アクセス（正常/異常エンコード）
- sideパラメータに基づく表示切り替え
- シェアボタンの表示/非表示（Web Share API可用性）
- 「もう一度遊ぶ」ボタンの動作

### 手動検証項目

以下は実装の複雑さから手動検証とする:

- ゲーム終了 → 結果ページ自動遷移フロー
- LINEシェアフロー（LIFF環境依存）
- Web Shareフロー（デバイス依存）

---

## パフォーマンス考慮事項

| 処理              | 目標   | 対策                        |
| ----------------- | ------ | --------------------------- |
| 盤面エンコード    | <10ms  | 軽量なBigInt演算            |
| OG画像生成        | <500ms | ImageResponseの最適化       |
| 結果ページ表示    | <1s    | 軽量ページ構成              |
| 自動遷移開始      | <500ms | 要件通り                    |
| 2回目以降アクセス | <100ms | ISRキャッシュからの即座返却 |

---

## セキュリティ考慮事項

- 盤面エンコードの改ざん: 黒∩白≠0 で検出可能（ただし致命的ではない）
- 不正URL: 404またはエラーページ表示
- 不正sideパラメータ: エラーページ表示
- XSS: ユーザー入力なし（盤面データのみ）
