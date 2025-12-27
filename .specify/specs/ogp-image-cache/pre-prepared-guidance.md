# OGP画像キャッシュ問題 - 事前検討ドキュメント

---

## 1. 要件 (Requirements)

### 1.1 解決すべき問題

- OGP画像がVercel CDNでキャッシュされない
- 毎リクエスト `x-vercel-cache: MISS`、生成に11-17秒かかる
- `revalidate = false` 設定が効いていない

### 1.2 機能要件

| ID  | 要件                                                            |
| --- | --------------------------------------------------------------- |
| R1  | OGP画像は2回目以降のアクセスで即座に返却される                  |
| R2  | og:imageにはリダイレクトなしの直接URLを使用する                 |
| R3  | LINEシェア時のFlex Message画像URLもキャッシュ済み画像を参照する |
| R4  | generateMetadata()は純粋関数として維持する（副作用なし）        |
| R5  | OGP画像は現行opengraph-image.tsxと同一の内容を再現する          |
| R6  | 無効な棋譜はog:image省略、APIは400エラーを返却する              |

### 1.3 非機能要件

| ID  | 要件                                                                        |
| --- | --------------------------------------------------------------------------- |
| NR1 | 既存リポジトリ構成を維持（モノリポ移行なし）                                |
| NR2 | Cloudflare R2を使用（利用可能確認済み）                                     |
| NR3 | 初回生成の11-17秒は許容する                                                 |
| NR4 | R2 Publicアクセスはカスタムドメイン経由（キャッシュはCloudflareデフォルト） |

### 1.4 制約

- SNSクローラー（Facebook/Twitter/LINE）はリダイレクトで問題が発生する可能性があるため、og:imageは直接URLを使用
- generateMetadata()内での副作用（画像生成・アップロード）は責務分離の観点から避ける

---

## 2. 仕様 (Design)

### 2.1 アーキテクチャ

```text
結果ページ表示時:
  1. generateMetadata() → R2直接URLをog:imageに設定（副作用なし）
  2. ページレンダリング（Server Component）
  3. クライアントサイドでprefetch → API Route呼び出し
     → API Route: R2確認 → 存在しなければ画像生成 → R2保存

LINEシェア時:
  - Flex Message画像URL = R2直接URL

SNSクローラーアクセス時:
  - og:image（R2直接URL）にアクセス → R2から取得
```

### 2.2 変更ファイル一覧

| ファイル                                              | 操作 | 説明                                       |
| ----------------------------------------------------- | ---- | ------------------------------------------ |
| `src/lib/r2/client.ts`                                | 新規 | R2 S3クライアント設定                      |
| `src/lib/r2/operations.ts`                            | 新規 | R2操作ユーティリティ                       |
| `src/lib/r2/index.ts`                                 | 新規 | バレルエクスポート                         |
| `src/lib/og/generate-image.ts`                        | 新規 | OG画像生成ロジック（抽出）                 |
| `src/lib/og/index.ts`                                 | 新規 | バレルエクスポート                         |
| `src/app/api/og/[side]/[encodedMoves]/route.ts`       | 新規 | OG画像生成API Route                        |
| `src/app/r/[side]/[encodedMoves]/page.tsx`            | 変更 | generateMetadata()純粋関数化、prefetch追加 |
| `src/app/r/[side]/[encodedMoves]/opengraph-image.tsx` | 削除 | 規約ファイル廃止                           |
| `src/lib/share/flex-message-builder.ts`               | 変更 | 画像URLをR2に変更                          |
| `.env.example`                                        | 変更 | R2に必要な環境変数                         |

### 2.3 新規モジュール設計

#### 2.3.1 R2クライアント (`src/lib/r2/client.ts`)

```typescript
import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET!;
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;
```

#### 2.3.2 R2操作 (`src/lib/r2/operations.ts`)

```typescript
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET } from './client';

export async function checkR2Exists(key: string): Promise<boolean> {
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function uploadToR2(key: string, body: Buffer): Promise<void> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'image/png',
      // Cache-Controlはカスタムドメイン経由のCloudflareデフォルト設定を使用
    })
  );
}
```

#### 2.3.3 OG画像生成 (`src/lib/og/generate-image.ts`)

**移植対象（既存opengraph-image.tsxから）**:

- `COLORS` 定数（盤面色、石色、テキスト色など）
- `renderCell()` - セル描画
- `renderBoard()` - 盤面描画（8x8グリッド）
- `renderScore()` - スコア・勝敗表示
- `renderBrand()` - ブランドロゴ

**画像仕様**:

- サイズ: 1200x630 (OGP標準)
- フォーマット: PNG
- レイアウト: 左=盤面、右=スコア+ブランド

