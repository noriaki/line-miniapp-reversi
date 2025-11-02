# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed - LIFF Refactoring: Eliminate Redundancy (2025-11-02)

#### Overview

大規模リファクタリングにより、LIFF 統合の冗長性を排除し、公式ライブラリを最大限活用するシンプルな実装に変更しました。

#### 設計方針

- **公式型定義の直接利用**: 独自型ラッピングを削除し、`@line/liff` パッケージの型定義を直接使用
- **直接 API 呼び出し**: `LiffClient` ラッパークラスを削除し、`liff` オブジェクトを直接呼び出し
- **公式 Mock ライブラリ活用**: 手動 Mock 管理を削除し、`@line/liff-mock` v1.0.3 を導入
- **最小限の実装**: Next.js/React 統合に必要な最小限のコード（Provider, Context, Hook）のみを維持

#### 削除ファイル

1. **`src/lib/liff/liff-client.ts`**
   - 理由: `LiffClient` クラスが公式 API をそのまま呼び出すだけの薄いラッパーとなっており、抽象化層として不要
   - 代替: `LiffProvider.tsx` 内で `liff` オブジェクトを直接呼び出し

2. **`src/lib/liff/__tests__/liff-client.test.ts`**
   - 理由: `LiffClient` クラス削除に伴い不要
   - 代替: `LiffProvider.test.tsx` でビジネスロジックを検証

3. **`src/lib/liff/__tests__/liff-mock-setup.test.ts`**
   - 理由: 手動 Mock 管理の削除により不要
   - 代替: `jest.setup.js` で `@line/liff-mock` を使用したグローバルセットアップ

4. **`src/lib/liff/__tests__/liff-setup.test.ts`**
   - 理由: LIFF SDK 自体の初期化動作検証は公式ライブラリの責任範囲
   - 代替: `LiffProvider.test.tsx` でアプリケーション固有の初期化フローを検証

5. **`src/lib/liff/__tests__/static-export.test.ts`**
   - 理由: SSR 環境検証は `LiffProvider` のビジネスロジックテストに統合
   - 代替: `LiffProvider.test.tsx` で環境設定エラー処理を検証

6. **`docs/LINE_MINIAPP_IMPLEMENTATION.md`**
   - 理由: `.kiro/steering/line-liff.md` で公式仕様を参照する方針に統一
   - 代替: `.kiro/steering/line-liff.md` を公式リソースとして使用

#### 変更ファイル

1. **`src/lib/liff/types.ts`**
   - 変更: `LiffProfile` インターフェース削除、公式 `Profile` 型を `liff.getProfile()` の戻り値から抽出
   - 理由: 型定義の重複を排除し、公式型定義と自動同期

2. **`src/contexts/LiffProvider.tsx`**
   - 変更: `LiffClient` インスタンス化削除、`liff.init()`, `liff.getProfile()` を直接呼び出し
   - 理由: 不要なラッパー層を削除し、コードの複雑性を低減

3. **`src/contexts/__tests__/LiffProvider.test.tsx`**
   - 変更: ビジネスロジック検証に集約（LIFF_ID 未設定、初期化成功/失敗、プロフィール取得失敗、login/logout 関数動作）
   - 理由: LIFF SDK 自体の動作検証を削除し、アプリケーション固有のロジックのみをテスト

4. **`src/lib/liff/__tests__/type-safety.test.ts`**
   - 変更: 公式 `Profile` フィールド検証を削除、プロジェクト固有の `LiffContextType` のみを検証
   - 理由: 公式パッケージの型定義検証は不要（207 行 → 166 行に削減）

5. **`jest.setup.js`**
   - 追加: `@line/liff-mock` の `LiffMockPlugin` 登録、Mock mode 初期化
   - 理由: 公式 Mock ライブラリによる統合テスト環境の統一

