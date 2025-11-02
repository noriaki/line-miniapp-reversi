# テストカバレッジ改善プラン - 優先度: 中

このドキュメントでは、カバレッジが50%以上70%未満の中優先度ファイルの対応方針を記載します。

---

## 4. src/components/ErrorBoundary.tsx (カバレッジ 73.68%)

### 現状分析

- テストファイルは存在: `src/components/__tests__/ErrorBoundary.test.tsx`
- 基本的なエラーキャッチとリトライ機能はテスト済み
- リロードボタンとホバーエフェクトが未テスト

### 未カバー箇所

- 行80: `handleReload` 関数（リロードボタンのクリック）
- 行195, 198: 再試行ボタンのマウスオーバー/アウトイベントハンドラー
- 行216, 219: リロードボタンのマウスオーバー/アウトイベントハンドラー

### カバー済み

- ✅ エラーキャッチとエラーUI表示
- ✅ エラーログ（ErrorLog形式）
- ✅ リトライボタンのクリック
- ✅ 正常なレンダリング（エラーなし）

### 対応方針

#### 1. リロードボタンのクリックテスト

```typescript
describe('ErrorBoundary - Reload functionality', () => {
  it('リロードボタンクリック時の window.location.reload 呼び出し', () => {
    // window.location.reload のモック
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    // エラーを投げるコンポーネントをレンダリング
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // リロードボタンをクリック
    const reloadButton = screen.getByText(/リロード|reload/i);
    fireEvent.click(reloadButton);

    // window.location.reload が呼ばれたことを確認
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. ボタンホバーエフェクトのテスト

Jestと`@testing-library/react`の`fireEvent`を使用したホバーエフェクトのテスト：

```typescript
describe('ErrorBoundary - Button hover effects', () => {
  beforeEach(() => {
    // エラーを投げるコンポーネント
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
  });

  it('再試行ボタンのマウスオーバー時のスタイル変更', () => {
    const retryButton = screen.getByText(/再試行|retry/i);

    // ホバー前の状態を確認
    const initialStyle = window.getComputedStyle(retryButton);

    // マウスオーバーイベントを発火
    fireEvent.mouseEnter(retryButton);

    // スタイル変更を確認（具体的なスタイルはコンポーネントに依存）
    // 例: 背景色の変更など
    expect(retryButton).toHaveStyle({
      /* 期待されるホバー時のスタイル */
    });
  });

  it('再試行ボタンのマウスアウト時のスタイル復元', () => {
    const retryButton = screen.getByText(/再試行|retry/i);

    // マウスオーバー → マウスアウト
    fireEvent.mouseEnter(retryButton);
    fireEvent.mouseLeave(retryButton);

    // スタイルが元に戻ることを確認
    expect(retryButton).toHaveStyle({
      /* 元のスタイル */
    });
  });

  it('リロードボタンのマウスオーバー時のスタイル変更', () => {
    const reloadButton = screen.getByText(/リロード|reload/i);

    // マウスオーバーイベントを発火
    fireEvent.mouseEnter(reloadButton);

    // スタイル変更を確認
    expect(reloadButton).toHaveStyle({
      /* 期待されるホバー時のスタイル */
    });
  });

  it('リロードボタンのマウスアウト時のスタイル復元', () => {
    const reloadButton = screen.getByText(/リロード|reload/i);

    // マウスオーバー → マウスアウト
    fireEvent.mouseEnter(reloadButton);
    fireEvent.mouseLeave(reloadButton);

    // スタイルが元に戻ることを確認
    expect(reloadButton).toHaveStyle({
      /* 元のスタイル */
    });
  });
});
```

#### 3. テストケース構成

- describe: "Reload functionality"
  - ✅ リロードボタンクリック時の window.location.reload 呼び出し
- describe: "Button hover effects"
  - ✅ 再試行ボタンのホバーエフェクト（マウスオーバー/アウト）
  - ✅ リロードボタンのホバーエフェクト（マウスオーバー/アウト）

#### 4. 実装上の注意点

1. **window.location.reload のモック**
   - `Object.defineProperty` を使用してモック化
   - テスト後に元の状態に戻すことを忘れずに

2. **スタイルのテスト**
   - インラインスタイルと CSS クラスの両方を考慮
   - `window.getComputedStyle()` を使用する場合もある

3. **ErrorBoundary の特性**
   - エラーが投げられた時のみ表示される
   - テスト用のエラーを投げるコンポーネントを用意

### 推定工数

小（30分）

### 優先度

低

### 影響

Statements +1.6%, Branches +1.9%, Functions +3.0%, Lines +1.6%

---

## 5. src/components/GameBoard.tsx (カバレッジ 81.13%)

### 現状分析

- 複数のテストファイルが存在:
  - `GameBoard.test.tsx` (メインテスト)
  - `GameBoard-error-handling.test.tsx` (エラーハンドリング)
  - `GameBoard-pass-logic.test.tsx` (パスロジック)
  - `GameBoard-pass-performance.test.tsx` (パスパフォーマンス)
  - `GameBoard-liff.test.tsx` (LIFF統合)
  - `GameBoard.integration.test.tsx` (統合テスト)
  - `GameBoard.final-verification.test.tsx` (最終検証)
- 基本機能は十分カバーされているが、一部のエッジケースが未カバー

### 未カバー箇所

- 行69: `handleLineLogin` 内の catch ブロック（LINE ログイン失敗）
- 行87-90: `handlePass` - ゲームがプレイ中でない場合のエラーログ
- 行98-99: `handlePass` - 有効な手が存在するのにパスボタンがクリックされた場合
- 行156-160: ゲーム終了後のプレイヤー切り替え（ゲームが終了しない場合）
- 行187-191: `consecutivePassCount` の範囲外の値エラー（< 0 または > 2）
- 行242-243: AI が無効な手を返した場合のエラーハンドリング
- 行276: AI の手でゲームが終了しなかった場合の分岐
- 行290-292: AI 計算エラー時の catch ブロック
- 行331-332: エラーメッセージまたはパスメッセージの条件分岐

### カバー済み

- ✅ 基本的なゲームフロー
- ✅ パスロジック（正常系）
- ✅ エラーハンドリング（主要なケース）
- ✅ LIFF 統合
- ✅ AI プレイヤー（正常系）

### 対応方針

#### 1. GameBoard-liff.test.tsx に追加: LINE ログイン失敗時のエラーハンドリング

プロジェクトがJestとLIFF-Mockパッケージを使用していることを考慮したテスト実装：

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from '../GameBoard';
import liff from '@line/liff'; // LIFF-Mock パッケージ

// LIFF のモック設定
jest.mock('@line/liff');

describe('GameBoard - LINE login error handling', () => {
  beforeEach(() => {
    // console.error のモック
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle LINE login errors gracefully', async () => {
    const mockError = new Error('LINE SDK not initialized');

    // liff.login をモックしてエラーを投げる
    (liff.login as jest.Mock).mockRejectedValue(mockError);

    render(<GameBoard />);

    // LINE ログインボタンをクリック
    const loginButton = screen.getByRole('button', { name: /line.*ログイン/i });
    fireEvent.click(loginButton);

    // エラーハンドリングを待つ
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'LINE login error:',
        expect.any(Error)
      );
    });

    // エラーメッセージが表示されることを確認（オプション）
    // expect(screen.getByText(/ログインに失敗/i)).toBeInTheDocument();
  });

  it('should handle LIFF initialization errors', async () => {
    const mockError = new Error('LIFF initialization failed');

    // liff.init をモックしてエラーを投げる
    (liff.init as jest.Mock).mockRejectedValue(mockError);

    render(<GameBoard />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('LIFF'),
        expect.any(Error)
      );
    });
  });
});
```

