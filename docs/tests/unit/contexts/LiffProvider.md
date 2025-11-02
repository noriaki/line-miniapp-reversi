# LiffProvider Tests

## ファイル情報

- **テストファイル**: `src/contexts/__tests__/LiffProvider.test.tsx`
- **テスト対象コード**: `src/contexts/LiffProvider.tsx`
- **テスト数**: 20
- **削除推奨テスト数**: 0

## 概要

このファイルは**LiffProviderコンポーネントのビジネスロジック**をテストしています。

テストは以下のカテゴリに分類されます:

- **LIFF_ID未設定時の動作テスト**: LIFF_ID未設定時の動作（2件）
- **初期化成功フロー**: LIFF初期化成功時の動作（4件）
- **初期化失敗フロー**: LIFF初期化失敗時のエラーハンドリング（3件）
- **プロフィール取得失敗フロー**: プロフィール取得失敗時のエラーハンドリング（5件）
- **login/logout関数の動作検証**: ログイン・ログアウト関数の動作（6件）

## テストケース一覧（カテゴリ別）

### LIFF_ID未設定時の動作テスト（2件）

#### Test 1: should output warning log when LIFF_ID is not set

- **元のテストタイトル**: should output warning log when LIFF_ID is not set
- **日本語タイトル**: LIFF_IDが未設定の場合、警告ログを出力すること
- **テスト内容**: `NEXT_PUBLIC_LIFF_ID`が未設定の場合、警告メッセージがコンソールに出力されることを確認
- **テストコード抜粋**:

  ```typescript
  delete process.env.NEXT_PUBLIC_LIFF_ID;

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'LIFF_ID not set: LIFF features are disabled'
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    'LIFF_ID not set: LIFF features are disabled'
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should enter LIFF disabled mode when LIFF_ID is not set

- **元のテストタイトル**: should enter LIFF disabled mode when LIFF_ID is not set
- **日本語タイトル**: LIFF_IDが未設定の場合、LIFF無効化モードに入ること
- **テスト内容**: `NEXT_PUBLIC_LIFF_ID`が未設定の場合、LIFF無効化モード（全LIFF機能がnull）に入り、エラーなしでreadyになることを確認
- **テストコード抜粋**:

  ```typescript
  delete process.env.NEXT_PUBLIC_LIFF_ID;

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  // LIFF disabled mode: all LIFF features are null
  expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  expect(screen.getByTestId('in-client')).toHaveTextContent('null');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  expect(screen.getByTestId('in-client')).toHaveTextContent('null');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```
- **削除判定**: [ ] 不要

---

### 初期化成功フロー（4件）

#### Test 3: should successfully initialize and retrieve isInClient status

- **元のテストタイトル**: should successfully initialize and retrieve isInClient status
- **日本語タイトル**: 初期化に成功し、isInClientステータスを取得できること
- **テスト内容**: LIFF初期化が成功し、`isInClient`ステータスが正しく取得されることを確認（LINEクライアント内での実行判定）
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(false);

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  expect(screen.getByTestId('in-client')).toHaveTextContent('true');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  expect(screen.getByTestId('in-client')).toHaveTextContent('true');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should successfully retrieve isLoggedIn status

- **元のテストタイトル**: should successfully retrieve isLoggedIn status
- **日本語タイトル**: isLoggedInステータスを正しく取得できること
- **テスト内容**: LIFF初期化が成功し、`isLoggedIn`ステータスが正しく取得されることを確認（ログイン状態の判定）
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(false);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  expect(screen.getByTestId('in-client')).toHaveTextContent('false');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('in-client')).toHaveTextContent('false');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should retrieve profile when logged in

- **元のテストタイトル**: should retrieve profile when logged in
- **日本語タイトル**: ログイン時にプロフィールを取得できること
- **テスト内容**: ログイン状態の場合、LINEプロフィール（userId、displayName、pictureUrl、statusMessage）が正しく取得されることを確認
- **テストコード抜粋**:

  ```typescript
  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);
  const getProfileSpy = jest.spyOn(liff, 'getProfile').mockResolvedValue({
    userId: 'U123456',
    displayName: 'Test User',
    pictureUrl: 'https://example.com/pic.jpg',
    statusMessage: 'Hello!',
  });

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
  expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
  expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should not retrieve profile when not logged in

