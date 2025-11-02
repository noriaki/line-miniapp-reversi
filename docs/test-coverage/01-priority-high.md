# テストカバレッジ改善プラン - 優先度: 高

このドキュメントでは、カバレッジが0%または50%未満の高優先度ファイルの対応方針を記載します。

---

## 1. src/hooks/useAIPlayer.ts (カバレッジ 0%)

### 現状分析

- テストファイルが存在しない
- 98行すべてが未カバー
- Web Workerを使用したAI計算フック
- テスト環境では14-16行目で早期リターンするため、実質的に何も実行されない

### 未カバー箇所

- Worker初期化ロジック (11-24行)
- Workerクリーンアップ (28-30行)
- calculateMove関数全体 (34-96行)
  - Workerなし時のフォールバック (36-47行)
  - タイムアウト処理 (50-61行)
  - メッセージハンドラー (64-84行)
  - Workerへのメッセージ送信 (86-92行)

### 対応方針

#### 1. テスト環境の改善戦略

テスト環境での早期リターン（14-16行）を削除する代わりに、環境変数で制御可能にします：

```typescript
// src/hooks/useAIPlayer.ts での変更案
const isTestEnvironment = process.env.NODE_ENV === 'test';
const useRealWorker =
  !isTestEnvironment || process.env.TEST_WITH_WORKER === 'true';

if (isTestEnvironment && !useRealWorker) {
  // モックWorkerを使用するテスト用の軽量な実装を返す
  return { calculateMove: async () => null };
}
```

**利点**:

- デフォルトはモックWorkerで高速なテスト実行
- 必要に応じて `TEST_WITH_WORKER=true` で実際のWorkerをテスト可能
- テストの分離と独立性を維持

#### 2. カスタムWorkerモックの作成

Jestを使用したWorkerモックの実装例：

```typescript
// __mocks__/worker.ts
export class Worker {
  private onmessage: ((event: MessageEvent) => void) | null = null;
  private onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(scriptURL: string | URL, options?: WorkerOptions) {
    // Worker初期化のシミュレーション
  }

  postMessage(data: any): void {
    // 非同期でWorkerレスポンスをシミュレート
    setTimeout(() => {
      if (this.onmessage) {
        // モックレスポンスを返す
        const mockResponse = { type: 'move', move: { row: 0, col: 0 } };
        this.onmessage(new MessageEvent('message', { data: mockResponse }));
      }
    }, 0);
  }

  terminate(): void {
    // クリーンアップ処理
  }

  addEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.onmessage = listener as (event: MessageEvent) => void;
    } else if (type === 'error') {
      this.onerror = listener as (event: ErrorEvent) => void;
    }
  }

  removeEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.onmessage = null;
    } else if (type === 'error') {
      this.onerror = null;
    }
  }
}

// Jest設定でWorkerをモック
global.Worker = Worker as any;
```

#### 3. テストケース

**テストファイルの作成**: `src/hooks/__tests__/useAIPlayer.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAIPlayer } from '../useAIPlayer';

describe('useAIPlayer', () => {
  beforeEach(() => {
    // Workerモックのセットアップ
  });

  afterEach(() => {
    // モックのクリーンアップ
    jest.clearAllMocks();
  });

  describe('Worker初期化', () => {
    it('Worker初期化成功', () => {
      const { result } = renderHook(() => useAIPlayer());
      expect(result.current.calculateMove).toBeDefined();
    });

    it('Worker初期化失敗時のエラーハンドリング', () => {
      // Workerコンストラクタがエラーを投げる場合のテスト
    });
  });

  describe('calculateMove', () => {
    it('成功パス: Workerから正常な応答', async () => {
      const { result } = renderHook(() => useAIPlayer());
      const board = Array(8).fill(Array(8).fill(0));

      const move = await result.current.calculateMove(board, 1, 1);

      expect(move).toBeDefined();
      expect(move).toHaveProperty('row');
      expect(move).toHaveProperty('col');
    });

    it('Workerが初期化されていない場合のフォールバック', async () => {
      // Workerがnullの場合のテスト
    });

    it('タイムアウト時のフォールバック', async () => {
      // Workerが5秒以内に応答しない場合のテスト
    });

    it('Workerエラー時のフォールバック', async () => {
      // Workerがエラーを投げる場合のテスト
    });

    it('フォールバックも失敗する場合のエラー', async () => {
      // 全ての計算方法が失敗する場合のテスト
    });
  });

  describe('クリーンアップ', () => {
    it('Workerのクリーンアップ（アンマウント時）', () => {
      const { unmount } = renderHook(() => useAIPlayer());

      unmount();

      // Worker.terminate() が呼ばれることを確認
    });
  });
});
```

#### 4. 実装上の注意点

