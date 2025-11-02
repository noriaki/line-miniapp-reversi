# GameBoard-liff.test.tsx

## ファイル情報

- **テストファイル**: `src/components/__tests__/GameBoard-liff.test.tsx`
- **テスト対象コード**: `src/components/GameBoard.tsx`
- **テスト数**: 25（注: 既存ドキュメントには24と記載されていましたが、実際には25テスト存在します）
- **削除推奨テスト数**: 3

## 概要

このファイルは**GameBoardのLIFF統合機能**をテストしています。

LIFF（LINE Front-end Framework）は、LINE内でウェブアプリを実行するためのフレームワークです。このテストでは以下を検証します:

- LINEプロフィールアイコンの表示
- 外部ブラウザでのログインUI
- ログイン状態によるUI更新
- スコアUI最適化（displayName非表示、要素順序、アクセシビリティ）

## テストケース一覧

### Task 4.1: Profile Icon Display（6件）

#### Test 1: should display LINE profile icon when profile is available

- **元のテストタイトル**: should display LINE profile icon when profile is available
- **日本語タイトル**: LINEプロフィールが利用可能な場合、プロフィールアイコンを表示すること
- **テスト内容**: LIFF初期化完了、ログイン済み、プロフィール情報（pictureUrl含む）が利用可能な場合、プロフィールアイコンが正しく表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display LINE profile icon when profile is available', () => {
    // Mock LIFF with profile
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Should display profile icon
    const profileIcon = screen.getByTestId('profile-icon');
    expect(profileIcon).toBeInTheDocument();
    expect(profileIcon).toHaveAttribute(
      'src',
      'https://example.com/profile.jpg'
    );
    expect(profileIcon).toHaveAttribute('alt', 'Test User');
  });
  ```

- **期待値**:
  ```typescript
  expect(profileIcon).toBeInTheDocument();
  expect(profileIcon).toHaveAttribute('src', 'https://example.com/profile.jpg');
  expect(profileIcon).toHaveAttribute('alt', 'Test User');
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should display default icon when profile is not available

- **元のテストタイトル**: should display default icon when profile is not available
- **日本語タイトル**: プロフィールが利用不可の場合、デフォルトアイコンを表示すること
- **テスト内容**: LIFF初期化完了だが、ログインしていない（profile=null）場合、デフォルトアイコンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display default icon when profile is not available', () => {
    // Mock LIFF without profile
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Should display default icon
    const defaultIcon = screen.getByTestId('default-profile-icon');
    expect(defaultIcon).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(defaultIcon).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should display default icon when pictureUrl is missing

- **元のテストタイトル**: should display default icon when pictureUrl is missing
- **日本語タイトル**: pictureUrlがない場合、デフォルトアイコンを表示すること
- **テスト内容**: ログイン済みだが、プロフィールにpictureUrlが含まれていない場合、デフォルトアイコンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display default icon when pictureUrl is missing', () => {
    // Mock LIFF with profile but no pictureUrl
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        // No pictureUrl
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Should display default icon
    const defaultIcon = screen.getByTestId('default-profile-icon');
    expect(defaultIcon).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(defaultIcon).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: pictureUrlがオプショナルであることを考慮した重要なエッジケース

---

#### Test 4: should display default icon during LIFF initialization