- **元のテストタイトル**: should not retrieve profile when not logged in
- **日本語タイトル**: 未ログイン時はプロフィールを取得しないこと
- **テスト内容**: 未ログイン状態の場合、プロフィール取得が行われず、profileがnullであることを確認
- **テストコード抜粋**:

  ```typescript
  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(false);

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  ```
- **削除判定**: [ ] 不要

---

### 初期化失敗フロー（3件）

#### Test 7: should set error message when initialization fails

- **元のテストタイトル**: should set error message when initialization fails
- **日本語タイトル**: 初期化失敗時にエラーメッセージを設定すること
- **テスト内容**: LIFF初期化が失敗した場合、ユーザーフレンドリーなエラーメッセージ（「LINE integration is unavailable. You can continue playing in normal mode.」）が設定されることを確認
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
  const initSpy = jest
    .spyOn(liff, 'init')
    .mockRejectedValue(new Error('Network error'));

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  expect(screen.getByTestId('error')).toHaveTextContent(
    'LINE integration is unavailable. You can continue playing in normal mode.'
  );
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('error')).toHaveTextContent(
    'LINE integration is unavailable. You can continue playing in normal mode.'
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should enter fallback mode when initialization fails

- **元のテストタイトル**: should enter fallback mode when initialization fails
- **日本語タイトル**: 初期化失敗時にフォールバックモードに入ること
- **テスト内容**: LIFF初期化が失敗した場合、フォールバックモード（ready=true、エラー設定済み、全LIFF機能がnull）に入ることを確認
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
  const initSpy = jest
    .spyOn(liff, 'init')
    .mockRejectedValue(new Error('Init failed'));

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  // Fallback mode: ready=true, error is set, LIFF features are null
  expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
  expect(screen.getByTestId('in-client')).toHaveTextContent('null');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
  expect(screen.getByTestId('in-client')).toHaveTextContent('null');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('null');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```
- **削除判定**: [ ] 不要

---

#### Test 9: should log initialization error to console

- **元のテストタイトル**: should log initialization error to console
- **日本語タイトル**: 初期化エラーをコンソールにログ出力すること
- **テスト内容**: LIFF初期化が失敗した場合、エラー詳細がconsole.errorに出力されることを確認
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
  const initError = new Error('LIFF SDK initialization error');
  const initSpy = jest.spyOn(liff, 'init').mockRejectedValue(initError);

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'LIFF initialization failed:',
      initError
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    'LIFF initialization failed:',
    initError
  );
  ```
- **削除判定**: [ ] 不要

---

### プロフィール取得失敗フロー（5件）

#### Test 10: should set error message when profile retrieval fails

- **元のテストタイトル**: should set error message when profile retrieval fails
- **日本語タイトル**: プロフィール取得失敗時にエラーメッセージを設定すること
- **テスト内容**: プロフィール取得が失敗した場合、エラーメッセージ（「Failed to retrieve profile information」）が設定されることを確認
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);
  const profileSpy = jest
    .spyOn(liff, 'getProfile')
    .mockRejectedValue(new Error('Profile API error'));

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  expect(screen.getByTestId('error')).toHaveTextContent(
    'Failed to retrieve profile information'
  );
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('error')).toHaveTextContent(
    'Failed to retrieve profile information'
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 11: should display default icon when profile retrieval fails

- **元のテストタイトル**: should display default icon when profile retrieval fails
- **日本語タイトル**: プロフィール取得失敗時にデフォルトアイコンを表示すること
- **テスト内容**: プロフィール取得が失敗した場合、profileがnullとなり、UIでデフォルトアイコンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);
  const profileSpy = jest
    .spyOn(liff, 'getProfile')
    .mockRejectedValue(new Error('Profile error'));

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  // Profile is null, which triggers default icon display in UI
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```
- **削除判定**: [ ] 不要

---

#### Test 12: should log profile error to console

- **元のテストタイトル**: should log profile error to console
- **日本語タイトル**: プロフィールエラーをコンソールにログ出力すること
- **テスト内容**: プロフィール取得が失敗した場合、エラー詳細がconsole.errorに出力されることを確認
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';
  const profileError = new Error('Profile retrieval failed');

  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);
  const profileSpy = jest
    .spyOn(liff, 'getProfile')
    .mockRejectedValue(profileError);

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Profile retrieval failed:',
      profileError
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    'Profile retrieval failed:',
    profileError
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 13: should keep LIFF features enabled when only profile fails

- **元のテストタイトル**: should keep LIFF features enabled when only profile fails
- **日本語タイトル**: プロフィール取得のみ失敗した場合、LIFF機能は有効なままであること
- **テスト内容**: プロフィール取得のみが失敗した場合、他のLIFF機能（isInClient、isLoggedIn）は正常に機能し続けることを確認
- **テストコード抜粋**:

  ```typescript
  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(false);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);
  const profileSpy = jest
    .spyOn(liff, 'getProfile')
    .mockRejectedValue(new Error('Network timeout'));

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  // LIFF state is correct except for profile
  expect(screen.getByTestId('in-client')).toHaveTextContent('false');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  expect(screen.getByTestId('in-client')).toHaveTextContent('false');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  ```
- **削除判定**: [ ] 不要

---

### login/logout関数の動作検証（6件）

#### Test 14: should call liff.login() when login function is invoked

- **元のテストタイトル**: should call liff.login() when login function is invoked
- **日本語タイトル**: login関数呼び出し時にliff.login()が呼ばれること
- **テスト内容**: 提供されるlogin関数が呼ばれた際、LIFF SDKのliff.login()が呼び出されることを確認
- **テストコード抜粋**:

  ```typescript
  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(false);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(false);
  const loginSpy = jest.spyOn(liff, 'login').mockImplementation();

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  const user = userEvent.setup();
  await user.click(screen.getByTestId('login-btn'));

  expect(loginSpy).toHaveBeenCalled();
  ```

- **期待値**:
  ```typescript
  expect(loginSpy).toHaveBeenCalled();
  ```
- **削除判定**: [ ] 不要

---

#### Test 15: should throw error when login is called before initialization

- **元のテストタイトル**: should throw error when login is called before initialization
- **日本語タイトル**: 初期化前にloginが呼ばれた場合、エラーを投げること
- **テスト内容**: LIFF初期化完了前（isReady=false）にlogin関数が呼ばれた場合、「LIFF not initialized」エラーが投げられることを確認
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

  const initSpy = jest.spyOn(liff, 'init').mockImplementation(
    () => new Promise(() => {}) // Never resolves
  );
  const loginSpy = jest.spyOn(liff, 'login').mockImplementation();

  const TestComponentWithError = () => {
    const { login, isReady } = useLiff();

    if (!isReady) {
      // Try to login before ready
      expect(() => login()).toThrow('LIFF not initialized');
    }

    return <div data-testid="test">Test</div>;
  };

  render(
    <LiffProvider>
      <TestComponentWithError />
    </LiffProvider>
  );
  ```

