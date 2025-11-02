# useLiff.test.tsx

## ファイル情報

- **テストファイル**: `src/hooks/__tests__/useLiff.test.tsx`
- **テスト対象コード**: `src/hooks/useLiff.tsx`
- **テスト数**: 4
- **削除推奨テスト数**: 0

## テストケース一覧

### useLiff Hook

#### Test 1: should exist as a module

- **元のテストタイトル**: should exist as a module
- **日本語タイトル**: モジュールとして存在すること
- **テスト内容**: useLiffフックがモジュールとして定義され、関数であることを確認
- **テストコード抜粋**:
  ```typescript
  const { useLiff } = require('../useLiff');
  expect(useLiff).toBeDefined();
  expect(typeof useLiff).toBe('function');
  ```
- **期待値**:
  ```typescript
  expect(useLiff).toBeDefined();
  expect(typeof useLiff).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should return context value when wrapped in provider

- **元のテストタイトル**: should return context value when wrapped in provider
- **日本語タイトル**: プロバイダーでラップされた際にコンテキスト値を返すこと
- **テスト内容**: LiffContext.Providerでラップされた場合、useLiffがコンテキスト値を正しく返すことを確認
- **テストコード抜粋**:

  ```typescript
  const mockContextValue: LiffContextType = {
    isReady: true,
    error: null,
    isInClient: true,
    isLoggedIn: true,
    profile: {
      userId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/pic.jpg',
    },
    login: jest.fn(),
    logout: jest.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LiffContext.Provider value={mockContextValue}>
      {children}
    </LiffContext.Provider>
  );

  const { result } = renderHook(() => useLiff(), { wrapper });

  expect(result.current).toEqual(mockContextValue);
  expect(result.current.isReady).toBe(true);
  expect(result.current.profile?.displayName).toBe('Test User');
  ```

- **期待値**:
  ```typescript
  expect(result.current).toEqual(mockContextValue);
  expect(result.current.isReady).toBe(true);
  expect(result.current.profile?.displayName).toBe('Test User');
  ```
- **削除判定**: [ ] 不要

---

### Task 8.2: Error Handling

#### Test 3: should throw error when used outside LiffProvider

- **元のテストタイトル**: should throw error when used outside LiffProvider
- **日本語タイトル**: LiffProviderの外で使用された際にエラーを投げること
- **テスト内容**: useLiffがLiffProvider外で使用された場合、エラーが投げられることを確認
- **テストコード抜粋**:

  ```typescript
  const { useLiff } = require('../useLiff');

  expect(() => {
    renderHook(() => useLiff());
  }).toThrow();
  ```

- **期待値**:
  ```typescript
  expect(() => {
    renderHook(() => useLiff());
  }).toThrow();
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should throw descriptive error message when context is undefined

- **元のテストタイトル**: should throw descriptive error message when context is undefined
- **日本語タイトル**: コンテキストが未定義の場合、説明的なエラーメッセージを投げること
- **テスト内容**: useLiffがLiffProvider外で使用された場合、"LiffProvider"を含むエラーメッセージが投げられることを確認
- **テストコード抜粋**:

  ```typescript
  const { useLiff } = require('../useLiff');

  expect(() => {
    renderHook(() => useLiff());
  }).toThrow(/LiffProvider/);
  ```

- **期待値**:
  ```typescript
  expect(() => {
    renderHook(() => useLiff());
  }).toThrow(/LiffProvider/);
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 4件（全て）

このファイルは**useLiffフック**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- モジュール存在確認（1件）: useLiffフックの定義確認
- コンテキスト値の返却（1件）: LiffProvider内での正常動作
- エラーハンドリング（2件）: Provider外での使用時のエラー投出

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

useLiffフックのテストは以下の理由で重要です：

- LIFF統合の正確な動作確認
- LiffProviderとの適切な連携
- Provider外での使用時の適切なエラー処理
- コンテキスト値の正確な取得

変更不要です。

**備考**:

- 実際のuseLiffフックの詳細なテストはLiffProvider統合テストで間接的に行われています
- このテストファイルは基本的な動作とエラーハンドリングに焦点を当てています