**LIFF-Mock パッケージの使用について**:

- プロジェクトが既にLIFF-Mockパッケージを使用している場合、上記のようにインポートして使用
- `jest.mock('@line/liff')` でモジュール全体をモック化
- 各テストケースで必要なメソッドのみ `mockRejectedValue` や `mockResolvedValue` でカスタマイズ

#### 2. GameBoard-pass-logic.test.tsx に追加: パスロジックのエッジケース

```typescript
describe('GameBoard - Pass logic edge cases', () => {
  it('ゲームがプレイ中でない時にパスを試みる', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<GameBoard />);

    // ゲームを終了状態にする
    // ... (ゲーム終了のロジック)

    // パスボタンをクリック
    const passButton = screen.getByRole('button', { name: /パス/i });
    fireEvent.click(passButton);

    // エラーログが出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('playing')
    );

    consoleSpy.mockRestore();
  });

  it('有効な手が存在する時にパスボタンをクリック', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<GameBoard />);

    // 有効な手が存在する状態でパスボタンをクリック
    const passButton = screen.getByRole('button', { name: /パス/i });
    fireEvent.click(passButton);

    // エラーログまたは警告が出力されることを確認
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
```

#### 3. GameBoard-error-handling.test.tsx に追加: エラーハンドリングの網羅