- **期待値**:
  ```typescript
  expect(() => login()).toThrow('LIFF not initialized');
  ```
- **削除判定**: [ ] 不要

---

#### Test 16: should call liff.logout() when logout function is invoked

- **元のテストタイトル**: should call liff.logout() when logout function is invoked
- **日本語タイトル**: logout関数呼び出し時にliff.logout()が呼ばれること
- **テスト内容**: 提供されるlogout関数が呼ばれた際、LIFF SDKのliff.logout()が呼び出されることを確認
- **テストコード抜粋**:

  ```typescript
  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);
  const getProfileSpy = jest.spyOn(liff, 'getProfile').mockResolvedValue({
    userId: 'U123456',
    displayName: 'Test User',
  });
  const logoutSpy = jest.spyOn(liff, 'logout').mockImplementation();

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  const user = userEvent.setup();
  await user.click(screen.getByTestId('logout-btn'));

  expect(logoutSpy).toHaveBeenCalled();
  ```

- **期待値**:
  ```typescript
  expect(logoutSpy).toHaveBeenCalled();
  ```
- **削除判定**: [ ] 不要

---

#### Test 17: should clear profile and update login status after logout

- **元のテストタイトル**: should clear profile and update login status after logout
- **日本語タイトル**: ログアウト後にプロフィールをクリアし、ログイン状態を更新すること
- **テスト内容**: logout関数呼び出し後、profileがnullにクリアされ、isLoggedInがfalseに更新されることを確認
- **テストコード抜粋**:

  ```typescript
  const initSpy = jest.spyOn(liff, 'init').mockResolvedValue();
  const isInClientSpy = jest
    .spyOn(liff, 'isInClient')
    .mockReturnValue(true);
  const isLoggedInSpy = jest
    .spyOn(liff, 'isLoggedIn')
    .mockReturnValue(true);
  const getProfileSpy = jest.spyOn(liff, 'getProfile').mockResolvedValue({
    userId: 'U123456',
    displayName: 'Test User',
  });
  const logoutSpy = jest.spyOn(liff, 'logout').mockImplementation();

  render(
    <LiffProvider>
      <TestComponent />
    </LiffProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('ready')).toHaveTextContent('ready');
  });

  // Verify logged in with profile
  expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('true');

  const user = userEvent.setup();
  await user.click(screen.getByTestId('logout-btn'));

  // Verify logout clears profile and updates status
  await waitFor(() => {
    expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  });
  ```

