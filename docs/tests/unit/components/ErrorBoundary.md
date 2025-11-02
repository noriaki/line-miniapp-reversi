# ErrorBoundary.test.tsx

## ファイル情報

- **テストファイル**: `src/components/__tests__/ErrorBoundary.test.tsx`
- **テスト対象コード**: `src/components/ErrorBoundary.tsx`
- **テスト数**: 8
- **削除推奨テスト数**: 0

## テストケース一覧

### ErrorBoundary

#### Test 1: should catch errors and display error UI

- **元のテストタイトル**: should catch errors and display error UI
- **日本語タイトル**: エラーをキャッチしてエラーUIを表示すること
- **テスト内容**: ErrorBoundaryが子コンポーネントのエラーをキャッチし、エラーメッセージを表示することを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  expect(
    screen.getByText(/予期しないエラーが発生しました/)
  ).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(
    screen.getByText(/予期しないエラーが発生しました/)
  ).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should display retry button

- **元のテストタイトル**: should display retry button
- **日本語タイトル**: 再試行ボタンを表示すること
- **テスト内容**: エラー発生時に再試行ボタンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  const retryButton = screen.getByRole('button', { name: /再試行/ });
  expect(retryButton).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(retryButton).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should display reload button

- **元のテストタイトル**: should display reload button
- **日本語タイトル**: リロードボタンを表示すること
- **テスト内容**: エラー発生時にリロードボタンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  const reloadButton = screen.getByRole('button', { name: /リロード/ });
  expect(reloadButton).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(reloadButton).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should log error to console with ErrorLog format

- **元のテストタイトル**: should log error to console with ErrorLog format
- **日本語タイトル**: エラーをErrorLogフォーマットでコンソールにログ記録すること
- **テスト内容**: エラーがキャッチされた際、構造化されたエラーログがconsole.errorに出力されることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  const errorBoundaryCall = consoleErrorSpy.mock.calls.find((call) => {
    const firstArg = call[0];
    return (
      typeof firstArg === 'string' && firstArg.includes('[ErrorBoundary]')
    );
  });

  expect(errorBoundaryCall).toBeDefined();
  expect(errorBoundaryCall![1]).toMatchObject({
    timestamp: expect.any(String),
    errorType: expect.any(String),
    errorCategory: 'system',
    message: 'Test error',
    stack: expect.any(String),
  });
  ```

- **期待値**:
  ```typescript
  expect(errorBoundaryCall).toBeDefined();
  expect(errorBoundaryCall![1]).toMatchObject({
    timestamp: expect.any(String),
    errorType: expect.any(String),
    errorCategory: 'system',
    message: 'Test error',
    stack: expect.any(String),
  });
  ```
- **削除判定**: [ ] 不要
- **備考**: エラーログの構造化フォーマット検証として重要

---

#### Test 5: should reset error state when retry button is clicked

- **元のテストタイトル**: should reset error state when retry button is clicked
- **日本語タイトル**: 再試行ボタンをクリックした際にエラー状態をリセットすること
- **テスト内容**: 再試行ボタンをクリックすることでエラー状態がリセットされ、通常のコンテンツが再表示されることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ControlledComponent />
    </ErrorBoundary>
  );

  expect(
    screen.getByText(/予期しないエラーが発生しました/)
  ).toBeInTheDocument();

  shouldThrow = false;
  const retryButton = screen.getByRole('button', { name: /再試行/ });
  fireEvent.click(retryButton);

  expect(screen.getByText('Normal content')).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText('Normal content')).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should have reload button that calls window.location.reload

- **元のテストタイトル**: should have reload button that calls window.location.reload
- **日本語タイトル**: window.location.reloadを呼び出すリロードボタンを持つこと
- **テスト内容**: リロードボタンが存在し、onClickハンドラーが設定されていることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  const reloadButton = screen.getByRole('button', { name: /リロード/ });
  expect(reloadButton).toBeInTheDocument();
  expect(reloadButton).toHaveAttribute('style');
  ```

- **期待値**:
  ```typescript
  expect(reloadButton).toBeInTheDocument();
  expect(reloadButton).toHaveAttribute('style');
  ```
- **削除判定**: [ ] 不要
- **備考**: 実際のwindow.location.reload()の呼び出しはE2Eテストで検証

---

#### Test 7: should render children normally when no error occurs

- **元のテストタイトル**: should render children normally when no error occurs
- **日本語タイトル**: エラーが発生しない場合は子要素を通常通りレンダリングすること
- **テスト内容**: エラーが発生しない場合、ErrorBoundaryが子要素を正常に表示することを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={false} />
    </ErrorBoundary>
  );

  expect(screen.getByText('Normal content')).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText('Normal content')).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should display user-friendly Japanese error message

- **元のテストタイトル**: should display user-friendly Japanese error message
- **日本語タイトル**: ユーザーフレンドリーな日本語エラーメッセージを表示すること
- **テスト内容**: エラー発生時にユーザー向けの分かりやすい日本語メッセージが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  expect(
    screen.getByText(/予期しないエラーが発生しました/)
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /問題が解決しない場合は、ページをリロードしてください。/
    )
  ).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(
    screen.getByText(/予期しないエラーが発生しました/)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/問題が解決しない場合は、ページをリロードしてください。/)
  ).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 8件（全て）

このファイルは**ErrorBoundaryコンポーネント**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- エラーキャッチとUI表示（3件）: エラーメッセージ、再試行ボタン、リロードボタン
- エラーログ記録（1件）: 構造化ログフォーマット検証
- リトライ機能（1件）: エラー状態リセット
- リロード機能（1件）: リロードボタンの存在確認
- 正常時の動作（1件）: 子要素の通常レンダリング
- UX（1件）: ユーザーフレンドリーな日本語メッセージ

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

ErrorBoundaryのテストは以下の理由で重要です：

- アプリケーション全体のエラーハンドリングの中核
- ユーザー体験の保護（エラー発生時の適切なフィードバック）
- 開発者体験の向上（構造化されたエラーログ）
- 復旧機能（再試行・リロード）の検証

変更不要です。
