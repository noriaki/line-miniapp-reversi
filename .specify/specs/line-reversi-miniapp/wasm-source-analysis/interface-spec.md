# ai.wasm インターフェース仕様書（C++ソースコード解析版）

**解析日**: 2025-10-22
**解析対象**: Egaroucid リポジトリ (https://github.com/Nyanyan/Egaroucid)
**参照コミット**: 最新版 (2025-10-22 時点)
**解析元ファイル**: `src/Egaroucid_for_Web.cpp`, `src/web/*.hpp`

---

## エクスポート関数一覧

### 1. `init_ai`

**C++シグネチャ**:

```cpp
extern "C" int init_ai(int *percentage)
```

**WASM シグネチャ**: `(i32) -> i32`

**引数**:

- `percentage` (int\*): 初期化の進捗状況を格納するメモリ位置へのポインタ
  - 初期化開始時: `*percentage = 1`
  - 評価関数初期化前: `*percentage = 80`
  - 初期化完了時: `*percentage = 100`

**戻り値**: `0` (常に成功)

**処理内容**:

```cpp
inline void init(int *percentage) {
    *percentage = 1;
    board_init();           // ボード初期化
    mobility_init();        // 着手可能手の初期化
    stability_init();       // 安定石の初期化
    parent_transpose_table.first_init();  // 置換表初期化
    child_transpose_table.first_init();   // 置換表初期化
    *percentage = 80;
    evaluate_init();        // 評価関数初期化（時間かかる）
    book_init();            // 定石データベース初期化
    *percentage = 100;
}
```

**使用例** (JavaScript):

```javascript
const Module = /* Emscripten Module */;
const percentagePtr = Module._malloc(4);
Module._init_ai(percentagePtr);
Module._free(percentagePtr);
```

**副作用**: グローバル変数の初期化（評価関数、定石データベース、置換表）

**ソースコード参照**: `src/Egaroucid_for_Web.cpp:70-75`, `src/Egaroucid_for_Web.cpp:15-27`

---

### 2. `ai_js`

**C++シグネチャ**:

```cpp
extern "C" int ai_js(int *arr_board, int level, int ai_player)
```

**WASM シグネチャ**: `(i32, i32, i32) -> i32`

**引数**:

- `arr_board` (int\*): ボード状態の配列へのポインタ（64要素）
  - `-1`: 空マス
  - `0`: 黒石 (BLACK)
  - `1`: 白石 (WHITE)
  - 配列インデックス順序: row-major (`arr[i*8+j]` = row i, col j)
- `level` (int): AI の強さレベル (0-60)
  - **Level 0**: 探索なし（合法手からランダム選択、非決定的）
    - `probability = 0`、`depth = 0`
    - 評価値は `mid_evaluate()` による静的評価
  - **Level 1-10**: 低レベル（高速、浅い探索）
  - **Level 11-20**: 中レベル（MPC使用開始）
  - **Level 21-30**: 高レベル（深い探索）
  - **Level 31-60**: 最高レベル（終盤完全読み）
- `ai_player` (int): AI が操作するプレイヤー **（重要: Board構造体の視点を決定）**
  - `0`: **AI は黒番** → `Board.player` = 黒のビットボード、`Board.opponent` = 白のビットボード
  - `1`: **AI は白番** → `Board.player` = 白のビットボード、`Board.opponent` = 黒のビットボード

**重要な内部処理**:

```cpp
// Egaroucid_for_Web.cpp:83
n_stones = input_board(&b, arr_board, ai_player);  // ★ ai_playerをそのまま渡す

// Egaroucid_for_Web.cpp:86
result = ai(b, level, true, false, true);
```

- `ai_js` は `ai_player` パラメータを**そのまま**使用
- `ai()` 関数内でパス処理、Book検索、探索を実行
- 返り値は呼び出し側の視点（`ai_player`）での評価値

**戻り値**: エンコードされた結果

```cpp
inline int output_coord(int policy, int raw_val) {
    return 1000 * (HW2_M1 - policy) + 100 + raw_val;
    //     1000 * (63 - policy) + 100 + value
}
```

**デコード方法** (JavaScript):

```javascript
const result = Module._ai_js(boardPtr, level, ai_player);
const policy = 63 - Math.floor((result - 100) / 1000);
const value = (result - 100) % 1000;

// policy: 0-63 の手の位置（ビット位置）
// value: 評価値（正数: AI有利、負数: AI不利）
```

**処理内容**:

```cpp
extern "C" int ai_js(int *arr_board, int level, int ai_player) {
    Board b;
    Search_result result;
    int n_stones = input_board(&b, arr_board, ai_player);  // ボード変換
    result = ai(b, level, true, false, true);              // AI探索
    return output_coord(result.policy, result.value);      // 結果エンコード
}
```

**ソースコード参照**: `src/Egaroucid_for_Web.cpp:77-91`, `src/Egaroucid_for_Web.cpp:66-68`

---

### 3. `calc_value`

**C++シグネチャ**:

```cpp
extern "C" void calc_value(int *arr_board, int *res, int level, int ai_player)
```

**WASM シグネチャ**: `(i32, i32, i32, i32) -> void`

**引数**:

- `arr_board` (int\*): ボード状態の配列へのポインタ（64要素）
- `res` (int\*): 結果を格納する配列へのポインタ（74要素以上必要）
- `level` (int): AI の強さレベル (0-60)
- `ai_player` (int): 評価する側のプレイヤー
  - `0`: 黒番の視点で全合法手を評価
  - `1`: 白番の視点で全合法手を評価
  - **重要**: 内部で `1 - ai_player` に反転される

**処理内容と重要な挙動**:

```cpp
extern "C" void calc_value(int *arr_board, int *res, int level, int ai_player) {
    Board b;
    Search_result result;

    // ★1. ai_playerを反転してボード構築
    // 例: ai_player=0 (黒視点) → 1-0=1 (白) でボード構築
    //     → b.player=白, b.opponent=黒 となる
    int n_stones = input_board(&b, arr_board, 1 - ai_player);

    int tmp_res[HW2];
    for (i = 0; i < HW2; ++i)
        tmp_res[i] = -1;  // 非合法手は -1

    // ★2. 各合法手について評価
    uint64_t legal = b.get_legal();
    for (uint_fast8_t cell = first_bit(&legal); legal; cell = next_bit(&legal)) {
        calc_flip(&flip, &b, cell);
        b.move_board(&flip);  // 手を打つと相手視点になる

        // ★3. 評価値を反転（マイナス符号）
        // ai()は相手視点での評価値を返すため、反転して自分視点の評価値にする
        tmp_res[cell] = -ai(b, level, true, false, false).value;

        b.undo_board(&flip);
    }

    // ★4. 結果をオフセット10でビット位置を反転して格納
    for (i = 0; i < HW2; ++i)
        res[10 + HW2_M1 - i] = tmp_res[i];  // res[10+63-i] = tmp_res[i]
}
```

**なぜこのような実装になっているか**:

1. **ai_player反転の理由**:
   - `calc_value`は「現在の局面から各合法手を打った後の評価」を計算
   - 手を打つと手番が交代するため、相手視点でボードを構築
   - 例: 黒番(ai_player=0)で呼び出す → 白視点(1)でボード構築 → 各手を打つと黒番になる

2. **評価値反転の理由**:
   - `b.move_board()`で手を打つと`b.player`と`b.opponent`が入れ替わる
   - `ai()`は常に`b.player`（手番側）の視点で評価値を返す
   - 相手にとって+10の手 = 自分にとって-10の手

3. **オフセット10の理由**:
   - 先頭10要素は予約領域（仕様上の理由、詳細不明）
   - ビット位置の反転（`63-i`）は座標系の変換

**結果の解釈**:

- `res[10]` ～ `res[73]`: ビット位置63～0の評価値
- 正の値: その手を打つとai_player側が有利
- 負の値: その手を打つとai_player側が不利
- `-1`: 非合法手

**結果配列のレイアウト**:

```javascript
// res[0-9]: 未使用（予約領域）
// res[10]: ビット位置 63 の評価値 (a8)
// res[11]: ビット位置 62 の評価値 (b8)
// ...
// res[73]: ビット位置 0 の評価値 (h1)
```

**使用例** (JavaScript):

```javascript
const boardPtr = Module._malloc(64 * 4);
const resPtr = Module._malloc(74 * 4);

// ボードデータを書き込み...

Module._calc_value(boardPtr, resPtr, level, ai_player);

// 結果を読み取り
const resHeap = new Int32Array(Module.HEAP32.buffer, resPtr, 74);
for (let i = 0; i < 64; i++) {
  const bitPos = 63 - i;
  const value = resHeap[10 + i];
  if (value !== -1) {
    console.log(`Position ${bitPos}: value ${value}`);
  }
}

Module._free(boardPtr);
Module._free(resPtr);
```

**重要な注意点**:

1. `ai_player` パラメータが**内部で反転される** (`1 - ai_player`)
2. 結果配列は **74要素以上** 必要（先頭10要素は未使用）
3. 非合法手の位置は `-1` が格納される

**ソースコード参照**: `src/Egaroucid_for_Web.cpp:93-122`

---

### 4. `stop`

**C++シグネチャ**:

```cpp
extern "C" void stop()
```

**WASM シグネチャ**: `() -> void`

**処理内容**:

```cpp
extern "C" void stop() {
    global_searching = false;  // グローバルフラグをfalseに
}
```

**用途**: 長時間かかる探索を途中で停止させる

**ソースコード参照**: `src/Egaroucid_for_Web.cpp:124-126`, `src/web/common.hpp:71`

---

### 5. `resume`

**C++シグネチャ**:

```cpp
extern "C" void resume()
```

**WASM シグネチャ**: `() -> void`

**処理内容**:

```cpp
extern "C" void resume() {
    global_searching = true;  // グローバルフラグをtrueに
}
```

**用途**: 停止した探索を再開可能にする

**ソースコード参照**: `src/Egaroucid_for_Web.cpp:128-130`

---

## ボードエンコーディング仕様

### セル値の定義

```cpp
#define BLACK 0
#define WHITE 1
#define VACANT 2  // ※ arr_board では -1 を使用
```

**JavaScript → WASM**:

- `-1`: 空マス
- `0`: 黒石
- `1`: 白石

### 配列レイアウト

**配列インデックス → ボード座標**:

```
arr[0]  = (row=0, col=0) → a8
arr[1]  = (row=0, col=1) → b8
arr[7]  = (row=0, col=7) → h8
arr[8]  = (row=1, col=0) → a7
...
arr[63] = (row=7, col=7) → h1
```

**インデックス計算**:

```javascript
const index = row * 8 + col;
```

### 内部ビット表現への変換

```cpp
inline int input_board(Board *bd, const int *arr, const int ai_player) {
    uint64_t b = 0ULL, w = 0ULL;
    for (i = 0; i < HW; ++i) {
        for (j = 0; j < HW; ++j) {
            elem = arr[i * HW + j];
            if (elem != -1) {
                b |= (uint64_t)(elem == 0) << (HW2_M1 - i * HW - j);
                w |= (uint64_t)(elem == 1) << (HW2_M1 - i * HW - j);
                ++n_stones;
            }
        }
    }
    if (ai_player == 0) {
        bd->player = b;
        bd->opponent = w;
    } else {
        bd->player = w;
        bd->opponent = b;
    }
    return n_stones;
}
```

**ビット位置の計算**:

```
bit_position = 63 - (row * 8 + col)
```

例:

- `arr[0]` (row=0, col=0) → ビット 63
- `arr[63]` (row=7, col=7) → ビット 0

**ソースコード参照**: `src/Egaroucid_for_Web.cpp:29-52`

---

## 変換例

### JavaScript から WASM へのボード変換

```javascript
function encodeBoardToWASM(module, board) {
  // board: 8x8 の配列 [row][col]
  // null = 空, 'black' = 黒, 'white' = 白

  const ptr = module._malloc(64 * 4); // 64個の int32
  const heap = new Int32Array(module.HEAP32.buffer, ptr, 64);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const index = row * 8 + col;
      const cell = board[row][col];

      if (cell === null) {
        heap[index] = -1;
      } else if (cell === 'black') {
        heap[index] = 0;
      } else if (cell === 'white') {
        heap[index] = 1;
      }
    }
  }

  return ptr;
}
```

### WASM からの結果デコード

```javascript
function decodeAIResponse(result) {
  // ai_js の返り値をデコード
  const policy = 63 - Math.floor((result - 100) / 1000);
  const value = (result - 100) % 1000;

  // ビット位置から (row, col) へ変換
  const row = Math.floor((63 - policy) / 8);
  const col = (63 - policy) % 8;

  return { row, col, value, bitPosition: policy };
}
```

---

## Search_result 構造体

```cpp
struct Search_result{
    int_fast8_t policy;  // 手の位置 (0-63)
    int value;           // 評価値
    int depth;           // 探索深度
    uint64_t time;       // 計算時間 (ms)
    uint64_t nodes;      // 探索ノード数
    uint64_t nps;        // nodes per second
    bool is_end_search;  // 終盤探索フラグ
    int probability;     // 確率
};
```

**ソースコード参照**: `src/web/search.hpp`

---

## Level パラメータの詳細

### レベル範囲: 0-60

**Level 構造**:

```cpp
struct Level{
    int mid_lookahead;      // 中盤の先読み深度
    double mid_mpct;        // 中盤の MPC 閾値
    int complete0;          // 終盤完全読み閾値 0
    double complete0_mpct;  // 終盤完全読み MPC 閾値 0
    int complete1;          // 終盤完全読み閾値 1
    double complete1_mpct;  // 終盤完全読み MPC 閾値 1
    int complete2;          // 終盤完全読み閾値 2
    double complete2_mpct;  // 終盤完全読み MPC 閾値 2
    int complete3;          // 終盤完全読み閾値 3
    double complete3_mpct;  // 終盤完全読み MPC 閾値 3
    int complete4;          // 終盤完全読み閾値 4
    double complete4_mpct;  // 終盤完全読み MPC 閾値 4
};
```

### レベル別の特性

| Level | 中盤先読み | 終盤完全読み | 特性                              |
| ----- | ---------- | ------------ | --------------------------------- |
| 0     | 0手        | 0手          | ほぼランダム                      |
| 1     | 1手        | 2手          | 非常に弱い                        |
| 5     | 5手        | 10手         | 弱い                              |
| 10    | 10手       | 20手         | 中程度                            |
| 15    | 15手       | 24手         | やや強い（LIGHT_LEVEL）           |
| 21    | 21手       | 30手         | 強い（STANDARD_MAX_LEVEL）        |
| 25    | 25手       | 32手         | 非常に強い（PRAGMATIC_MAX_LEVEL） |
| 30    | 30手       | 36手         | 最強クラス（ACCURATE_MAX_LEVEL）  |
| 60    | 60手       | 60手         | 最強設定                          |

### MPC (Multi-Probability Cut)

確率的枝刈り手法：

- `MPC_81 = 0.88`: 81%の確率で正しい手を保持
- `MPC_95 = 1.64`: 95%の確率で正しい手を保持
- `MPC_98 = 2.05`: 98%の確率で正しい手を保持
- `MPC_99 = 2.33`: 99%の確率で正しい手を保持
- `NOMPC = 5.00`: MPC を使用しない（完全探索）

**ソースコード参照**: `src/web/level.hpp`

---

## Emscripten 自動エクスポート関数

### `_malloc`

**シグネチャ**: `(i32) -> i32`

**用途**: WASM メモリの動的確保

```javascript
const ptr = Module._malloc(size); // size バイトを確保
```

### `_free`

**シグネチャ**: `(i32) -> void`

**用途**: WASM メモリの解放

```javascript
Module._free(ptr); // メモリを解放
```

### `memory`

**型**: `WebAssembly.Memory`

**用途**: WASM メモリへの直接アクセス

```javascript
const memory = Module.memory;
const buffer = memory.buffer;
const heap = new Int32Array(buffer);
```

---

## 定数定義

```cpp
#define HW 8          // ボードの幅/高さ
#define HW_M1 7       // HW - 1
#define HW2 64        // HW * HW (総マス数)
#define HW2_M1 63     // HW2 - 1
#define BLACK 0       // 黒石
#define WHITE 1       // 白石
#define VACANT 2      // 空マス（内部表現）
```

**ソースコード参照**: `src/web/common.hpp:18-31`

---

## まとめ

このインターフェース仕様書は、Egaroucid の C++ ソースコードから直接抽出した**確定情報**です。

**重要なポイント**:

1. ボードエンコーディングは `-1=空, 0=黒, 1=白`（Int32Array使用）
2. `ai_js` の返り値は `1000*(63-policy) + 100 + value` 形式でエンコードされている
3. `calc_value` は `ai_player` を内部で反転し、結果配列にオフセット10を持つ
4. Level パラメータは 0-60 の範囲で、探索の強さを決定
5. 全てのエクスポート関数は `extern "C"` で定義され、name mangling されていない

**次のステップ**: この仕様書に基づいた実動作テストの設計と実装
