# 設計ガイダンス: ゲーム結果シェア機能

このドキュメントは `/kiro:spec-design` エージェントが最適な技術設計を導出するためのガイダンスです。

---

## 技術的前提条件

### 確定している技術選択

| 項目           | 選択                     | 理由                                   |
| -------------- | ------------------------ | -------------------------------------- |
| 画像生成       | Next.js `ImageResponse`  | サーバーサイド生成、外部ストレージ不要 |
| 盤面エンコード | ビットボード + Base64URL | 16バイト→22文字で十分短い              |
| シェアページ   | `/share/[encodedState]`  | 動的ルートでOG画像・メタデータ生成     |
| Web Share      | URL + テキストのみ       | 画像Blobは複雑さ増加のため不採用       |

### 削除される技術要素

- html2canvas（クライアントサイド画像生成）
- Cloudflare R2（外部画像ストレージ）
- Presigned URL API
- PendingShareStorage（sessionStorageでのログインリダイレクト間状態保持）

---

## 追加調査すべき事項

### 1. ImageResponse の制約確認

Next.js公式ドキュメントで以下を確認:

- サポートされるCSS（flexboxのサブセットのみ）
- 最大バンドルサイズ（500KB制限）
- フォント使用方法（システムフォント vs カスタムフォント）
- 日本語テキストのレンダリング

**調査方法**: `nextjs_docs` で ImageResponse のドキュメントを取得

### 2. LINE Flex Message の画像URL要件

- HTTPSが必須か
- 画像URLの有効期限制限はあるか
- アスペクト比の制約
- `aspectMode: "fit"` vs `"cover"` の挙動

**調査方法**: LINE Developers ドキュメント、既存の flex-message-builder.ts 参照

### 3. OGP メタデータの最適化

- `og:image` の推奨サイズ
- LINE内でのOGP表示挙動
- Twitter Card との互換性

---

## 詳細検討すべき設計ポイント

### 1. ビットボードエンコード/デコード

```
検討事項:
- BigInt演算のブラウザ互換性（ES2020+）
- エンディアン（リトルエンディアン推奨）
- Base64URL（パディングなし）の実装
- 不正なエンコード文字列の検証方法
```

### 2. OG画像レイアウト

```
検討事項:
- 1200x630px内での盤面サイズ最適化
- 石の描画方法（グラデーション、影）
- テキスト配置（勝敗、スコア、ブランド名）
- ImageResponse CSSの制約内でのスタイリング
```

### 3. シェアフローの状態管理

```
検討事項:
- useShare フックの状態モデル簡素化
- isSharing フラグの排他制御
- エラーハンドリング戦略
```

### 4. Flex Message 構造

```
検討事項:
- Hero画像のURL形式（/share/xxx/opengraph-image）
- Body部分の3カラムレイアウト（勝者表示）
- Footer CTAボタンの遷移先
- altText の内容
```

---

## アーキテクチャ境界の検討

### コンポーネント責務分離

```
UI Layer:
  - GameResultPanel: ゲーム終了UIの統合（既存拡張）
  - ShareButtons: シェアボタン表示

Hooks Layer:
  - useShare: シェア状態・操作管理（大幅簡素化）

Lib Layer:
  - board-encoder: エンコード/デコード（新規）
  - share-service: シェアロジック（簡素化）
  - flex-message-builder: Flex Message構築（修正）

App Routes:
  - /share/[encodedState]/page.tsx: シェアページ
  - /share/[encodedState]/opengraph-image.tsx: OG画像生成
```

### データフロー

```
ゲーム終了
    ↓
盤面エンコード (board-encoder)
    ↓
シェアURL生成 (/share/xxx)
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
| `/src/components/GameBoard.tsx` | ゲーム終了UI統合ポイント                           |

### 削除対象ファイル（参照用）

| ファイル                                  | 参照理由                       |
| ----------------------------------------- | ------------------------------ |
| `/src/components/ShareImagePreview.tsx`   | OGImageLayout のレイアウト参考 |
| `/src/lib/share/share-image-generator.ts` | 削除対象、移行確認             |

---

## テスト戦略の検討

### 単体テスト優先度

1. **高**: board-encoder（エンコード/デコードの可逆性）
2. **高**: OG画像生成（正常/異常エンコードでの動作）
3. **中**: flex-message-builder（構造検証）
4. **中**: useShare フック（状態遷移）

### E2Eテスト観点

- ゲーム終了 → シェアボタン表示
- LINEシェアフロー（モック環境）
- Web Shareフロー（対応環境）
- シェアページへの直接アクセス

---

## パフォーマンス考慮事項

| 処理             | 目標   | 対策                  |
| ---------------- | ------ | --------------------- |
| 盤面エンコード   | <10ms  | 軽量なBigInt演算      |
| OG画像生成       | <500ms | ImageResponseの最適化 |
| シェアページ表示 | <1s    | 軽量ページ構成        |

---

## セキュリティ考慮事項

- 盤面エンコードの改ざん: 黒∩白≠0 で検出可能（ただし致命的ではない）
- 不正URL: 404またはエラーページ表示
- XSS: ユーザー入力なし（盤面データのみ）
