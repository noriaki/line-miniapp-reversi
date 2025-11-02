# テストカバレッジ改善プラン - 優先度: 低

このドキュメントでは、カバレッジが70%以上90%未満の低優先度ファイルの対応方針を記載します。

---

## 6. src/lib/game/move-history.ts (カバレッジ 72.72%)

### 現状分析

- テストファイルは存在: `src/lib/game/__tests__/move-history.test.ts`
- 正常系と境界値は十分カバーされている
- エラーケース（範囲外の位置）が未カバー

### 未カバー箇所

- 行24-27: `positionToNotation` で範囲外の位置を渡した場合
  - row < 0 または row > 7
  - col < 0 または col > 7
  - 開発環境での console.warn
  - "??" の返却

### カバー済み

- ✅ 正常な位置の変換（全ての行・列）
- ✅ 境界値テスト（0,0）（7,7）
- ✅ generateNotationString の全ケース
- ✅ パフォーマンステスト

### 対応方針

#### 1. 既存テストファイルに追加テストケースを追加

```typescript
describe('positionToNotation - invalid position tests', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // console.warn のモック
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('row が 0 未満の場合', () => {
    const result = positionToNotation(-1, 3);

    // "??" が返却されることを確認
    expect(result).toBe('??');

    // 開発環境での console.warn 呼び出し確認
    if (process.env.NODE_ENV === 'development') {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid position'),
        expect.objectContaining({ row: -1, col: 3 })
      );
    }
  });

  it('row が 7 より大きい場合', () => {
    const result = positionToNotation(8, 3);

    expect(result).toBe('??');

    if (process.env.NODE_ENV === 'development') {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid position'),
        expect.objectContaining({ row: 8, col: 3 })
      );
    }
  });

  it('col が 0 未満の場合', () => {
    const result = positionToNotation(3, -1);

    expect(result).toBe('??');

    if (process.env.NODE_ENV === 'development') {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid position'),
        expect.objectContaining({ row: 3, col: -1 })
      );
    }
  });

  it('col が 7 より大きい場合', () => {
    const result = positionToNotation(3, 8);

    expect(result).toBe('??');

    if (process.env.NODE_ENV === 'development') {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid position'),
        expect.objectContaining({ row: 3, col: 8 })
      );
    }
  });

  it('row と col が両方とも範囲外の場合', () => {
    const result = positionToNotation(-1, 10);

    expect(result).toBe('??');

    if (process.env.NODE_ENV === 'development') {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid position'),
        expect.objectContaining({ row: -1, col: 10 })
      );
    }
  });
});
```

#### 2. テストケース構成

- describe: "invalid position tests"
  - ✅ row が 0 未満の場合
  - ✅ row が 7 より大きい場合
  - ✅ col が 0 未満の場合
  - ✅ col が 7 より大きい場合
  - ✅ 開発環境での console.warn 呼び出し確認
  - ✅ "??" が返却されることを確認

#### 3. エッジケースのドキュメント

**範囲外の位置**:

- **発生条件**:
  - プログラムのバグによる不正な座標の生成
  - 外部入力の検証不足
- **影響範囲**:
  - 棋譜表記が不正になる（"??" として表示）
  - ゲームの再生や解析に影響
- **テストの価値**:
  - 防御的プログラミングの効果を検証
  - 開発環境で早期に問題を検出
  - 本番環境でのクラッシュを防ぐ

#### 4. 実装上の注意点

1. **console.warn のモック**
   - `jest.spyOn(console, 'warn')` を使用してモック化
   - テスト後に必ず `mockRestore()` を呼び出す

2. **環境による条件分岐**
   - 開発環境（`NODE_ENV === 'development'`）でのみ警告が出力される
   - テストでは環境変数を確認して検証

3. **境界値テスト**
   - 0未満と7より大きい値の両方をテスト
   - 正常範囲（0-7）との境界を明確に検証

### 推定工数

小（20分）

### 優先度

低

### 影響

Statements +0.2%, Branches +2.8%, Functions +0%, Lines +0.2%

---

## 7. src/lib/ai/index.ts (Functions カバレッジ 42.85%)

### 現状分析