1. **非同期処理のテスト**
   - `waitFor` を使用して非同期処理の完了を待つ
   - タイムアウト値を適切に設定（デフォルト1秒は短すぎる場合がある）

2. **モックのスコープ**
   - グローバルなWorkerモックがテスト間で干渉しないように注意
   - 各テスト後に適切にクリーンアップ

3. **エラーハンドリングの検証**
   - コンソールエラーのモックで、エラーログが出力されることを確認
   - 各エラーケースで適切なフォールバックが実行されることを確認

### 推定工数

中（2-3時間）

### 優先度

最高（0%のため）

### 影響

Statements +7.4%, Branches +9.8%, Functions +7.0%, Lines +7.4%

---

## 2. src/components/WASMErrorHandler.tsx (カバレッジ 64.7%)

### 現状分析

- テストファイルは存在するが、一部のケースが未カバー
- 既存テスト: `src/components/__tests__/WASMErrorHandler.test.tsx`
- 6つのテストケースがあるが、全てのエラータイプとインタラクションをカバーしていない

### 未カバー箇所

- 行33: `instantiation_failed` (wasm_load_error) のケース
- 行50: `wasm_load_failed` (initialization_error) のケース
- 行62: `test_call_failed` (initialization_error) のケース
- 行80: `handleReload` 関数（リロードボタンのクリック）
- 行198, 201: マウスオーバー/アウトイベントハンドラー

### カバー済み

- ✅ fetch_failed (wasm_load_error)
- ✅ initialization_timeout (wasm_load_error)
- ✅ wasm_instantiation_failed (initialization_error)

### 対応方針

#### 1. 既存テストファイルに追加テストケースを追加

```typescript
describe('WASMErrorHandler - All error types coverage', () => {
  it('wasm_load_error: instantiation_failed', () => {
    render(
      <WASMErrorHandler
        error={{
          type: 'wasm_load_error',
          reason: 'instantiation_failed',
          message: 'WASM instantiation failed',
          timestamp: Date.now(),
        }}
      />
    );

    expect(screen.getByText(/WebAssembly モジュールの初期化に失敗/)).toBeInTheDocument();
  });

  it('initialization_error: wasm_load_failed', () => {
    render(
      <WASMErrorHandler
        error={{
          type: 'initialization_error',
          reason: 'wasm_load_failed',
          message: 'WASM load failed',
          timestamp: Date.now(),
        }}
      />
    );

    expect(screen.getByText(/WebAssembly の読み込みに失敗/)).toBeInTheDocument();
  });

  it('initialization_error: test_call_failed', () => {
    render(
      <WASMErrorHandler
        error={{
          type: 'initialization_error',
          reason: 'test_call_failed',
          message: 'Test call failed',
          timestamp: Date.now(),
        }}
      />
    );

    expect(screen.getByText(/AI エンジンのテスト呼び出しに失敗/)).toBeInTheDocument();
  });
});
```

#### 2. インタラクションテストの追加

```typescript
describe('WASMErrorHandler - User interactions', () => {
  it('リロードボタンのクリック', () => {
    // window.location.reload のモック
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <WASMErrorHandler
        error={{
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message: 'Fetch failed',
          timestamp: Date.now(),
        }}
      />
    );

    const reloadButton = screen.getByText('リロード');
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('ボタンホバーエフェクト', () => {
    render(
      <WASMErrorHandler
        error={{
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message: 'Fetch failed',
          timestamp: Date.now(),
        }}
      />
    );

    const reloadButton = screen.getByText('リロード');

    // ホバー時のスタイル変更を確認
    fireEvent.mouseEnter(reloadButton);
    expect(reloadButton).toHaveStyle({ /* 期待されるスタイル */ });

    // ホバー解除時のスタイル復元を確認
    fireEvent.mouseLeave(reloadButton);
    expect(reloadButton).toHaveStyle({ /* 元のスタイル */ });
  });
});
```

#### 3. テストケース構成

- describe: "All error types coverage"
  - ✅ 各エラータイプ・理由の組み合わせをテスト
- describe: "User interactions"
  - ✅ リロードボタンクリック
  - ✅ ボタンホバーエフェクト

### 推定工数

小（30分-1時間）

### 優先度

高

### 影響

Statements +2.1%, Branches +2.8%, Functions +3.0%, Lines +2.1%

---

## 3. src/lib/ai/wasm-loader.ts (カバレッジ 63.04%)

### 現状分析

- テストファイルは存在: `src/lib/ai/__tests__/wasm-loader-emscripten.test.ts`
- 基本的なケースはカバーされているが、エッジケースやエラーハンドリングが未カバー
- Emscripten を使用した WASM ローダーの複雑なロジック

### 未カバー箇所

