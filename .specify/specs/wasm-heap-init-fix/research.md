# Research & Design Decisions

---

**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

**Usage**:

- Log research activities and outcomes during the discovery phase.
- Document design decision trade-offs that are too detailed for `design.md`.
- Provide references and evidence for future audits or reuse.

---

## Summary

- **Feature**: `wasm-heap-init-fix`
- **Discovery Scope**: Extension
- **Key Findings**:
  - Emscripten 2.0.10以降では、MODULARIZEモードでHEAP\*変数がModule外からアクセスできなくなった
  - Node.js環境で`new Function()`を使用するとスコープ分離が発生し、グローバルHEAPビューがModule.HEAPにコピーされない
  - 複数のフォールバック戦略（グローバル変数、wasmMemory、Module.memory）を実装することで、異なる環境での互換性を確保できる

## Research Log

### Emscripten HEAP初期化パターンの調査

- **Context**: Node.js環境でのWASM統合テストにおいて`Module.HEAP32`が`undefined`になる問題の原因を特定する必要があった
- **Sources Consulted**:
  - [HEAP\* not accessible anymore through Module object](https://groups.google.com/g/emscripten-discuss/c/Qlob7yyD94U)
  - [Module object — Emscripten 4.0.21-git (dev) documentation](https://emscripten.org/docs/api_reference/module.html)
  - [Emscripten.h — Emscripten 4.0.21-git (dev) documentation](https://emscripten.org/docs/api_reference/emscripten.h.html)
- **Findings**:
  - Emscripten 2.0.10以降、HEAP\*変数はデフォルトでModule外からアクセス不可
  - `-sIMPORTED_MEMORY=1`または`-sEXPORTED_RUNTIME_METHODS`フラグで明示的にエクスポート可能
  - グローバル変数としてのHEAP\*アクセスは一部の環境で依然として機能する
  - MODULARIZEモードでは関数スコープ内にモジュールが配置されるため、グローバルスコープとの分離が発生
- **Implications**:
  - 本番環境（`public/ai.js`）の変更は避け、テストコード側で対応することが適切
  - 複数の初期化戦略を実装し、環境の違いに対応する必要がある

### Node.js環境でのスコープ分離問題

- **Context**: `new Function()`を使用してEmscripten glue codeを実行する際のスコープ分離の影響を調査
- **Sources Consulted**:
  - プロジェクト内の既存実装: `wasm-loader.ts:116-119`
  - エラーログとスタックトレース分析
- **Findings**:
  - `new Function()`は独自のスコープを作成し、Emscripten内部で生成されるグローバル変数がそのスコープ内に閉じ込められる
  - Emscriptenの`updateMemoryViews()`関数はグローバルスコープに`HEAP8`、`HEAP32`などを設定するが、`Module.HEAP32`への二重代入は`public/ai.js`（minified版）では欠落している可能性がある
  - 本番コードの`wasm-loader.ts`は既にこの問題を認識し、グローバルスコープから`Module`オブジェクトにHEAPビューをコピーしている
- **Implications**:
  - テストコードも本番コードと同じパターンを採用すべき
  - フォールバック戦略を実装し、複数の初期化方法を試行する必要がある

### フォールバック戦略の優先順位設定

- **Context**: 異なる環境とEmscriptenバージョンでの互換性を最大化するため、複数のHEAP初期化方法の優先順位を決定
- **Sources Consulted**:
  - 本番コード: `wasm-loader.ts:116-122`
  - テスト環境の現状分析
- **Findings**:
  - **戦略1**: グローバルスコープから取得（最も一般的、既存の本番コードで使用）
  - **戦略2**: `wasmMemory.buffer`から作成（Emscriptenが`wasmMemory`をグローバルにエクスポートする場合）
  - **戦略3**: `Module.memory.buffer`から作成（最後のフォールバック）
- **Implications**:
  - 戦略1が最も信頼性が高く、本番環境との整合性がある
  - 戦略2と3は将来のEmscriptenバージョンや異なる設定での互換性を確保
  - すべての戦略が失敗した場合は明確なエラーメッセージでテストを失敗させる

## Architecture Pattern Evaluation

本機能は既存のテストコードへの拡張であるため、新しいアーキテクチャパターンの評価は不要。既存の統合テストパターンを維持し、HEAPビュー初期化ロジックのみを強化する。

## Design Decisions

### Decision: テストコード側での対応（本番ファイル非変更）

- **Context**: `public/ai.js`（本番用minifiedファイル）がNode.js環境で`Module.HEAP32`を正しく初期化しない問題に対処する必要があった
- **Alternatives Considered**:
  1. **解決策A**: `.specify/resources/ai.js`（非minified版）を`public/`にコピー
     - `Module.HEAP32`への二重代入が含まれている
     - 本番環境のファイルを変更する必要がある
  2. **解決策B**: テストコード内でHEAPビューを動的生成（推奨）
     - 本番ファイルは変更しない
     - テストコードの`onRuntimeInitialized`でHEAPビューを設定
  3. **解決策C**: `vm.runInNewContext()`を使用
     - より複雑な実装が必要
     - パフォーマンスへの影響がある
- **Selected Approach**: 解決策B（テストコード内でHEAP動的生成）
- **Rationale**:
  - 本番環境のファイル（`public/ai.js`、`public/ai.wasm`）を変更しないため、デプロイメントの安全性を確保
  - 既存の本番コード（`wasm-loader.ts`）と同じパターンを採用し、整合性を維持
  - シンプルな実装で、テストコードのみの変更で完結
  - Web Worker環境での動作に影響を与えない
- **Trade-offs**:
  - **Benefits**: 本番環境への影響ゼロ、既存パターンとの整合性、シンプルな実装
  - **Compromises**: テストコードの各`onRuntimeInitialized`コールバックを個別に修正する必要がある（7箇所）
- **Follow-up**: すべてのテスト（565個）が成功することを確認し、フォールバック戦略が正しく機能することを検証

### Decision: 3段階フォールバック戦略の実装

- **Context**: 異なるEmscriptenバージョンや設定、環境（Node.js、ブラウザ）でのテストの安定性を確保する必要があった
- **Alternatives Considered**:
  1. グローバルスコープからのコピーのみ
  2. `Module.memory`からの直接作成のみ
  3. 3段階フォールバック（グローバル → wasmMemory → Module.memory）
- **Selected Approach**: 3段階フォールバック戦略
- **Rationale**:
  - **戦略1（グローバルスコープ）**: 現在の本番コードと同じパターン、最も一般的
  - **戦略2（wasmMemory）**: Emscriptenが`wasmMemory`をエクスポートする設定での互換性
  - **戦略3（Module.memory）**: 最後のフォールバック、直接メモリバッファにアクセス
  - いずれかの戦略が成功すれば十分であり、環境の違いに柔軟に対応できる
- **Trade-offs**:
  - **Benefits**: 高い互換性、将来のEmscriptenバージョン変更への耐性、明確なエラーハンドリング
  - **Compromises**: 若干の複雑さ増加、各戦略のチェックコード追加
- **Follow-up**: 各フォールバック戦略が実際に実行されるケースを確認（既存環境では戦略1が使用される想定）

### Decision: TypeScript型安全性の維持

- **Context**: グローバルオブジェクトに動的にHEAPプロパティを追加する際の型安全性を確保する必要があった
- **Alternatives Considered**:
  1. `any`型を使用してキャスト
  2. `unknown`型を使用してランタイムチェック
  3. 明示的な型注釈（`typeof global & { HEAP8?: Int8Array; ... }`）を使用
- **Selected Approach**: 明示的な型注釈を使用
- **Rationale**:
  - TypeScript strictモードに準拠
  - コンパイル時の型チェックを維持
  - コードの意図を明確に表現
  - `any`型の使用を避けるプロジェクト方針に従う
- **Trade-offs**:
  - **Benefits**: 型安全性、コンパイル時エラー検出、コードの可読性向上
  - **Compromises**: 若干の型定義の冗長性
- **Follow-up**: TypeScript strictモードでのコンパイルを確認

## Risks & Mitigations

- **Risk 1**: 将来のEmscriptenバージョン変更により、すべてのフォールバック戦略が無効化される可能性
  - **Mitigation**: 3段階のフォールバック戦略により複数の初期化方法をサポート。Emscripten公式ドキュメントとの整合性を定期的に確認
- **Risk 2**: グローバルスコープへのアクセスが制限される環境での失敗
  - **Mitigation**: `Module.memory`からの直接作成（戦略3）を最後のフォールバックとして実装。明確なエラーメッセージで問題を早期検出
- **Risk 3**: 本番環境とテスト環境の動作差異
  - **Mitigation**: 本番コード（`wasm-loader.ts`）と同じパターンを採用し、整合性を維持。E2Eテストでブラウザ環境での動作も検証

## References

- [HEAP\* not accessible anymore through Module object](https://groups.google.com/g/emscripten-discuss/c/Qlob7yyD94U) — Emscripten 2.0.10以降のHEAP\*アクセス変更に関する議論
- [Module object — Emscripten 4.0.21-git (dev) documentation](https://emscripten.org/docs/api_reference/module.html) — Emscripten Moduleオブジェクトの公式ドキュメント
- [emscripten.h — Emscripten 4.0.21-git (dev) documentation](https://emscripten.org/docs/api_reference/emscripten.h.html) — Emscripten APIリファレンス
- プロジェクト内部ドキュメント: `docs/20251123-wasm-integration-test-fix.md` — 問題分析と解決策の詳細
- プロジェクト内部実装: `wasm-loader.ts:116-122` — 本番環境でのHEAPビュー初期化パターン