- テストファイルは存在: `src/lib/ai/__tests__/index.test.ts`
- Export のみのファイル（実装なし）
- 一部の export が index.ts 経由で使用されていないため、Functions カバレッジが低い
- 実際の機能は他のファイル（ai-engine.ts, wasm-loader.ts, wasm-bridge.ts）でテスト済み

### 未カバー箇所

- `loadWASM` の export（anonymous_1）
- `encodeBoard` の export（anonymous_3）
- `callAIFunction` の export（anonymous_5）
- `freeMemory` の export（anonymous_6）

### カバー済み

- ✅ AIEngine の export
- ✅ isModuleReady の export
- ✅ decodeResponse の export

### 対応方針

#### 1. 既存テストファイルに追加テストケースを追加

```typescript
import {
  loadWASM,
  encodeBoard,
  callAIFunction,
  freeMemory,
  AIEngine,
  isModuleReady,
  decodeResponse,
} from '../index';

describe('AI module exports', () => {
  it('loadWASM を index.ts 経由でエクスポート', () => {
    // loadWASM が関数としてエクスポートされることを確認
    expect(typeof loadWASM).toBe('function');
  });

  it('encodeBoard を index.ts 経由でエクスポート', () => {
    // encodeBoard が関数としてエクスポートされることを確認
    expect(typeof encodeBoard).toBe('function');
  });

  it('callAIFunction を index.ts 経由でエクスポート', () => {
    // callAIFunction が関数としてエクスポートされることを確認
    expect(typeof callAIFunction).toBe('function');
  });

  it('freeMemory を index.ts 経由でエクスポート', () => {
    // freeMemory が関数としてエクスポートされることを確認
    expect(typeof freeMemory).toBe('function');
  });

  it('既存のエクスポートが正しく動作', () => {
    // AIEngine, isModuleReady, decodeResponse のエクスポート確認
    expect(AIEngine).toBeDefined();
    expect(typeof isModuleReady).toBe('function');
    expect(typeof decodeResponse).toBe('function');
  });
});
```

#### 2. 注意点

- **これらの関数は実際には他のテストファイルで十分にテストされている**
  - `loadWASM`: `wasm-loader.test.ts` でテスト済み
  - `encodeBoard`: `wasm-bridge.test.ts` でテスト済み
  - `callAIFunction`: `wasm-bridge.test.ts` でテスト済み
  - `freeMemory`: `wasm-bridge.test.ts` でテスト済み

- **このテストは index.ts のエクスポートが正しく機能することを確認するためのもの**
  - 各関数の詳細なテストは他のファイルで実施済み
  - ここでは型チェック程度の簡易テストで十分

#### 3. テストケース構成

- describe: "AI module exports"
  - ✅ loadWASM のエクスポート確認
  - ✅ encodeBoard のエクスポート確認
  - ✅ callAIFunction のエクスポート確認
  - ✅ freeMemory のエクスポート確認
  - ✅ 既存のエクスポート（AIEngine, isModuleReady, decodeResponse）確認

#### 4. 実装上の注意点

1. **エクスポートの確認のみ**
   - 関数が正しくエクスポートされているかを確認
   - 関数の詳細な動作は他のテストファイルに任せる

2. **型チェック**
   - `typeof` を使用して関数として認識されることを確認
   - TypeScript の型チェックとランタイムの型チェックの両方

3. **カバレッジの目的**
   - index.ts の Functions カバレッジを向上させる
   - エクスポートの正当性を確認

### 推定工数

小（15分）

### 優先度

低

### 影響

Statements +0%, Branches +0%, Functions +3.4%, Lines +0%

---

## まとめ

優先度: 低のファイルは以下の順序で対応することを推奨：

1. **move-history.ts**
   - 範囲外の位置エラーケースの追加
   - 比較的短時間で完了可能

2. **index.ts**
   - エクスポートの確認テスト追加
   - 最も短時間で完了可能

これらのファイルは既に70%以上のカバレッジがあるため、優先度は低いです。高優先度と中優先度のファイルを完了した後に実施することを推奨します。

次のステップ: [実装アクションプラン](./04-implementation.md)
