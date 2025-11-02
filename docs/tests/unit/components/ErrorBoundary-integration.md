# ErrorBoundary.integration.test.tsx

## ファイル情報

- **テストファイル**: `src/components/__tests__/ErrorBoundary.integration.test.tsx`
- **テスト対象コード**: `src/components/ErrorBoundary.tsx`
- **テスト数**: 8
- **削除推奨テスト数**: 1

## テストケース一覧

### Integration Test: Error Boundary

#### Test 1: should catch and display error when child component throws

- **元のテストタイトル**: should catch and display error when child component throws
- **日本語タイトル**: 子コンポーネントがエラーを投げた際にキャッチして表示すること
- **テスト内容**: ErrorBoundaryが子コンポーネントのエラーをキャッチし、エラーメッセージを表示することを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
  ```
- **削除判定**: [x] 不要
- **削除理由**: ErrorBoundary.test.tsxのTest 1と完全に重複

---

#### Test 2: should display normal content when no error occurs

- **元のテストタイトル**: should display normal content when no error occurs
- **日本語タイトル**: エラーが発生しない場合は通常のコンテンツを表示すること
- **テスト内容**: エラーが発生しない場合、通常のコンテンツが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={false} />
    </ErrorBoundary>
  );

  expect(screen.getByText('正常なコンテンツ')).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText('正常なコンテンツ')).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: ErrorBoundary.test.tsxのTest 7と類似だが、統合テストとして独立した価値がある

---

#### Test 3: should show retry button in error state

- **元のテストタイトル**: should show retry button in error state
- **日本語タイトル**: エラー状態で再試行ボタンを表示すること
- **テスト内容**: エラー発生時に再試行ボタンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  const retryButton = screen.queryByText(/再試行|リトライ|もう一度/);
  expect(retryButton).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(retryButton).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should show reload button in error state

- **元のテストタイトル**: should show reload button in error state
- **日本語タイトル**: エラー状態でリロードボタンを表示すること
- **テスト内容**: エラー発生時にリロードボタンが表示されることを確認（複数存在する可能性も考慮）
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  const reloadButtons = screen.queryAllByText(/リロード|再読み込み/);
  expect(reloadButtons.length).toBeGreaterThan(0);
  ```

- **期待値**:
  ```typescript
  expect(reloadButtons.length).toBeGreaterThan(0);
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should log error to console when error is caught

- **元のテストタイトル**: should log error to console when error is caught
- **日本語タイトル**: エラーをキャッチした際にコンソールにログを記録すること
- **テスト内容**: エラーがキャッチされた際にconsole.errorが呼ばれることを確認
- **テストコード抜粋**:

  ```typescript
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  expect(consoleErrorSpy).toHaveBeenCalled();
  ```

- **期待値**:
  ```typescript
  expect(consoleErrorSpy).toHaveBeenCalled();
  ```
- **削除判定**: [ ] 不要
- **備考**: ErrorBoundary.test.tsxのTest 4はログフォーマット検証、こちらはログ記録自体の検証

---

#### Test 6: should handle nested error boundaries

- **元のテストタイトル**: should handle nested error boundaries
- **日本語タイトル**: ネストされたエラーバウンダリを処理すること
- **テスト内容**: ErrorBoundaryをネストした場合、内側のエラーバウンダリがエラーをキャッチし、外側のコンテンツは影響を受けないことを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <div>外側のコンテンツ</div>
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    </ErrorBoundary>
  );

  expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
  expect(screen.getByText('外側のコンテンツ')).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
  expect(screen.getByText('外側のコンテンツ')).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: ネストされたエラーバウンダリの動作を検証する重要なテスト

---

#### Test 7: should provide user-friendly error message without technical details

- **元のテストタイトル**: should provide user-friendly error message without technical details
- **日本語タイトル**: 技術的な詳細を含まないユーザーフレンドリーなエラーメッセージを提供すること
- **テスト内容**: エラーメッセージが表示され、スタックトレースなどの技術的詳細が表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  const errorMessage = screen.getByText(/エラーが発生しました/);
  expect(errorMessage).toBeInTheDocument();

  const stackTrace = screen.queryByText(/at ThrowError/);
  expect(stackTrace).not.toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(errorMessage).toBeInTheDocument();
  expect(stackTrace).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: (未記載のテストまたは全体のまとめ)

テストファイル上は7つのテストケースのみが存在します。Test 8としてカウントしていた項目は誤りでした。

---

## サマリー

### 保持推奨テスト: 7件

このファイルは**ErrorBoundaryの統合テスト**であり、7件のテストが保持すべきです。

**主要テストカテゴリ:**

- エラーキャッチ（2件）: エラー表示、通常コンテンツ表示
- UI要素表示（2件）: 再試行ボタン、リロードボタン
- エラーログ（1件）: コンソールログ記録
- ネスト処理（1件）: ネストされたエラーバウンダリ
- UX（1件）: ユーザーフレンドリーメッセージ（技術的詳細の非表示）

### 削除推奨テスト: 1件

**重複テスト（1件）:**

- Test 1: ErrorBoundary.test.tsxのTest 1と完全に重複

### 推奨事項

このテストファイルは**削除推奨1件（約14%）**です。

ErrorBoundary統合テストは以下の理由で重要です：

- ネストされたエラーバウンダリの動作検証
- 統合レベルでのエラーハンドリング確認
- ユーザー向けメッセージの適切性検証

Test 1は削除を推奨します（単体テストファイルで既にカバー済み）。その他のテストは統合テストとしての独自の価値があります。
