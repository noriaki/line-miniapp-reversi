# 実装計画

## タスク概要

本タスクリストは、LIFF統合に関する冗長な実装を排除し、公式ライブラリを最大限活用するリファクタリングを実施する。全9要件を7つのメジャータスク（事前検証 + 6つの実装タスク）にマッピングし、段階的に変更を適用して品質を維持する。

---

- [x] 0. 事前検証 - 公式Mockライブラリの動作確認 (デザインレビュー対応)
  - `@line/liff-mock` v1.0.3をdevDependenciesに追加（`pnpm add -D @line/liff-mock`）
  - `jest.setup.js`に公式Mockセットアップを追加:
    - `import { LiffMockPlugin } from '@line/liff-mock'`を追加
    - `liff.use(new LiffMockPlugin())`でPlugin登録
    - `liff.init({ liffId: 'test-liff-id', mock: true })`でMock mode初期化
  - 既存テスト1つ（`src/contexts/__tests__/LiffProvider.test.tsx`）で動作確認
  - 公式Mockが正常に動作し、テストがパスすることを確認（`pnpm run test src/contexts/__tests__/LiffProvider.test.tsx`）
  - Mock初期化失敗やテスト実行不可の場合はロールバック
  - _目的: Phase 3（Mock移行）の技術的リスクを事前に検証し、不確実性を排除_
  - _所要時間: 30分_

- [x] 1. 公式型定義への移行と型システムの整理
  - `src/lib/liff/types.ts`から`LiffProfile`インターフェース定義を削除
  - `LiffContextType`の`profile`フィールドを`Profile | null`型（`@line/liff`公式型）に変更
  - 全ファイルのimport文を`import type { Profile } from '@/lib/liff/types'`に統一
  - 公式型を`liff.getProfile()`の戻り値型から抽出（`Awaited<ReturnType<typeof liff.getProfile>>`）
  - TypeScriptコンパイル実行（`pnpm run type-check`）で型エラーがないことを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. LIFFクライアントラッパーの削除と直接呼び出しへの変更
- [x] 2.1 LiffClientクラスの削除と公式API直接呼び出しへの置き換え
  - `src/lib/liff/liff-client.ts`ファイルを削除
  - `LiffProvider.tsx`から`LiffClient`のインスタンス化・import・useRefを削除
  - `liff.init()`、`liff.getProfile()`、`liff.isInClient()`、`liff.isLoggedIn()`を直接呼び出すように変更
  - `useRef<LiffClient>`を削除し、グローバル`liff`オブジェクトを直接参照
  - エラーハンドリング・フォールバック機能を維持
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.2 ログイン・ログアウト機能の直接実装
  - `LiffProvider`の`login`関数を`liff.login()`直接呼び出しに変更
  - `logout`関数を`liff.logout()`直接呼び出しに変更
  - 外部ブラウザでのログインフローを維持（`withLoginOnExternalBrowser`オプション）
  - Context経由で提供されるlogin/logout関数の型定義を維持
  - _Requirements: 2.1, 2.4_

- [ ] 3. 公式Mockライブラリの導入とテストセットアップの移行
- [x] 3.1 公式@line/liff-mockパッケージのインストールと設定
  - `@line/liff-mock` v1.0.3をdevDependenciesに追加（`pnpm add -D @line/liff-mock`）
  - `jest.setup.js`に`LiffMockPlugin`のimportと登録を追加
  - グローバルセットアップで`liff.init({ liffId: 'test-liff-id', mock: true })`を実行
  - `LiffMockPlugin`を`liff.use()`で有効化
  - _Requirements: 3.1, 3.3_

- [x] 3.2 既存の手動Mock設定の削除とliff.$mockへの移行
  - 全テストファイルから`jest.mock('@line/liff')`手動Mock設定を削除（既に存在しない）
  - 成功ケースで`liff.$mock.set()`によるMockデータカスタマイズを実装
  - `beforeEach`/`afterEach`フックで`liff.$mock.clear()`を実行してテスト間のクリーンアップを保証
  - エラーケースは公式Mock APIの制約により`jest.spyOn()`を併用（ビジネスロジックのテスト）
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 4. 冗長なテストコードの削除とビジネスロジックテストへの集約
- [ ] 4.1 LIFF SDK動作検証テストの削除
  - `src/lib/liff/__tests__/liff-client.test.ts`を削除（`LiffClient`クラス削除に伴い不要）
  - `src/lib/liff/__tests__/liff-mock-setup.test.ts`を削除（手動Mock管理削除により不要）
  - `src/lib/liff/__tests__/liff-setup.test.ts`を削除（SDK初期化動作は公式ライブラリの責任範囲）
  - `src/lib/liff/__tests__/static-export.test.ts`を削除（SSR環境検証は`LiffProvider`テストに統合）
  - _Requirements: 3.2, 7.1, 7.2_