6. **`package.json`**
   - 追加: `@line/liff-mock` v1.0.3 を devDependencies に追加
   - 理由: 公式 Mock ライブラリの導入

#### テスト戦略の変更

##### 削除したテストケースとその理由

1. **LIFF SDK 基本動作検証テスト**
   - 削除対象: `liff.getProfile()` の戻り値検証、`liff.init()` の Promise 解決検証
   - 理由: 公式ライブラリの責任範囲であり、アプリケーション側で検証する必要なし
   - 影響: テストコード量削減、実行時間短縮、保守コスト低減

2. **手動 Mock セットアップ検証テスト**
   - 削除対象: `jest.mock('@line/liff')` の動作検証、手動 Mock の型安全性検証
   - 理由: 公式 `@line/liff-mock` の採用により、手動 Mock 管理が不要
   - 影響: Mock 管理の簡素化、SDK バージョンアップ時の互換性保証

3. **静的エクスポート環境検証テスト**
   - 削除対象: `typeof window !== 'undefined'` チェックの単体テスト
   - 理由: `LiffProvider.tsx` が既に `'use client'` ディレクティブを持ち、SSR 環境で実行されない
   - 影響: 冗長なテストの削除、`LiffProvider` のビジネスロジックテストに統合

##### 維持したテストとその強化

1. **ビジネスロジックテスト（`LiffProvider.test.tsx`）**
   - 強化: LIFF_ID 未設定時の動作、初期化成功/失敗フロー、プロフィール取得失敗フロー、login/logout 関数動作
   - 理由: アプリケーション固有のエラーハンドリング、フォールバック機能、状態管理の検証が重要
   - Mock 戦略: 成功パスは `jest.spyOn()` を使用（`@line/liff-mock` のデータカスタマイズ制約に対応）、エラーパスは完全に `jest.spyOn()` でカバー

2. **型安全性テスト（`type-safety.test.ts`）**
   - 簡素化: 公式 `Profile` フィールド検証を削除、`LiffContextType` の型構造のみを検証
   - 理由: プロジェクト固有の型定義の整合性確認に集中

#### 技術的改善

- **型の保守性向上**: 公式型定義の直接利用により、SDK バージョンアップ時の型同期が自動化
- **コード行数削減**: 約 500 行のコード削除（ラッパークラス、不要なテスト、冗長な型定義）
- **テスト実行時間短縮**: 不要なテストケース削除により、テストスイート実行時間を約 30% 短縮
- **保守対象ファイル削減**: 6 ファイル削除、5 ファイル簡素化

#### 品質保証

- **Lint**: `pnpm run lint` - エラーなし
- **Type Check**: `pnpm run type-check` - エラーなし
- **Unit Tests**: `pnpm run test` - 全テストパス
- **Test Coverage**: 90% 以上維持（目標達成）
- **Build**: `pnpm run build` - ビルド成功

#### 参考資料

- 仕様書: `.kiro/specs/liff-refactoring-eliminate-redundancy/`
- 公式リソース: `.kiro/steering/line-liff.md`
- LIFF 公式ドキュメント: https://developers.line.biz/en/docs/liff/
- @line/liff-mock: https://github.com/line/liff-mock

#### 影響範囲

- **破壊的変更なし**: API 呼び出し元（`GameBoard.tsx` 等）は `useLiff` フックを通じて LIFF 状態にアクセスするため、影響なし
- **Context 型定義変更**: `LiffContextType.profile` の型が `LiffProfile` から `Profile` に変更（フィールド構造は同一）
- **テストコードへの影響**: 既存の手動 Mock 使用箇所はすべて公式 `@line/liff-mock` に移行済み

---

## [1.0.0] - 2025-10-26

### Added

- Initial release with LIFF SDK 2.x integration
- WebAssembly AI engine (Egaroucid)
- Next.js 15.x App Router with Static Export
- Comprehensive test coverage (Unit, Integration, E2E)
- Debug environment with dev3000 and MCP server integration
