# Research & Design Decisions

## Summary

- **Feature**: `e2e-test-rebuild`
- **Discovery Scope**: Extension (既存システムのテスト再構築)
- **Key Findings**:
  - Playwright `tap()` はモバイルテストにおいて `click()` より実際のタッチイベントに近い挙動を提供
  - 既存の `data-testid` 属性はそのまま活用可能（GameBoard.tsx 内に定義済み）
  - GitHub Actions では `github` レポーターが自動アノテーション機能を提供

## Research Log

### モバイルテストにおける tap vs click

- **Context**: 要件で「モバイルデバイスのみ」を対象とするため、最適なインタラクション方法を調査
- **Sources Consulted**:
  - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
  - [Playwright Mobile Testing Guide](https://articles.mergify.com/playwright-for-mobile-testing/)
  - [GitHub Issue #19624](https://github.com/microsoft/playwright/issues/19624)
- **Findings**:
  - `page.tap()` はタッチイベントをより正確にシミュレート
  - `click()` も動作するが、モバイルテストでは `tap()` がベストプラクティス
  - モバイルデバイスプロファイル（Pixel 5, iPhone 12）は `hasTouch: true` を含む
- **Implications**: 全てのユーザーインタラクションで `tap()` を使用する設計を採用

### レポーター設定戦略

- **Context**: ローカル実行とCI実行で異なるレポーター要件
- **Sources Consulted**:
  - [Playwright Reporters Documentation](https://playwright.dev/docs/test-reporters)
  - [Playwright CI Setup](https://playwright.dev/docs/ci-intro)
- **Findings**:
  - `github` レポーター: GitHub Actions で自動的に失敗箇所にアノテーションを表示
  - `line` レポーター: 大規模テストスイート向け、単一行で進捗表示
  - `list` レポーター: 各テストを行単位で表示、中規模テスト向け
  - 動的切り替え: `process.env.CI` で判定可能
- **Implications**: ローカルは `line`、CI は `github` を使用する設計を採用

### 既存コードベースの data-testid 分析

- **Context**: 安定したセレクターのために既存の test-id を調査
- **Sources Consulted**: プロジェクト内 `src/components/GameBoard.tsx`
- **Findings**:
  - `data-testid="game-board"` - ゲームボード全体
  - `data-testid="game-result"` - ゲーム結果表示
  - `data-testid="move-history"` - 着手履歴
  - `data-testid="message-box"` - メッセージボックス
  - `data-testid="profile-icon"` / `data-testid="default-profile-icon"` - プロフィール
  - セル特定: `data-row`, `data-col`, `data-stone`, `data-valid`, `data-last-move`
- **Implications**: 既存の data-testid をそのまま活用、追加は不要

### UI テキスト・メッセージの確認

- **Context**: テストでのテキスト検証に必要な正確な文言を確認
- **Sources Consulted**: プロジェクト内 `src/components/GameBoard.tsx`
- **Findings**:
  - ターン表示: `あなたのターン`, `AI のターン`
  - AI思考中: `(思考中...)`（ターン表示に連結）
  - エラーメッセージ:
    - `そのマスには既に石が置かれています`（occupied）
    - `そのマスに置いても石を反転できません`（no_flips）
  - パス通知: `有効な手がありません。パスしました。`
  - ゲーム終了: `ゲーム終了！`, `あなたの勝ち!`, `AI の勝ち!`, `引き分け`
- **Implications**: テストでは正確な文言を使用して検証を実施

## Architecture Pattern Evaluation

| Option                 | Description                | Strengths                | Risks / Limitations      | Notes                  |
| ---------------------- | -------------------------- | ------------------------ | ------------------------ | ---------------------- |
| 既存マルチファイル構成 | 機能別にspecファイルを分割 | 並列実行可能、関心の分離 | ファイル数が多く管理複雑 | 現状の11ファイルは過剰 |
| 単一ファイル構成       | 全テストを1ファイルに集約  | シンプル、依存関係が明確 | 大規模化時に分割必要     | 今回のスコープに最適   |

## Design Decisions

### Decision: テストファイル構成

- **Context**: 既存の11ファイルを新しい構成に置き換える必要がある
- **Alternatives Considered**:
  1. 既存ファイルの修正・維持 - 複雑で保守困難
  2. 単一ファイルへの集約 - シンプルで明確
- **Selected Approach**: 単一ファイル `game-basic.spec.ts` に全テストを集約
- **Rationale**: テスト範囲が限定的（5つの検証項目）であり、1ファイルで十分管理可能
- **Trade-offs**: 将来の拡張時に分割が必要になる可能性
- **Follow-up**: テストケース数が20を超えた場合は分割を検討

### Decision: モバイルデバイス限定

- **Context**: LINE miniappはモバイル環境で使用されるため
- **Alternatives Considered**:
  1. デスクトップ + モバイル両対応
  2. モバイルのみ
- **Selected Approach**: モバイルのみ（Pixel 5 + iPhone 12）
- **Rationale**: 実際の使用環境に合致、テスト実行時間の削減
- **Trade-offs**: デスクトップでの動作確認は手動となる
- **Follow-up**: なし

### Decision: AI待機戦略

- **Context**: AIの応手を待つ適切な方法を決定
- **Alternatives Considered**:
  1. 固定時間 `waitForTimeout` - シンプルだが不安定
  2. 要素ベース `waitFor` + polling - 堅牢
- **Selected Approach**: ターン表示のテキスト変化を `waitFor` で監視
- **Rationale**: 実際のUI状態変化を検証、タイムアウトは3秒で設定
- **Trade-offs**: セレクターの正確性に依存
- **Follow-up**: CI環境での安定性を監視

## Risks & Mitigations

- **リスク1**: AIの応答時間がCI環境で変動 - タイムアウトを3秒に設定し、リトライを2回許容
- **リスク2**: 有効手のハイライト検出の不安定性 - `data-valid="true"` 属性で確実に検出
- **リスク3**: モバイルエミュレーションの精度 - 実機での定期的な動作確認を推奨

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices) - 公式ベストプラクティス
- [Playwright Reporters](https://playwright.dev/docs/test-reporters) - レポーター設定リファレンス
- [Playwright CI Setup](https://playwright.dev/docs/ci-intro) - CI環境セットアップガイド
- [Playwright Mobile Testing](https://articles.mergify.com/playwright-for-mobile-testing/) - モバイルテスト詳細ガイド
