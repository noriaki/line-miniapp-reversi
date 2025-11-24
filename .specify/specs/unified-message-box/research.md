# Research & Design Decisions

---

**Purpose**: 統一メッセージボックス機能の発見調査結果および設計決定の根拠を記録

**Usage**:

- 発見フェーズ中の調査活動と結果をログ
- `design.md`では詳細すぎる設計決定のトレードオフを文書化
- 将来の監査または再利用のための参照と証拠を提供

---

## Summary

- **Feature**: `unified-message-box`
- **Discovery Scope**: Extension（既存システムの拡張・リファクタリング）
- **Key Findings**:
  - 既存の`useGameErrorHandler`フックが基本的なメッセージ管理機能を実装済み
  - 現在のGameBoard.tsxでは複数箇所に分散したメッセージ表示が存在
  - 固定高さコンテナによるCLS対策が部分的に実装済み
  - React Context API + hooksパターンが推奨アプローチ

## Research Log

### 既存実装の分析

- **Context**: 統合前の現状把握のため、既存のメッセージ処理パターンを調査
- **Sources Consulted**:
  - `/src/hooks/useGameErrorHandler.ts`
  - `/src/components/GameBoard.tsx`
  - `/src/components/GameBoard.css`
- **Findings**:
  - `useGameErrorHandler`は既に以下の機能を提供:
    - 無効な手の警告メッセージ（2秒間の自動消去）
    - パス通知メッセージ（5秒間の自動消去）
    - ゲーム状態不整合の検出
  - GameBoard.tsx内に3種類の独立したメッセージ表示エリアが存在:
    - エラーメッセージ（赤色、条件付き表示）
    - パス通知メッセージ（黄色、固定高さh-16領域、opacity遷移）
    - 不整合エラー（赤色、リセットボタン付き、条件付き表示）
  - GameBoard.cssではopacity-based fade animationsを使用
- **Implications**:
  - 完全な新規実装ではなく、既存パターンの統合・拡張が必要
  - 固定高さによるCLS対策は既に部分的に実装されている
  - タイマー管理とuseRefパターンが確立されている

### React Message Queue Patterns

