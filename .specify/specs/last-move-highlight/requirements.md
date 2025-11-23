# Requirements Document

## Introduction

リバーシゲームにおいて、プレーヤーが自分の番になったとき、相手プレーヤーが最後に打った位置を視覚的に明確にする機能を実装します。これにより、ゲームの流れを追いやすくし、プレーヤーがより戦略的な判断を下せるようにします。盤面のマスの色やビジュアルエフェクトを活用して、直感的で分かりやすいUIを提供します。

## Requirements

### Requirement 1: 最終手の視覚的ハイライト表示

**Objective:** プレーヤーとして、相手が最後に打った位置を視覚的に確認できるようにすることで、ゲームの流れを把握しやすくしたい

#### Acceptance Criteria

1. When プレーヤーが着手した後、the GameBoardコンポーネント shall その着手位置を最終手として記録する
2. When 盤面が再レンダリングされる際、the GameBoardコンポーネント shall 最終手の位置に視覚的なハイライト効果を適用する
3. When 新しい着手が行われた場合、the GameBoardコンポーネント shall 前回の最終手ハイライトを削除し、新しい最終手をハイライトする
4. The GameBoardコンポーネント shall 最終手のハイライトを他のマスと明確に区別できる視覚スタイルで表示する

### Requirement 2: AIプレーヤーの着手に対するハイライト

**Objective:** プレーヤーとして、AIが打った位置を即座に把握できるようにすることで、AIの戦略を理解しやすくしたい

#### Acceptance Criteria

1. When AIが着手を完了した場合、the GameBoardコンポーネント shall AIの着手位置を最終手としてハイライトする
2. When AIの着手アニメーションが完了した後、the GameBoardコンポーネント shall ハイライト効果を表示する
3. The GameBoardコンポーネント shall AIの着手と人間プレーヤーの着手で同じハイライトスタイルを使用する

### Requirement 3: ゲーム開始時と終了時のハイライト状態

**Objective:** プレーヤーとして、ゲームの各フェーズで適切なハイライト状態を確認できるようにすることで、混乱を避けたい

#### Acceptance Criteria

1. When ゲームが開始される場合、the GameBoardコンポーネント shall 最終手のハイライトを表示しない
2. When ゲームがリセットされる場合、the GameBoardコンポーネント shall 全ての最終手ハイライト状態をクリアする
3. When ゲームが終了した場合、the GameBoardコンポーネント shall 最後に打たれた着手のハイライトを保持する

### Requirement 4: レスポンシブな視覚デザイン

**Objective:** プレーヤーとして、モバイル環境でも明確に最終手を視認できるようにすることで、快適なゲーム体験を得たい

#### Acceptance Criteria

1. The GameBoardコンポーネント shall タッチスクリーンで判別可能な十分なサイズと色のコントラストでハイライトを表示する
2. The GameBoardコンポーネント shall ダークモードとライトモード両方でハイライトが視認可能なスタイルを適用する
3. The GameBoardコンポーネント shall 盤面のサイズに応じてハイライトのサイズを適切にスケーリングする

### Requirement 5: 状態管理との統合

**Objective:** 開発者として、最終手の状態を一貫性のある方法で管理できるようにすることで、バグを減らし保守性を高めたい

#### Acceptance Criteria

1. The useGameStateフック shall 最終手の位置（Position型）を不変な状態として管理する
2. When 着手が行われた場合、the useGameStateフック shall 最終手の位置を更新した新しい状態オブジェクトを返す
3. The useGameStateフック shall 最終手の位置をオプショナルな値（Position | null）として扱う
4. The GameBoardコンポーネント shall useGameStateフックから最終手の位置を取得してハイライトをレンダリングする

### Requirement 6: アクセシビリティとパフォーマンス

**Objective:** プレーヤーとして、最終手ハイライト機能がゲームのパフォーマンスに悪影響を与えないようにすることで、スムーズなゲーム体験を維持したい

#### Acceptance Criteria

1. The GameBoardコンポーネント shall 最終手ハイライトのレンダリングをCSSベースのアニメーションで実装する
2. The GameBoardコンポーネント shall 不要な再レンダリングを避けるためReact.memoまたは適切なメモ化を使用する
3. If ハイライト効果が適用される場合、then the GameBoardコンポーネント shall フレームレートに影響を与えないシンプルなCSSトランジションを使用する
4. The GameBoardコンポーネント shall 既存の盤面レンダリングロジックとの互換性を保持する