- [ ] 4.2 LiffProviderビジネスロジックテストの書き換え
  - `src/contexts/__tests__/LiffProvider.test.tsx`をビジネスロジック検証に集約
  - LIFF_ID未設定時の動作テスト（警告ログ出力、LIFF無効モード）を実装
  - 初期化成功フロー（`isInClient`、`isLoggedIn`、`profile`取得）を検証
  - 初期化失敗フロー（エラーメッセージ設定、フォールバックモード）を検証
  - プロフィール取得失敗フロー（エラー処理、デフォルトアイコン表示）を検証
  - login/logout関数の動作検証を追加
  - _Requirements: 3.4, 7.2, 7.3_

- [ ] 4.3 型安全性テストの簡素化と維持
  - `src/lib/liff/__tests__/type-safety.test.ts`を簡素化
  - 公式型定義（`Profile`）の直接使用を検証
  - プロジェクト固有の型安全性（`LiffContextType`）のみをテスト対象とする
  - 公式型のフィールド検証は削除（公式パッケージの責任範囲）
  - _Requirements: 1.1, 7.2, 7.4_

- [ ] 5. ドキュメントとコメントの整合性確保
- [ ] 5.1 コード内コメントの更新
  - LIFF実装に関するコメントを`.kiro/steering/line-liff.md`の内容と整合させる
  - 削除された`LiffClient`クラスへの言及を削除
  - 公式API直接呼び出しパターンをコメントで明示
  - 古い実装方針（型ラッピング、手動Mock等）への言及を削除
  - _Requirements: 5.1, 5.2_

- [ ] 5.2 ドキュメントファイルの更新と変更履歴の記録
  - READMEにリファクタリング内容を反映（LIFF統合セクション）
  - 削除ファイルリスト、変更ファイルリスト、削除テストケースとその理由を文書化
  - `.kiro/steering/line-liff.md`へのリンクを追加（公式仕様参照）
  - CHANGELOG形式で変更内容をまとめる
  - _Requirements: 5.3, 5.4, 9.1, 9.2, 9.3_

- [ ] 6. 品質検証と最終確認
- [ ] 6.1 全品質ゲートの実行と検証
  - ESLint実行（`pnpm run lint`）でエラーがないことを確認
  - TypeScriptコンパイル（`pnpm run type-check`）でエラーがないことを確認
  - 全ユニットテスト実行（`pnpm run test`）で全テストがパスすることを確認
  - テストカバレッジ確認（`pnpm run test:coverage`）で90%以上を維持
  - 本番ビルド実行（`pnpm run build`）でビルドが成功することを確認
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 7.4_

- [ ] 6.2 E2Eテストと実装ファイル整合性の確認
  - E2Eテスト実行（`pnpm run test:e2e`）で全シナリオがパスすることを確認（オプション）
  - import/exportパスの整合性を確認（削除ファイルへの参照がないこと）
  - LIFF統合の動作確認（初期化、プロフィール表示、エラーハンドリング）
  - 変更影響範囲の文書が完全であることを確認
  - ステアリングファイル（`.kiro/steering/line-liff.md`）との整合性を最終確認
  - _Requirements: 8.5, 6.4, 9.4_

---

## 実装順序の根拠

0. **事前検証（タスク0）**: 公式Mockライブラリの動作を確認し、Phase 3の技術的リスクを排除（デザインレビュー対応）
1. **型定義変更（タスク1）**: 型システムを最初に整理し、後続のコード変更の基盤を作る
2. **ラッパー削除（タスク2）**: `LiffClient`削除により、テスト対象が明確化される
3. **Mock移行（タスク3）**: 新しいテスト基盤を構築し、既存テスト削除の準備を整える（Phase 0で事前検証済み）
4. **テスト整理（タスク4）**: 不要テスト削除とビジネスロジックテストへの集約
5. **ドキュメント更新（タスク5）**: コード変更完了後にドキュメントを整合させる
6. **品質検証（タスク6）**: 全変更完了後に品質ゲートで最終確認

各タスク完了後に検証チェックポイントを設け、問題発生時は即座にロールバック可能な構成とする。

**合計所要時間**: 4時間（Phase 0追加分30分を含む）

---

## カバレッジ目標

- **ユニットテスト**: 90%以上（既存品質基準維持）
- **統合テスト**: LIFF統合部分100%（Provider、Hook、Mock setup）
- **E2Eテスト**: 既存カバレッジ維持（変更なし）