```typescript
import { ImageResponse } from 'next/og';
import {
  decodeMoves,
  replayMoves,
  determineWinner,
} from '@/lib/share/move-encoder';

// COLORS, renderCell, renderBoard, renderScore, renderBrand を移植

export async function generateOgImageBuffer(
  encodedMoves: string
): Promise<Buffer> {
  // 1. 棋譜デコード・盤面再構築
  const decodeResult = decodeMoves(encodedMoves);
  if (!decodeResult.success) {
    throw new Error('Invalid encoded moves');
  }
  const replayResult = replayMoves(decodeResult.value);
  if (!replayResult.success) {
    throw new Error('Failed to replay moves');
  }

  const { board, blackCount, whiteCount } = replayResult;
  const winner = determineWinner(blackCount, whiteCount);

  // 2. ImageResponse でJSX → 画像生成
  const imageResponse = new ImageResponse(
    // ... JSX (renderBoard, renderScore, renderBrand)
    { width: 1200, height: 630 }
  );

  // 3. arrayBuffer() → Buffer 変換
  return Buffer.from(await imageResponse.arrayBuffer());
}
```

#### 2.3.4 OG画像生成API Route (`src/app/api/og/[side]/[encodedMoves]/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkR2Exists, uploadToR2 } from '@/lib/r2';
import { generateOgImageBuffer } from '@/lib/og';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ side: string; encodedMoves: string }> }
) {
  const { side, encodedMoves } = await params;
  const imageKey = `og/${side}/${encodedMoves}.png`;

  // R2に存在確認
  const exists = await checkR2Exists(imageKey);
  if (exists) {
    return NextResponse.json({ status: 'exists', key: imageKey });
  }

  // 画像生成 → R2にアップロード
  try {
    const imageBuffer = await generateOgImageBuffer(encodedMoves);
    await uploadToR2(imageKey, imageBuffer);
    return NextResponse.json({ status: 'created', key: imageKey });
  } catch (error) {
    // 無効な棋譜の場合は400エラー
    return NextResponse.json(
      { status: 'error', message: 'Invalid encoded moves' },
      { status: 400 }
    );
  }
}
```

**処理時間**: 11-17秒の生成時間は許容（非同期prefetchのため）

### 2.4 既存モジュール変更

#### 2.4.1 page.tsx の generateMetadata() - 純粋関数化

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { side, encodedMoves } = await params;
  const imageKey = `og/${side}/${encodedMoves}.png`;
  const r2Url = `https://${R2_PUBLIC_DOMAIN}/${imageKey}`;

  // 副作用なし - R2のURLを直接参照するのみ
  return {
    // ... 既存メタデータ
    openGraph: {
      images: [{ url: r2Url, width: 1200, height: 630 }],
    },
    twitter: {
      images: [r2Url],
    },
  };
}
```

#### 2.4.2 page.tsx - prefetchでAPI Route呼び出し

```typescript
// Client Component wrapper または useEffect で実装
'use client';

export function OgImagePrefetch({ side, encodedMoves }: Props) {
  useEffect(() => {
    // ページ表示時にAPI Routeを呼び出して画像生成をトリガー
    fetch(`/api/og/${side}/${encodedMoves}`, { method: 'GET' });
  }, [side, encodedMoves]);

  return null;
}
```

### 2.5 環境変数

| 変数名                 | 説明                   |
| ---------------------- | ---------------------- |
| `R2_ACCOUNT_ID`        | CloudflareアカウントID |
| `R2_ACCESS_KEY_ID`     | R2 APIアクセスキー     |
| `R2_SECRET_ACCESS_KEY` | R2 APIシークレット     |
| `R2_BUCKET`            | バケット名             |
| `R2_PUBLIC_DOMAIN`     | 公開ドメイン           |

#### 環境別設定

| 環境         | `R2_BUCKET`                      | `R2_PUBLIC_DOMAIN`                 |
| ------------ | -------------------------------- | ---------------------------------- |
| 開発/Preview | `lineminiapp-reversi-images-dev` | `dev.images.reversi.line-mini.dev` |
| Production   | `lineminiapp-reversi-images`     | `images.reversi.line-mini.dev`     |

### 2.6 依存パッケージ

```bash
pnpm add @aws-sdk/client-s3
```

### 2.7 事前準備（Cloudflare R2）

1. R2バケット作成（環境別に2つ）
2. APIトークン生成（S3互換、Object Read/Write権限）
3. 公開アクセス設定（カスタムドメイン経由）
   - キャッシュ動作はCloudflareデフォルト設定を使用

---

## 3. 参考リンク

- [How to Upload Files to Cloudflare R2 in Next.js](https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs)
- [Cloudflare R2 AWS SDK v3](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)
- [Cloudflare R2 Public buckets docs](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