- **Context**: 統一メッセージボックスのための最適なアーキテクチャパターンの調査
- **Sources Consulted**:
  - [Notification System done in React(Typescript) including a Queue System](https://reactjsexample.com/notification-system-done-in-react-typescript-including-a-queue-system/)
  - [Building a reusable notification system with react hooks and context API](https://dev.to/kevjose/building-a-reusable-notification-system-with-react-hooks-and-context-api-2phj)
  - [react-notification-provider GitHub](https://github.com/anthonyshort/react-notification-provider)
  - [Implementing a Queue Manager with TypeScript and Design Patterns in React](https://blog.stackademic.com/implementing-a-queue-manager-with-typescript-and-design-patterns-in-react-with-real-example-fae8897e472d)
- **Findings**:
  - React Context API + hooksが最も一般的で再利用可能なパターン
  - 通知システムは状態(表示/非表示)を内部管理し、`add`/`remove`メソッドを公開
  - Observer PatternとSingleton Patternの組み合わせが推奨される
  - キュー管理には配列ベースの単純なFIFO構造で十分
- **Implications**:
  - 既存のhooksパターンに沿ってカスタムフック（`useMessageQueue`）を実装
  - Context APIは不要（このアプリケーションではGameBoardコンポーネントのみが使用）
  - 最新メッセージのみを表示する要件により、キュー管理は簡略化可能

### Zero-CLS Animation Techniques

- **Context**: レイアウトシフトを引き起こさないアニメーション手法の調査
- **Sources Consulted**:
  - [Preventing Layout Shifts: Mastering CSS Transitions and Animations](https://blog.pixelfreestudio.com/preventing-layout-shifts-mastering-css-transitions-and-animations/)
  - [How To Fix Cumulative Layout Shift (CLS) Issues — Smashing Magazine](https://www.smashingmagazine.com/2021/06/how-to-fix-cumulative-layout-shift-issues/)
  - [Do Javascript Animations Impact CLS?](https://isotropic.co/do-javascript-animations-impact-cls/)
  - [Layout Shift caused by CSS transitions](https://www.corewebvitals.io/pagespeed/layout-shift-caused-by-css-transitions)
- **Findings**:
  - `transform`プロパティと`opacity`はCLSに影響しない
  - `width`, `height`, `margin`, `padding`, `top`, `left`の変更はCLSを引き起こす
  - フェードアニメーションには`opacity`のみを使用すべき
  - 固定高さコンテナでレイアウト領域を事前確保することが重要
  - `transform: scale()`はリサイズアニメーションに安全
- **Implications**:
  - メッセージボックスは固定高さ（例: `h-16` = 4rem = 64px）を維持
  - 表示/非表示はopacity遷移のみで実現
  - アニメーション持続時間は0.3秒以下（要件通り）
  - 既存のGameBoard.cssパターンを踏襲

### TypeScript Discriminated Unions for Message Types

- **Context**: 型安全なメッセージタイプシステムの設計調査
- **Sources Consulted**:
  - [TypeScript Discriminated Unions for Robust React Components](https://medium.com/@uramanovich/typescript-discriminated-unions-for-robust-react-components-58bc06f37299)
  - [Expressive React Component APIs with Discriminated Unions](https://blog.andrewbran.ch/expressive-react-component-apis-with-discriminated-unions/)
  - [Type-Safe React: Harnessing the Power of Discriminated Unions](https://dev.to/gboladetrue/type-safe-react-harnessing-the-power-of-discriminated-unions-158m)
  - [TypeScript: Handbook - Unions and Intersection Types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
- **Findings**:
  - Discriminated Unions（判別共用体）は通知システムの標準パターン
  - `type`プロパティをdiscriminant（判別子）として使用
  - TypeScriptの型ナローイングにより型安全な分岐処理が可能
  - 通知システムでは`info`, `warning`, `error`, `success`が典型的
- **Implications**:
  - 要件では「通常メッセージ」と「警告メッセージ」の2種類を定義
  - `MessageType`型を`type: 'info' | 'warning'`として定義
  - 将来的な拡張性のため、`error`や`success`タイプも考慮した設計

## Architecture Pattern Evaluation

| Option                                 | Description                                             | Strengths                                                   | Risks / Limitations                                | Notes                                                      |
| -------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| Custom Hook Only                       | `useMessageQueue`のみ実装、Context不使用                | シンプル、既存パターンとの整合性、低オーバーヘッド         | グローバル共有は不可                               | ✅ **選択**: このアプリケーションでは単一コンポーネントのみが使用 |
| Context API + Custom Hook              | Context Providerでメッセージをグローバルステートとして管理 | コンポーネント間での共有が容易、再利用性が高い             | 過剰設計、不要な複雑性                             | 現在の要件では不要                                         |
| Redux / Zustand                        | グローバル状態管理ライブラリの使用                      | スケーラブル、デバッグツール充実                           | 外部依存追加、学習コスト、オーバーキル             | このシンプルな機能には不適切                               |
| Separate Component-level State         | MessageBoxコンポーネント内で独自にstate管理             | コンポーネントの完全な独立性                               | 外部からのメッセージ追加API提供が複雑化            | hooksパターンに反する                                      |

## Design Decisions

### Decision: Custom Hook Pattern (`useMessageQueue`)

- **Context**: メッセージキュー管理のためのアーキテクチャパターンの選択
- **Alternatives Considered**:
  1. Context API + Custom Hook — グローバル状態管理
  2. Redux/Zustand — サードパーティ状態管理
  3. Component-level State — MessageBox内部でのみ状態管理
- **Selected Approach**: Custom Hook Only（Context不使用）
- **Rationale**:
  - アプリケーション内でGameBoardコンポーネントのみがメッセージを発行
  - グローバル共有の必要性がない
  - 既存のhooksディレクトリパターン（`useGameState`, `useGameErrorHandler`）との整合性
  - プロジェクトの"Pure Logic vs. Stateful Hooks"原則に準拠
- **Trade-offs**:
  - **Benefits**: シンプルさ、低学習コスト、既存パターンとの整合性、ゼロ依存追加
  - **Compromises**: 複数コンポーネント間でのメッセージ共有は不可（現在は不要）
- **Follow-up**: 将来的に複数コンポーネントからのメッセージ発行が必要になった場合、Context APIへの移行を検討

### Decision: Single Message Display (Latest Only)

- **Context**: 要件3「新しいメッセージが5秒以内に発行された場合、現在表示中のメッセージを破棄し、新しいメッセージを優先表示する」
- **Alternatives Considered**:
  1. Queue Display — 複数メッセージをスタック表示
  2. Latest Only — 最新メッセージのみ表示
  3. Priority-based Queue — 優先度に基づくメッセージ管理
- **Selected Approach**: Latest Only（最新メッセージのみ）
- **Rationale**:
  - 要件で明確に指定されている
  - モバイル画面の限られた領域での視認性向上
  - ゲーム進行中の情報過多を防止
  - 実装がシンプルで保守性が高い
- **Trade-offs**:
  - **Benefits**: UXがシンプル、画面領域の節約、実装の単純化
  - **Compromises**: 連続した複数メッセージは表示されない（ユーザーが見逃す可能性）
- **Follow-up**: ユーザーフィードバックに基づき、将来的にメッセージ履歴機能を検討可能

### Decision: Fixed Height Container (64px)

- **Context**: CLS（Cumulative Layout Shift）を防ぐためのレイアウト戦略
- **Alternatives Considered**:
  1. Dynamic Height — メッセージ内容に応じて高さを変更
  2. Fixed Height (64px) — 固定高さでopacity遷移のみ
  3. Absolute Positioning — ページフローから除外
- **Selected Approach**: Fixed Height (64px)
- **Rationale**:
  - 既存のGameBoard.tsx（line 290）で`h-16`（64px）が使用されている
  - Web Vitalsのベストプラクティスに準拠
  - opacity遷移のみでCLS = 0を保証
  - モバイルデバイスでのタッチ可能な最小高さを確保
- **Trade-offs**:
  - **Benefits**: CLS完全防止、一貫したレイアウト、既存パターン踏襲
  - **Compromises**: 長文メッセージは切り詰め必須（`text-overflow: ellipsis`等で対応）
- **Follow-up**: 実装時に日本語テキストの切り詰め動作を検証

### Decision: Discriminated Union for Message Types

- **Context**: メッセージタイプの型安全な表現方法
- **Alternatives Considered**:
  1. Simple String Enum — `type: 'info' | 'warning'`のみ
  2. Discriminated Union — `type`プロパティを持つオブジェクト型
  3. Class Hierarchy — MessageBaseクラスの継承
- **Selected Approach**: Discriminated Union
- **Rationale**:
  - TypeScript strict modeでの型安全性確保（要件6.4）
  - React/TypeScriptコミュニティの標準パターン
  - 将来的な拡張（`error`, `success`タイプ等）が容易
  - パターンマッチングによる網羅性チェック
- **Trade-offs**:
  - **Benefits**: 型安全性、拡張性、コンパイル時エラー検出
  - **Compromises**: 初見での複雑度がわずかに上昇（ただしTypeScriptの標準パターン）
- **Follow-up**: なし

### Decision: Plain CSS File for Animations

- **Context**: フェードアニメーションの実装方法
- **Alternatives Considered**:
  1. Tailwind CSS Transitions — utility classes only
  2. Plain CSS File — `MessageBox.css`
  3. CSS-in-JS — styled-components等
- **Selected Approach**: Tailwind CSS + Plain CSS File（必要時）
- **Rationale**:
  - 既存のGameBoard.cssパターンを踏襲
  - Tailwind CSSの`transition-opacity`で基本動作は実現可能
  - 複雑なkeyframesが必要な場合のみ`MessageBox.css`を追加
  - プロジェクトの技術スタック（tech.md）に準拠
- **Trade-offs**:
  - **Benefits**: 既存パターンとの整合性、柔軟性、保守性
  - **Compromises**: ファイル数が1つ増える可能性（必要な場合のみ）
- **Follow-up**: 実装時にTailwind CSSのみで実現可能か検証

## Risks & Mitigations

- **Risk 1**: 長文メッセージが固定高さコンテナから溢れる
  - **Mitigation**: `text-overflow: ellipsis`と`line-clamp`を使用して省略表示、日本語テキストでのテストを追加
- **Risk 2**: 高頻度メッセージ発行時のパフォーマンス低下
  - **Mitigation**: useCallbackとuseRefを使用したメモ化、タイマークリーンアップの徹底
- **Risk 3**: 既存の`useGameErrorHandler`との機能重複
  - **Mitigation**: 統合戦略を明確化 — `useGameErrorHandler`を`useMessageQueue`にリファクタリングまたは統合

## References

- [Notification System done in React(Typescript) including a Queue System](https://reactjsexample.com/notification-system-done-in-react-typescript-including-a-queue-system/)
- [Building a reusable notification system with react hooks and context API](https://dev.to/kevjose/building-a-reusable-notification-system-with-react-hooks-and-context-api-2phj)
- [react-notification-provider GitHub](https://github.com/anthonyshort/react-notification-provider)
- [Preventing Layout Shifts: Mastering CSS Transitions and Animations](https://blog.pixelfreestudio.com/preventing-layout-shifts-mastering-css-transitions-and-animations/)
- [How To Fix Cumulative Layout Shift (CLS) Issues — Smashing Magazine](https://www.smashingmagazine.com/2021/06/how-to-fix-cumulative-layout-shift-issues/)
- [TypeScript Discriminated Unions for Robust React Components](https://medium.com/@uramanovich/typescript-discriminated-unions-for-robust-react-components-58bc06f37299)
- [Expressive React Component APIs with Discriminated Unions](https://blog.andrewbran.ch/expressive-react-component-apis-with-discriminated-unions/)
- [Type-Safe React: Harnessing the Power of Discriminated Unions](https://dev.to/gboladetrue/type-safe-react-harnessing-the-power-of-discriminated-unions-158m)
