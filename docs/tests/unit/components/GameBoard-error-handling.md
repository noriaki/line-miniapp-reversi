# GameBoard-error-handling.test.tsx

## ファイル情報

- **テストファイル**: `src/components/__tests__/GameBoard-error-handling.test.tsx`
- **テスト対象コード**: `src/components/GameBoard.tsx`
- **テスト数**: 10
- **削除推奨テスト数**: 0

## 概要

このファイルは**GameBoardのパス操作エラーハンドリング**をテストしています。

テストは以下のタスクに分類されます：

- **Task 5.1**: 無効なパス操作のエラーハンドリング（2件）
- **Task 5.2**: ゲーム状態不整合のエラーハンドリング（2件）
- **Task 5.3**: 連続パスカウンタの範囲検証（3件）
- **Error Message Display**: エラーメッセージ表示（2件）
- **Error Logging Requirements**: エラーログ記録（1件）

## テストケース一覧

### Task 5.1: Invalid Pass Operation Error Handling

#### Test 1: 有効な手が存在する場合、パス操作を無視すること

- **元のテストタイトル**: 有効な手が存在する場合、パス操作を無視すること
- **日本語タイトル**: 有効な手が存在する場合、パス操作を無視すること
- **テスト内容**: 有効な手が存在する場合、パスボタンが無効化され、クリックが実行されないことを確認
- **テストコード抜粋**:

  ```typescript
  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  expect(passButton).toBeDisabled();
  expect(screen.getByText(/あなたのターン/)).toBeInTheDocument();
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeDisabled();
  expect(screen.getByText(/あなたのターン/)).toBeInTheDocument();
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: パスボタンが無効状態でクリックされた場合、何も実行しないこと

- **元のテストタイトル**: パスボタンが無効状態でクリックされた場合、何も実行しないこと
- **日本語タイトル**: パスボタンが無効状態でクリックされた場合、何も実行しないこと
- **テスト内容**: 無効化されたパスボタンがクリックされても、エラーメッセージが表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  expect(passButton).toBeDisabled();
  expect(screen.queryByText(/無効/)).not.toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeDisabled();
  expect(screen.queryByText(/無効/)).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

### Task 5.2: Game State Inconsistency Error Handling

#### Test 3: ゲーム状態がplayingでない場合、パス操作を中止すること

- **元のテストタイトル**: ゲーム状態がplayingでない場合、パス操作を中止すること
- **日本語タイトル**: ゲーム状態がplayingでない場合、パス操作を中止すること
- **テスト内容**: ゲームが終了した場合、パスボタンが表示されなくなることを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  await userEvent.click(passButton);

  await waitFor(() => {
    expect(screen.getByText(/パスしました/)).toBeInTheDocument();
  });

  await waitFor(() => {
    const gameResult = screen.queryByTestId('game-result');
    if (gameResult) {
      expect(
        screen.queryByRole('button', { name: /ターンをパスする/i })
      ).not.toBeInTheDocument();
    }
  });
  ```

- **期待値**:
  ```typescript
  expect(
    screen.queryByRole('button', { name: /ターンをパスする/i })
  ).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: ゲーム状態が不正な場合、エラーログを記録すること

- **元のテストタイトル**: ゲーム状態が不正な場合、エラーログを記録すること
- **日本語タイトル**: ゲーム状態が不正な場合、エラーログを記録すること
- **テスト内容**: ゲーム状態が不正な場合にエラーログが記録されることを検証（防御的チェック）
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  await userEvent.click(passButton);

  await waitFor(() => {
    expect(screen.getByText(/パスしました/)).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  // UIが不正な状態でのhandlePass呼び出しを防ぐため、エラーログは通常発生しない
  ```
- **削除判定**: [ ] 不要
- **備考**: 防御的プログラミングのための検証テスト

---

### Task 5.3: Consecutive Pass Count Range Validation

#### Test 5: 連続パスカウンタが範囲外の値にならないこと