- **元のテストタイトル**: should display default icon during LIFF initialization
- **日本語タイトル**: LIFF初期化中はデフォルトアイコンを表示すること
- **テスト内容**: LIFF初期化中（isReady=false）の場合、デフォルトアイコンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display default icon during LIFF initialization', () => {
    // Mock LIFF not ready
    mockLiffState = {
      isReady: false,
      error: null,
      isInClient: null,
      isLoggedIn: null,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Should display default icon while initializing
    const defaultIcon = screen.getByTestId('default-profile-icon');
    expect(defaultIcon).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(defaultIcon).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: 初期化中のローディング状態での表示を確認

---

#### Test 5: should display default icon when LIFF has error

- **元のテストタイトル**: should display default icon when LIFF has error
- **日本語タイトル**: LIFFエラー時はデフォルトアイコンを表示すること
- **テスト内容**: LIFF初期化でエラーが発生した場合、デフォルトアイコンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display default icon when LIFF has error', () => {
    // Mock LIFF with error
    mockLiffState = {
      isReady: true,
      error: 'LIFF initialization failed',
      isInClient: null,
      isLoggedIn: null,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Should display default icon on error
    const defaultIcon = screen.getByTestId('default-profile-icon');
    expect(defaultIcon).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(defaultIcon).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: エラーハンドリングの検証

---

#### Test 6: should render profile icon in circular shape

- **元のテストタイトル**: should render profile icon in circular shape
- **日本語タイトル**: プロフィールアイコンが円形でレンダリングされること
- **テスト内容**: プロフィールアイコンにrounded-fullクラスが適用され、円形で表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should render profile icon in circular shape', () => {
    // Mock LIFF with profile
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    const profileIcon = screen.getByTestId('profile-icon');
    // Check for circular styling (rounded-full class)
    expect(profileIcon).toHaveClass('rounded-full');
  });
  ```

- **期待値**:
  ```typescript
  expect(profileIcon).toHaveClass('rounded-full');
  ```
- **削除判定**: [ ] 不要
- **備考**: UIスタイリングの検証

---

### Task 4.2: External Browser Login UI（5件）

#### Test 7: should display login button when in external browser and not logged in

- **元のテストタイトル**: should display login button when in external browser and not logged in
- **日本語タイトル**: 外部ブラウザかつ未ログインの場合、ログインボタンを表示すること
- **テスト内容**: 外部ブラウザ（isInClient=false）かつ未ログイン（isLoggedIn=false）の場合、LINEログインボタンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display login button when in external browser and not logged in', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false, // External browser
      isLoggedIn: false, // Not logged in
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    const loginButton = screen.getByTestId('liff-login-button');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent(/LINE.*ログイン/i);
  });
  ```

