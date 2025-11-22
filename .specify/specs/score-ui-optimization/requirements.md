# Requirements Document

## Project Description (Input)

スコア表示部分のUIを最適化

- LINE(LIFF)の `displayName` テキストは不要なので削除
- スコア(Stone Count)UIの並び順は左から 黒石アイコン(またはユーザプロフィールアイコン) 黒石数 vs 白石数 白石アイコン

## はじめに

本要件定義は、リバーシゲームのスコア表示UIを最適化し、ユーザーにとってよりシンプルで視覚的に理解しやすいインターフェースを提供することを目的とします。LINE統合環境において不要な情報を削減し、スコア表示の視認性を向上させます。

## Requirements

### Requirement 1: displayName テキスト表示の削除

**Objective:** As a ゲームプレイヤー, I want スコア表示エリアからdisplayNameテキストを削除する, so that 視覚的なノイズを減らしゲーム盤面に集中できる

#### Acceptance Criteria

1. WHERE スコア表示コンポーネントが表示されている場合 THE Score UI SHALL displayNameテキスト要素を含まない
2. WHEN ゲーム画面がロードされた THEN Score UI SHALL displayNameテキストなしでレンダリングされる
3. IF LIFF環境でdisplayNameが取得可能な場合でも THEN Score UI SHALL displayNameテキストを表示しない

### Requirement 2: スコア表示の順序最適化

**Objective:** As a ゲームプレイヤー, I want スコア表示が左から「黒石アイコン→黒石数→vs→白石数→白石アイコン」の順序で表示される, so that スコアを直感的に理解できる

#### Acceptance Criteria

1. WHEN スコア表示がレンダリングされる THEN Score UI SHALL 左から順に黒石アイコン、黒石数、vsテキスト、白石数、白石アイコンの順序で要素を配置する
2. WHERE 黒石プレイヤーがユーザーである場合 THE Score UI SHALL 黒石アイコン位置にユーザープロフィールアイコンを表示する
3. WHERE 白石プレイヤーがユーザーである場合 THE Score UI SHALL 白石アイコン位置にユーザープロフィールアイコンを表示する
4. IF ユーザープロフィールアイコンが利用不可の場合 THEN Score UI SHALL デフォルトの石アイコンを表示する

### Requirement 3: 視覚的配置とスタイリング

**Objective:** As a ゲームプレイヤー, I want スコア表示要素が視覚的に明確に配置される, so that ゲーム中に素早くスコアを確認できる

#### Acceptance Criteria

1. WHEN スコア要素が表示される THEN Score UI SHALL 各要素間に適切な視覚的スペーシングを提供する
2. WHERE スマートフォン画面で表示される場合 THE Score UI SHALL タッチ操作に干渉しない配置を維持する
3. WHEN スコア数値が更新される THEN Score UI SHALL 新しいスコア値をアニメーションなしで即座に反映する
4. WHERE 画面幅が異なるデバイスで表示される場合 THE Score UI SHALL レスポンシブに配置を調整する

### Requirement 4: アイコン表示ロジック

**Objective:** As a 開発者, I want プロフィールアイコンと石アイコンの表示ロジックが明確に定義される, so that 一貫した表示動作を保証できる

#### Acceptance Criteria

1. IF LIFF環境でプロフィール画像URLが取得可能な場合 THEN Score UI SHALL ユーザー側の石位置にプロフィールアイコンを使用する
2. IF プロフィール画像の読み込みに失敗した場合 THEN Score UI SHALL フォールバックとしてデフォルト石アイコンを表示する
3. WHEN ユーザーがAI対戦を行っている THEN Score UI SHALL ユーザー側のみプロフィールアイコンを使用し、AI側は常に石アイコンを使用する
4. WHERE 非LIFF環境で動作している場合 THE Score UI SHALL 両サイドとも石アイコンを表示する

### Requirement 5: 既存機能の保持

**Objective:** As a ゲームプレイヤー, I want UI最適化後も既存のスコア機能が正常に動作する, so that ゲームプレイに支障がない

#### Acceptance Criteria

1. WHEN 石が配置される THEN Score UI SHALL リアルタイムでスコアカウントを更新する
2. WHEN ゲームが終了する THEN Score UI SHALL 最終スコアを正確に表示する
3. IF ゲームがリセットされる場合 THEN Score UI SHALL 初期スコア(黒:2、白:2)を表示する
4. WHERE エラーハンドリングが必要な場合 THE Score UI SHALL 既存のエラーバウンダリ内で動作する

## 非機能要件

### パフォーマンス

1. WHEN スコアUIコンポーネントがレンダリングされる THEN Score UI SHALL 16ms以内(60fps)でレンダリングを完了する
2. WHERE スコア更新が発生する場合 THE Score UI SHALL 不要な再レンダリングを避けるためメモ化を使用する

### アクセシビリティ

1. WHERE スクリーンリーダーが使用される場合 THE Score UI SHALL 各スコア要素に適切なaria-label属性を提供する
2. WHEN キーボード操作が行われる THEN Score UI SHALL フォーカス順序を論理的に維持する

### 互換性

1. WHERE 既存のテストスイートが実行される場合 THE Score UI SHALL 全てのユニットテストとE2Eテストをパスする
2. IF 新しいUIコンポーネントが追加される場合 THEN Score UI SHALL 対応するテストケースを含む

## 技術的制約

- Next.js 15.x App Router環境での動作を保証
- Tailwind CSSを使用したスタイリング
- TypeScript strict modeでの型安全性維持
- React 18.xのClient Componentとして実装
- 既存のLIFF Provider統合を破壊しない

## 成功指標

- displayNameテキストが完全に削除され視覚的ノイズが減少
- スコア表示順序が仕様通りに実装され、ユーザーテストで理解しやすさが向上
- 全ての既存テストがパスし、新機能に対するテストカバレッジが90%以上
- モバイルデバイスでのレスポンシブ表示が正常に動作