- **期待値**:

  ```typescript
  // ログイン時
  expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('true');

  // ログアウト後
  expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  ```

- **削除判定**: [ ] 不要

---

#### Test 18: should throw error when logout is called before initialization

- **元のテストタイトル**: should throw error when logout is called before initialization
- **日本語タイトル**: 初期化前にlogoutが呼ばれた場合、エラーを投げること
- **テスト内容**: LIFF初期化完了前（isReady=false）にlogout関数が呼ばれた場合、「LIFF not initialized」エラーが投げられることを確認
- **テストコード抜粋**:

  ```typescript
  process.env.NEXT_PUBLIC_LIFF_ID = 'test-liff-id';

  const initSpy = jest.spyOn(liff, 'init').mockImplementation(
    () => new Promise(() => {}) // Never resolves
  );
  const logoutSpy = jest.spyOn(liff, 'logout').mockImplementation();

  const TestComponentWithError = () => {
    const { logout, isReady } = useLiff();

    if (!isReady) {
      // Try to logout before ready
      expect(() => logout()).toThrow('LIFF not initialized');
    }

    return <div data-testid="test">Test</div>;
  };

  render(
    <LiffProvider>
      <TestComponentWithError />
    </LiffProvider>
  );
  ```

- **期待値**:
  ```typescript
  expect(() => logout()).toThrow('LIFF not initialized');
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 20件（全て）

このファイルは**LiffProviderコンポーネントのビジネスロジック**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- LIFF_ID未設定時の動作（2件）: 警告ログ、無効化モード
- 初期化成功フロー（4件）: isInClient、isLoggedIn、プロフィール取得、未ログイン時
- 初期化失敗フロー（3件）: エラーメッセージ、フォールバックモード、コンソールログ
- プロフィール取得失敗フロー（5件）: エラーメッセージ、デフォルトアイコン、コンソールログ、機能の独立性
- login/logout関数（6件）: SDK呼び出し、初期化前エラー、状態更新

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

LiffProviderのテストは以下の理由で重要です：

- LIFF統合の包括的なエラーハンドリング
- 初期化成功・失敗の両フロー検証
- プロフィール取得の堅牢性
- ログイン・ログアウト機能の正確性
- LIFF_ID未設定時のグレースフルデグラデーション
- フォールバックモードの適切な動作

変更不要です。

**備考**:

- @line/liff-mockを使用した公式モックAPI活用
- 環境変数（NEXT_PUBLIC_LIFF_ID）の動的な設定・削除テスト
- console.error/console.warnのスパイによるログ検証
- jest.spyOnを使用したLIFF SDK関数のモック化