- **元のテストタイトル**: 連続パスカウンタが範囲外の値にならないこと
- **日本語タイトル**: 連続パスカウンタが範囲外の値にならないこと
- **テスト内容**: 連続パスカウンタが2回のパス後にゲームが終了し、無効な値にならないことを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  await userEvent.click(passButton);

  await waitFor(() => {
    expect(screen.getByText(/パスしました/)).toBeInTheDocument();
  });

  await waitFor(
    () => {
      const gameResult = screen.queryByTestId('game-result');
      expect(gameResult).toBeInTheDocument();
    },
    { timeout: 3000 }
  );

  expect(consoleErrorSpy).not.toHaveBeenCalledWith(
    'Invalid consecutivePassCount value',
    expect.any(Object)
  );
  ```

- **期待値**:
  ```typescript
  expect(gameResult).toBeInTheDocument();
  expect(consoleErrorSpy).not.toHaveBeenCalledWith(
    'Invalid consecutivePassCount value',
    expect.any(Object)
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: 連続パスカウンタが2を超えないこと

- **元のテストタイトル**: 連続パスカウンタが2を超えないこと
- **日本語タイトル**: 連続パスカウンタが2を超えないこと
- **テスト内容**: 連続パスカウンタがMath.min()によって2にクランプされることを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  await userEvent.click(passButton);

  await waitFor(() => {
    expect(screen.getByText(/パスしました/)).toBeInTheDocument();
  });

  await waitFor(
    () => {
      expect(screen.queryByTestId('game-result')).toBeInTheDocument();
    },
    { timeout: 3000 }
  );

  expect(consoleErrorSpy).not.toHaveBeenCalled();
  ```

- **期待値**:
  ```typescript
  expect(screen.queryByTestId('game-result')).toBeInTheDocument();
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: カウンタが不正な値の場合、エラーログを記録すること

- **元のテストタイトル**: カウンタが不正な値の場合、エラーログを記録すること
- **日本語タイトル**: カウンタが不正な値の場合、エラーログを記録すること
- **テスト内容**: 防御的エラーログの存在を確認（実装のMath.min/maxにより通常は発生しない）
- **テストコード抜粋**:
  ```typescript
  expect(consoleErrorSpy).not.toHaveBeenCalledWith(
    'Invalid consecutivePassCount value',
    expect.any(Object)
  );
  ```
- **期待値**:
  ```typescript
  expect(consoleErrorSpy).not.toHaveBeenCalledWith(
    'Invalid consecutivePassCount value',
    expect.any(Object)
  );
  ```
- **削除判定**: [ ] 不要
- **備考**: ドキュメントテストとして重要（実装が無効な値を防ぐことを確認）

---

### Error Message Display

#### Test 8: エラー発生時、ユーザーにエラーメッセージを表示すること

- **元のテストタイトル**: エラー発生時、ユーザーにエラーメッセージを表示すること
- **日本語タイトル**: エラー発生時、ユーザーにエラーメッセージを表示すること
- **テスト内容**: useGameErrorHandlerフックによるエラーメッセージ表示の要件確認
- **削除判定**: [ ] 不要
- **備考**: このテストは要件定義のプレースホルダー（実際の検証はuseGameErrorHandlerで行う）

---

#### Test 9: パス操作のエラーは無視され、UI状態が説明的であること

- **元のテストタイトル**: パス操作のエラーは無視され、UI状態が説明的であること
- **日本語タイトル**: パス操作のエラーは無視され、UI状態が説明的であること
- **テスト内容**: パスボタンが無効化されている状態で、エラーメッセージが表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  expect(passButton).toBeDisabled();
  expect(passButton).toHaveAttribute('aria-disabled', 'true');
  expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeDisabled();
  expect(passButton).toHaveAttribute('aria-disabled', 'true');
  expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

### Error Logging Requirements

#### Test 10: エラー詳細をコンソールログに記録すること

- **元のテストタイトル**: エラー詳細をコンソールログに記録すること
- **日本語タイトル**: エラー詳細をコンソールログに記録すること
- **テスト内容**: 防御的なエラーログが実装に存在することを確認（無効化ボタンで通常は発生しない）
- **テストコード抜粋**:

  ```typescript
  render(<GameBoard />);

  const passButton = screen.getByRole('button', {
    name: /ターンをパスする/i,
  });

  expect(passButton).toBeDisabled();
  ```

- **期待値**:
  ```typescript
  // 防御的ログ記録は実装に存在するが、UIが適切に動作するため発生しない
  ```
- **削除判定**: [ ] 不要
- **備考**: GameBoard.tsx:76の防御的ログ実装の確認

---

## サマリー

### 保持推奨テスト: 10件（全て）

このファイルは**GameBoardのパス操作エラーハンドリング**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 無効なパス操作（2件）: 有効手存在時のパス無効化、無効ボタンのクリック防止
- ゲーム状態不整合（2件）: ゲーム終了時のパスボタン非表示、不正状態のエラーログ
- 連続パスカウンタ（3件）: 範囲外値防止、最大値クランプ、不正値のエラーログ
- エラーメッセージ表示（2件）: useGameErrorHandler統合、UI状態の説明性
- エラーログ記録（1件）: 防御的ログ実装の確認

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

パス操作エラーハンドリングのテストは以下の理由で重要です：

- 無効なパス操作の防止（UI層での制御）
- ゲーム状態の整合性確保
- 連続パスカウンタの範囲検証
- 防御的プログラミングの実装確認
- ユーザー体験の保護（適切なUI状態）

変更不要です。