- **期待値**:
  ```typescript
  expect(loginButton).toBeInTheDocument();
  expect(loginButton).toHaveTextContent(/LINE.*ログイン/i);
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should NOT display login button when in LINE app

- **元のテストタイトル**: should NOT display login button when in LINE app
- **日本語タイトル**: LINEアプリ内ではログインボタンを表示しないこと
- **テスト内容**: LINEアプリ内（isInClient=true）の場合、ログインボタンが表示されないことを確認（LINEアプリ内では自動ログイン）
- **テストコード抜粋**:

  ```typescript
  it('should NOT display login button when in LINE app', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true, // Inside LINE app
      isLoggedIn: false,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    const loginButton = screen.queryByTestId('liff-login-button');
    expect(loginButton).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(loginButton).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: LINEアプリ内では自動ログインされるため、ログインボタンは不要

---

#### Test 9: should NOT display login button when already logged in

- **元のテストタイトル**: should NOT display login button when already logged in
- **日本語タイトル**: ログイン済みの場合、ログインボタンを表示しないこと
- **テスト内容**: 外部ブラウザだが、既にログイン済み（isLoggedIn=true）の場合、ログインボタンが表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  it('should NOT display login button when already logged in', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: true, // Already logged in
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    const loginButton = screen.queryByTestId('liff-login-button');
    expect(loginButton).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(loginButton).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 10: should NOT display login button during LIFF initialization

- **元のテストタイトル**: should NOT display login button during LIFF initialization
- **日本語タイトル**: LIFF初期化中はログインボタンを表示しないこと
- **テスト内容**: LIFF初期化中（isReady=false）の場合、ログインボタンが表示されないことを確認（初期化完了まで待機）
- **テストコード抜粋**:

  ```typescript
  it('should NOT display login button during LIFF initialization', () => {
    mockLiffState = {
      isReady: false, // Not ready
      error: null,
      isInClient: null,
      isLoggedIn: null,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    const loginButton = screen.queryByTestId('liff-login-button');
    expect(loginButton).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(loginButton).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: 初期化完了まではログインボタンを表示しない（ユーザー体験の向上）

---

#### Test 11: should call login function when login button is clicked

- **元のテストタイトル**: should call login function when login button is clicked
- **日本語タイトル**: ログインボタンクリック時にlogin関数が呼ばれること
- **テスト内容**: ログインボタンをクリックすると、useLiffフックのlogin関数が1回呼ばれることを確認
- **テストコード抜粋**:

  ```typescript
  it('should call login function when login button is clicked', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
      login: mockLogin,
      logout: jest.fn(),
    };

    render(<GameBoard />);

    const loginButton = screen.getByTestId('liff-login-button');
    await user.click(loginButton);

    expect(mockLogin).toHaveBeenCalledTimes(1);
  });
  ```

- **期待値**:
  ```typescript
  expect(mockLogin).toHaveBeenCalledTimes(1);
  ```
- **削除判定**: [ ] 不要

---

### Task 4.3: Login State UI Updates（3件）

#### Test 12: should display profile icon when logged in (displayName removed per optimization)

- **元のテストタイトル**: should display profile icon when logged in (displayName removed per optimization)
- **日本語タイトル**: ログイン時にプロフィールアイコンを表示すること（displayNameは最適化により削除）
- **テスト内容**: ログイン済みの場合、プロフィールアイコンが表示されるが、displayNameテキストは表示されないことを確認（UI最適化）
- **テストコード抜粋**:

  ```typescript
  it('should display profile icon when logged in (displayName removed per optimization)', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'テストユーザー',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Profile icon should be displayed but displayName should NOT be displayed
    expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
    expect(screen.queryByText(/テストユーザー/)).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
  expect(screen.queryByText(/テストユーザー/)).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: UI最適化により、displayNameテキストは表示しない（アイコンのみ）

---

#### Test 13: should NOT display profile name when not logged in

- **元のテストタイトル**: should NOT display profile name when not logged in
- **日本語タイトル**: 未ログイン時にプロフィール名を表示しないこと
- **テスト内容**: 未ログイン時には、プロフィール名が表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  it('should NOT display profile name when not logged in', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Profile name should not exist
    expect(screen.queryByText(/テストユーザー/)).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(screen.queryByText(/テストユーザー/)).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 14: should show default UI during LIFF initialization

- **元のテストタイトル**: should show default UI during LIFF initialization
- **日本語タイトル**: LIFF初期化中はデフォルトUIを表示すること
- **テスト内容**: LIFF初期化中（isReady=false）の場合、デフォルトアイコンが表示され、ログインボタンは表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  it('should show default UI during LIFF initialization', () => {
    mockLiffState = {
      isReady: false, // Still initializing
      error: null,
      isInClient: null,
      isLoggedIn: null,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // Should show default icon
    expect(screen.getByTestId('default-profile-icon')).toBeInTheDocument();
    // Should NOT show login button
    expect(screen.queryByTestId('liff-login-button')).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(screen.getByTestId('default-profile-icon')).toBeInTheDocument();
  expect(screen.queryByTestId('liff-login-button')).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: 初期化中の一貫したデフォルトUI表示を確認

---

### Score UI Optimization Tests - Task 1.1: displayName should NOT be displayed（3件）

#### Test 15: should NOT display displayName text even when profile has displayName

- **元のテストタイトル**: should NOT display displayName text even when profile has displayName
- **日本語タイトル**: プロフィールにdisplayNameがあっても、テキストを表示しないこと
- **テスト内容**: プロフィールにdisplayNameが含まれていても、UIにdisplayNameテキストを表示しないことを確認（UI最適化）
- **テストコード抜粋**:

  ```typescript
  it('should NOT display displayName text even when profile has displayName', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User Display Name',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // displayName text should NOT be in the document
    expect(
      screen.queryByText('Test User Display Name')
    ).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(screen.queryByText('Test User Display Name')).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 16: should NOT display displayName in LIFF environment

- **元のテストタイトル**: should NOT display displayName in LIFF environment
- **日本語タイトル**: LIFF環境でdisplayNameを表示しないこと
- **テスト内容**: LIFF環境（isInClient=true）でdisplayNameテキストが表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  it('should NOT display displayName in LIFF environment', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'テストユーザー',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    expect(screen.queryByText('テストユーザー')).not.toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(screen.queryByText('テストユーザー')).not.toBeInTheDocument();
  ```
- **削除判定**: [x] 不要
- **削除理由**: Test 15で「プロフィールがあってもdisplayNameを表示しない」ことを検証済み。LIFF環境/非LIFF環境による区別は意味がない。Test 15と重複。

---

#### Test 17: should NOT display displayName in non-LIFF environment

- **元のテストタイトル**: should NOT display displayName in non-LIFF environment
- **日本語タイトル**: 非LIFF環境でdisplayNameを表示しないこと
- **テスト内容**: 非LIFF環境（isInClient=false）でdisplayNameテキストが表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  it('should NOT display displayName in non-LIFF environment', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    // No profile name should be visible
    const stoneCountSection = screen.getByText(/vs/i).parentElement;
    expect(stoneCountSection).toBeInTheDocument();
    // Should not contain any displayName text
    expect(stoneCountSection?.textContent).not.toMatch(/User/);
  });
  ```

- **期待値**:
  ```typescript
  expect(stoneCountSection).toBeInTheDocument();
  expect(stoneCountSection?.textContent).not.toMatch(/User/);
  ```
- **削除判定**: [x] 不要
- **削除理由**: Test 15で「プロフィールがあってもdisplayNameを表示しない」ことを検証済み。LIFF環境/非LIFF環境による区別は意味がない。Test 15と重複。

---

### Score UI Optimization Tests - Task 1.2 & 1.3: Score element order（7件）

#### Test 18: should display score elements in correct order

- **元のテストタイトル**: should display score elements in correct order: black icon → black count → vs → white count → white icon
- **日本語タイトル**: スコア要素が正しい順序で表示されること（黒アイコン → 黒スコア → vs → 白スコア → 白アイコン）
- **テスト内容**: スコアエリアの要素が正しい順序（3つのセクション: 黒プレイヤー、vs区切り、白プレイヤー）で配置されていることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display score elements in correct order: black icon → black count → vs → white count → white icon', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    const { container } = render(<GameBoard />);
    const stoneCount = container.querySelector('.stone-count');

    expect(stoneCount).toBeInTheDocument();

    // Get all children in order
    const children = Array.from(stoneCount?.children || []);

    // Should have 3 main sections: black section, divider, white section
    expect(children.length).toBe(3);

    // First child: black player section
    expect(children[0]).toHaveClass('stone-count-item');

    // Second child: vs divider
    expect(children[1]).toHaveClass('stone-count-divider');
    expect(children[1].textContent).toBe('vs');

    // Third child: white player section
    expect(children[2]).toHaveClass('stone-count-item');
  });
  ```

- **期待値**:
  ```typescript
  expect(stoneCount).toBeInTheDocument();
  expect(children.length).toBe(3);
  expect(children[0]).toHaveClass('stone-count-item');
  expect(children[1]).toHaveClass('stone-count-divider');
  expect(children[1].textContent).toBe('vs');
  expect(children[2]).toHaveClass('stone-count-item');
  ```
- **削除判定**: [ ] 不要

---

#### Test 19: should display black icon on the left side of black count

- **元のテストタイトル**: should display black icon on the left side of black count
- **日本語タイトル**: 黒アイコンが黒スコアの左側に表示されること
- **テスト内容**: 黒プレイヤーセクションで、アイコンが最初の子要素として配置されていることを確認（視覚的に左側）
- **テストコード抜粋**:

  ```typescript
  it('should display black icon on the left side of black count', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    const { container } = render(<GameBoard />);
    const stoneCount = container.querySelector('.stone-count');
    const blackSection = stoneCount?.children[0];

    // Black section should have icon as first child
    const firstChild = blackSection?.children[0];
    expect(firstChild).toBeInstanceOf(HTMLImageElement);
  });
  ```

- **期待値**:
  ```typescript
  expect(firstChild).toBeInstanceOf(HTMLImageElement);
  ```
- **削除判定**: [ ] 不要

---

#### Test 20: should display white icon on the right side of white count

- **元のテストタイトル**: should display white icon on the right side of white count
- **日本語タイトル**: 白アイコンが白スコアの右側に表示されること
- **テスト内容**: 白プレイヤーセクションで、stone-displayクラスとstone-display-whiteクラスを持つ要素が存在することを確認（CSS row-reverseで視覚的に右側）
- **テストコード抜粋**:

  ```typescript
  it('should display white icon on the right side of white count', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    const { container } = render(<GameBoard />);
    const stoneCount = container.querySelector('.stone-count');
    const whiteSection = stoneCount?.children[2];

    // White section should have icon as first child in DOM (CSS row-reverse makes it visually last)
    const firstChild = whiteSection?.firstElementChild;
    expect(firstChild).toHaveClass('stone-display');
    expect(firstChild).toHaveClass('stone-display-white');
  });
  ```

- **期待値**:
  ```typescript
  expect(firstChild).toHaveClass('stone-display');
  expect(firstChild).toHaveClass('stone-display-white');
  ```
- **削除判定**: [ ] 不要
- **備考**: CSS row-reverseにより、DOM順序と視覚的順序が異なる

---

#### Test 21: should display profile icon for black player when available

- **元のテストタイトル**: should display profile icon for black player when available
- **日本語タイトル**: 黒プレイヤー用にプロフィールアイコンを表示すること
- **テスト内容**: プロフィール情報が利用可能な場合、黒プレイヤー（ユーザー）のアイコンとしてプロフィール画像が表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should display profile icon for black player when available', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(<GameBoard />);

    const profileIcon = screen.getByTestId('profile-icon');
    expect(profileIcon).toBeInTheDocument();
    expect(profileIcon).toHaveAttribute(
      'src',
      'https://example.com/profile.jpg'
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(profileIcon).toBeInTheDocument();
  expect(profileIcon).toHaveAttribute('src', 'https://example.com/profile.jpg');
  ```
- **削除判定**: [ ] 不要

---

#### Test 22: should fallback to default stone icon when profile image fails

- **元のテストタイトル**: should fallback to default stone icon when profile image fails
- **日本語タイトル**: プロフィール画像の読み込み失敗時にデフォルト石アイコンにフォールバックすること
- **テスト内容**: プロフィール画像の読み込みに失敗した場合（error イベント）、デフォルトアイコンにフォールバックすることを確認
- **テストコード抜粋**:

  ```typescript
  it('should fallback to default stone icon when profile image fails', async () => {
    const { act } = await import('@testing-library/react');

    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/invalid.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    const { rerender } = render(<GameBoard />);

    // Trigger image error
    const profileIcon = screen.getByTestId('profile-icon');
    expect(profileIcon).toBeInTheDocument();

    // Simulate image load error wrapped in act
    await act(async () => {
      const imgElement = profileIcon as HTMLImageElement;
      imgElement.dispatchEvent(new Event('error'));
    });

    // Re-render to reflect state change
    rerender(<GameBoard />);

    // After error, should show default icon
    expect(screen.getByTestId('default-profile-icon')).toBeInTheDocument();
  });
  ```

- **期待値**:

  ```typescript
  // Before error
  expect(profileIcon).toBeInTheDocument();

  // After error
  expect(screen.getByTestId('default-profile-icon')).toBeInTheDocument();
  ```

- **削除判定**: [ ] 不要
- **備考**: 画像読み込み失敗時のエラーハンドリング検証

---

#### Test 23: should always use stone icon for white player

- **元のテストタイトル**: should always use stone icon for white player
- **日本語タイトル**: 白プレイヤーには常に石アイコンを使用すること
- **テスト内容**: 白プレイヤー（AI）には、プロフィールアイコンではなく、常に石アイコンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should always use stone icon for white player', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: true,
      isLoggedIn: true,
      profile: {
        userId: 'U1234567890',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
      },
      login: jest.fn(),
      logout: jest.fn(),
    };

    const { container } = render(<GameBoard />);
    const stoneCount = container.querySelector('.stone-count');
    const whiteSection = stoneCount?.children[2];

    // White section should have stone icon
    const whiteIcon = whiteSection?.querySelector('.stone-display-white');
    expect(whiteIcon).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(whiteIcon).toBeInTheDocument();
  ```
- **削除判定**: [x] 不要
- **削除理由**: AIプレイヤーが常に白であり、プロフィールアイコンを使用しないことは設計上自明。Test 21でユーザー（黒）のプロフィールアイコン表示を確認済み。白プレイヤーが石アイコンを使用することは、黒プレイヤーがプロフィールアイコンを使用することの逆（対称性）であり、わざわざテストする必要がない。

---

### Score UI Optimization Tests - Task 3.3: Accessibility attributes（2件）

#### Test 24: should have aria-label on black score

- **元のテストタイトル**: should have aria-label on black score
- **日本語タイトル**: 黒スコアにaria-label属性が設定されていること
- **テスト内容**: 黒プレイヤーのスコア要素に、アクセシビリティのためのaria-label属性が設定されていることを確認
- **テストコード抜粋**:

  ```typescript
  it('should have aria-label on black score', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    const { container } = render(<GameBoard />);
    const stoneCount = container.querySelector('.stone-count');
    const blackSection = stoneCount?.children[0];

    // Black count should have aria-label
    const blackCountElement = blackSection?.querySelector(
      '[aria-label*="Black score"]'
    );
    expect(blackCountElement).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(blackCountElement).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 25: should have aria-label on white score

- **元のテストタイトル**: should have aria-label on white score
- **日本語タイトル**: 白スコアにaria-label属性が設定されていること
- **テスト内容**: 白プレイヤーのスコア要素に、アクセシビリティのためのaria-label属性が設定されていることを確認
- **テストコード抜粋**:

  ```typescript
  it('should have aria-label on white score', () => {
    mockLiffState = {
      isReady: true,
      error: null,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
      login: jest.fn(),
      logout: jest.fn(),
    };

    const { container } = render(<GameBoard />);
    const stoneCount = container.querySelector('.stone-count');
    const whiteSection = stoneCount?.children[2];

    // White count should have aria-label
    const whiteCountElement = whiteSection?.querySelector(
      '[aria-label*="White score"]'
    );
    expect(whiteCountElement).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(whiteCountElement).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 22件

このファイルは**GameBoardのLIFF統合機能**をテストしており、22件のテストが保持すべきです。

**主要テストカテゴリ:**

- プロフィールアイコン表示（6件）: 各種状態でのアイコン表示切り替え、円形スタイリング
- 外部ブラウザログインUI（5件）: ログインボタン表示条件、ログイン機能
- ログイン状態UI更新（3件）: ログイン前後のUI変化、displayName非表示
- displayName非表示検証（1件）: UI最適化によるdisplayNameテキスト非表示
- スコア要素順序（6件）: 要素配置順序、プロフィール/石アイコン、画像エラーハンドリング
- アクセシビリティ（2件）: aria-label属性検証

### 削除推奨テスト: 3件

**重複テスト（3件）:**

- Test 16 (should NOT display displayName in LIFF environment): Test 15と重複。displayName非表示はLIFF/非LIFF環境で区別する必要がない。
- Test 17 (should NOT display displayName in non-LIFF environment): Test 15と重複。displayName非表示はLIFF/非LIFF環境で区別する必要がない。
- Test 23 (should always use stone icon for white player): AIプレイヤーが常に白で石アイコンを使用することは設計上自明。Test 21でユーザー（黒）のプロフィールアイコン表示を確認済みであり、対称性から白プレイヤーの石アイコン使用は当然。

### 推奨事項

このテストファイルは**削除推奨3件（約12%）**で、良好な状態です。

LIFF統合テストは以下の理由で重要です：

- LINEプラットフォーム統合の正確性
- ログイン状態管理の検証
- プロフィール情報の適切な表示（アイコンのみ、displayNameテキストなし）
- 外部ブラウザとLINEアプリ内での動作差分の検証
- 画像読み込み失敗時のフォールバック処理
- アクセシビリティの保証（aria-label属性）

削除推奨の3テストは、重複または自明なテストです。その他のテストはLIFF統合の各側面を網羅しており、保持すべきです。

**備考**:

- Task 4.1: Profile Icon Display（プロフィールアイコン表示）
- Task 4.2: External Browser Login UI（外部ブラウザログインUI）
- Task 4.3: Login State UI Updates（ログイン状態UI更新）
- Task 1.1: displayName should NOT be displayed（displayName非表示 - UI最適化）
- Task 1.2 & 1.3: Score element order（スコア要素順序）
- Task 3.3: Accessibility attributes（アクセシビリティ属性）
- LIFF（LINE Front-end Framework）はLINE内でウェブアプリを実行するためのフレームワーク
- UI最適化により、displayNameテキストは表示せず、アイコンのみ表示
- 黒プレイヤー（ユーザー）はプロフィールアイコン、白プレイヤー（AI）は石アイコンを使用
- 画像読み込み失敗時のエラーハンドリングとフォールバック処理を実装
- 注: 既存ドキュメントには24テストと記載されていましたが、実際には25テスト存在します
