# qest-wave-demo

QEST向け非公式デモ「今日の鵠沼サーフィン指数」です。Cloudflare Workers、Static Assets、KV、Cron Trigger を使い、Open-Meteo の当日予報を Dify Workflow に渡して表示用 JSON を生成します。QEST 公式サイトとは接続しない公開デモです。

## セットアップ

### 1. 依存関係をインストール

```bash
npm install
```

### 2. Cloudflare にログイン

```bash
npx wrangler login
```

### 3. KV namespace を作成

```bash
npx wrangler kv namespace create QEST_KV
```

表示された namespace ID を `wrangler.jsonc` の `kv_namespaces` に設定します。

```jsonc
"kv_namespaces": [
  {
    "binding": "QEST_KV",
    "id": "ここを作成したKV namespace IDに置き換える"
  }
]
```

### 4. secrets を登録

```bash
npx wrangler secret put DIFY_API_KEY
npx wrangler secret put REFRESH_SECRET
```

`REFRESH_SECRET` には十分長いランダムな値を設定してください。**Dify API Key を frontend（`public/` 配下やブラウザの JavaScript）に置かないでください。** Secret は Worker からだけ参照します。

## 開発とデプロイ

ローカル開発：

```bash
npm run dev
```

TypeScript チェック：

```bash
npm run typecheck
```

Cloudflare Workers へデプロイ：

```bash
npm run deploy
```

デプロイ後に Wrangler が表示する `https://qest-wave-demo.<subdomain>.workers.dev` が public demo URL です。

## API

- `GET /api/today` — KV の `qest_today_board` を返します。未生成時は安全な fallback demo JSON を返します。
- `GET /api/refresh?secret=xxx` — `xxx` が `REFRESH_SECRET` と一致する場合だけ Open-Meteo → Dify → KV の更新を実行します。

画面の「最新表示」ボタンは `/api/today` の再取得だけを行い、`/api/refresh` は呼びません。

## 定期更新

`wrangler.jsonc` の Cron Trigger は UTC です。設定値は日本時間の 05:30、07:00、09:00、11:00、13:00、15:00、17:00 に相当します。Open-Meteo または Dify が失敗した場合、Worker はエラーを記録し、既存の KV データを上書きしません。

## 注意

この指数は Open-Meteo 予報と仮ルールを使った非公式デモであり、安全を保証するものではありません。実際の入水前に、現地の海況、風、混雑、ライフガードや公的機関の情報を確認してください。