- 行59-63: `locateFile` コールバック（Module.locateFile 内）
  - ai.wasm の場合のパス解決
  - その他のファイルの場合のパス解決
- 行105: タイムアウト時の reject
- 行113-123: `onRuntimeInitialized` コールバック内
  - HEAP8, HEAPU8, HEAP32, HEAPU32 のコピー
  - memory オブジェクトの設定
  - timeout のクリア
- 行139-147: \_malloc/\_free が見つからない場合のエラー
- 行161-172: タイムアウトエラーハンドリング
- 行175-182: その他のエラーハンドリング
- 行199: isModuleReady の false パス

### カバー済み

- ✅ importScripts が利用不可（Worker 以外）
- ✅ importScripts がエラーを投げる
- ✅ Module が利用不可
- ✅ \_init_ai の呼び出し
- ✅ パス解析（ai.js の導出）

### 対応方針

#### 1. 既存テストファイルに追加テストケースを追加

```typescript
describe('wasm-loader - locateFile callback', () => {
  it('ai.wasm の場合の絶対 URL 返却', () => {
    // Module.locateFile が ai.wasm に対して呼ばれることを確認
    // 絶対URLが返されることを確認
  });

  it('その他のファイルの場合の as-is 返却', () => {
    // Module.locateFile が他のファイルに対して呼ばれることを確認
    // ファイル名がそのまま返されることを確認
  });
});

describe('wasm-loader - timeout scenarios', () => {
  it('onRuntimeInitialized が10秒以内に呼ばれない場合', async () => {
    jest.useFakeTimers();

    // loadWASM を呼び出し
    const loadPromise = loadWASM('/base/path');

    // 10秒経過をシミュレート
    jest.advanceTimersByTime(10000);

    // タイムアウトエラーが投げられることを確認
    await expect(loadPromise).rejects.toThrow(/timeout/i);

    jest.useRealTimers();
  });
});

describe('wasm-loader - onRuntimeInitialized', () => {
  it('HEAP 変数のコピー確認', () => {
    // onRuntimeInitialized 内で HEAP8, HEAPU8, HEAP32, HEAPU32 がコピーされることを確認
  });

  it('memory オブジェクトの設定確認', () => {
    // Module.memory が正しく設定されることを確認
  });
});

describe('wasm-loader - malloc/free errors', () => {
  it('Module に _malloc が存在しない場合', async () => {
    // _malloc がない Module をモック
    // エラーが投げられることを確認
  });

  it('Module に _free が存在しない場合', async () => {
    // _free がない Module をモック
    // エラーが投げられることを確認
  });
});

describe('wasm-loader - other errors', () => {
  it('予期しない例外の処理', async () => {
    // importScripts が予期しない例外を投げる場合のテスト
  });
});
```

#### 2. isModuleReady の追加テスト

```typescript
describe('isModuleReady', () => {
  it('null/undefined の場合', () => {
    expect(isModuleReady(null)).toBe(false);
    expect(isModuleReady(undefined)).toBe(false);
  });

  it('必要な関数が欠けている場合', () => {
    const incompleteModule = { _init_ai: () => {} };
    expect(isModuleReady(incompleteModule)).toBe(false);
  });

  it('すべての関数が揃っている場合', () => {
    const completeModule = {
      _init_ai: () => {},
      _get_best_move: () => {},
      _malloc: () => {},
      _free: () => {},
      HEAP8: new Int8Array(0),
      HEAPU8: new Uint8Array(0),
      HEAP32: new Int32Array(0),
      HEAPU32: new Uint32Array(0),
    };
    expect(isModuleReady(completeModule)).toBe(true);
  });
});
```

#### 3. 実装上の注意点

1. **タイムアウトテスト**
   - `jest.useFakeTimers()` を使用してタイムアウトをシミュレート
   - テスト後に `jest.useRealTimers()` でリセット

2. **WASM モジュールのモック**
   - 重いWASMモジュールの読み込みをモック化
   - テストの高速化と安定性向上

3. **グローバル状態の管理**
   - `importScripts` や `Module` のモックがテスト間で干渉しないように注意

### 推定工数

中（1.5-2時間）

### 優先度

中

### 影響

Statements +2.2%, Branches +4.8%, Functions +3.0%, Lines +2.2%

---

## まとめ

優先度: 高のファイルは以下の順序で対応することを推奨：

1. **useAIPlayer.ts** (最優先)
   - カバレッジ0%で影響が最大
   - Workerモック戦略の確立が必要

2. **WASMErrorHandler.tsx**
   - 比較的短時間で完了可能
   - エラーハンドリングの品質向上

3. **wasm-loader.ts**
   - WASMローダーの信頼性向上
   - エッジケースの網羅

次のステップ: [優先度: 中のファイル対応](./02-priority-medium.md)