```typescript
describe('GameBoard - Error handling edge cases', () => {
  it('consecutivePassCount が範囲外の値の場合', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // consecutivePassCount を範囲外の値に設定
    // ... (状態を直接操作するか、モックを使用)

    render(<GameBoard />);

    // エラーログが出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('consecutivePassCount'),
      expect.objectContaining({ count: expect.any(Number) })
    );

    consoleSpy.mockRestore();
  });

  it('AI が無効な手を返した場合', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // AI が無効な手を返すようにモック
    // ... (useAIPlayer のモック)

    render(<GameBoard />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'AI returned invalid move, skipping turn'
      );
    });

    consoleSpy.mockRestore();
  });

  it('AI 計算がエラーを投げた場合', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // AI 計算がエラーを投げるようにモック
    // ... (useAIPlayer のモック)

    render(<GameBoard />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI calculation error'),
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
```

#### 4. GameBoard.test.tsx に追加: メッセージ表示条件

```typescript
describe('GameBoard - Message display conditions', () => {
  it('エラーメッセージの表示', () => {
    // エラー状態を作成
    // ... (エラーを発生させる操作)

    render(<GameBoard />);

    // エラーメッセージが表示されることを確認
    expect(screen.getByText(/エラー/i)).toBeInTheDocument();
  });

  it('パスメッセージの表示', () => {
    // パス状態を作成
    // ... (パスが発生する操作)

    render(<GameBoard />);

    // パスメッセージが表示されることを確認
    expect(screen.getByText(/パス/i)).toBeInTheDocument();
  });
});
```

#### 5. エッジケースのドキュメント

各エッジケースの重要性を記録：

**consecutivePassCount の範囲外**:

- **発生条件**: ゲームロジックのバグや状態管理の不整合
- **影響範囲**: ゲームが予期しない状態になり、プレイ不能になる可能性
- **テストの価値**: 開発環境で早期に検出し、本番環境でのバグを防ぐ

**AI が無効な手を返す**:

- **発生条件**: AI エンジンのバグや WASM モジュールのエラー
- **影響範囲**: ゲームが進行不能になる、または不正な状態になる
- **テストの価値**: AIの品質を保証し、ユーザー体験を維持

**LINE ログイン失敗**:

- **発生条件**: LIFF SDK の初期化失敗、ネットワークエラー、ユーザーの認証拒否
- **影響範囲**: ユーザーがゲームにアクセスできない
- **テストの価値**: エラーハンドリングの品質を保証し、適切なエラーメッセージを表示

#### 6. テストケース構成

- **GameBoard-liff.test.tsx** に追加:
  - ✅ LINE ログイン失敗時のエラーハンドリング
  - ✅ LIFF 初期化失敗時のエラーハンドリング

- **GameBoard-pass-logic.test.tsx** に追加:
  - ✅ ゲームがプレイ中でない時にパスを試みる
  - ✅ 有効な手が存在する時にパスボタンをクリック

- **GameBoard-error-handling.test.tsx** に追加:
  - ✅ `consecutivePassCount` が範囲外の値の場合
  - ✅ AI が無効な手を返した場合
  - ✅ AI 計算がエラーを投げた場合

- **GameBoard.test.tsx** に追加:
  - ✅ エラーメッセージとパスメッセージの表示条件

#### 7. 実装上の注意点

1. **LIFF-Mock パッケージの活用**
   - プロジェクトが採用している LIFF-Mock パッケージを使用
   - `jest.mock('@line/liff')` でモジュールをモック化
   - 各メソッドの振る舞いをカスタマイズ

2. **console.error のモック**
   - エラーログの出力を検証するため、`jest.spyOn(console, 'error')` を使用
   - テスト後に必ず `mockRestore()` を呼び出す

3. **非同期処理の待機**
   - `waitFor` を使用して非同期処理の完了を待つ
   - タイムアウト値を適切に設定

4. **状態の操作**
   - テスト対象の状態を作るために、適切なモックや操作を実施
   - グローバル状態の漏れを防ぐため、各テスト後にクリーンアップ

### 推定工数

中（1.5-2時間）

### 優先度

中

### 影響

Statements +1.4%, Branches +0.7%, Functions +1.0%, Lines +1.3%

---

## まとめ

優先度: 中のファイルは以下の順序で対応することを推奨：

1. **ErrorBoundary.tsx**
   - 比較的短時間で完了可能
   - リロードとホバーエフェクトのテスト追加

2. **GameBoard.tsx**
   - 既存のテストファイルに追加
   - LIFF-Mock を活用した LINE ログインエラーのテスト
   - エッジケースの網羅的なテスト

次のステップ: [優先度: 低のファイル対応](./03-priority-low.md)
