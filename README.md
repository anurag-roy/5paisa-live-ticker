# 5paisa-live-ticker

This is a live market depth dashboard using 5paisa trading APIs and Next.js.

![5paisa-live-ticker](https://user-images.githubusercontent.com/53750093/214099215-bb656c8a-199d-46a6-80d3-a5d425484f2c.png)

## Get started

#### Setup env

Create a `env.json` by duplicating `example.env.json` and filling with your own values.

```
cp example.env.json env.json
```

#### Install dependencies

```
pnpm i
```

#### Create scrip master database

```
pnpm prepareData
```

This fetches the master CSV from 5paisa and creates an SQLite DB for faster data lookups. You need to run this every morning, to have the latest data in your DB.

#### Setup prisma

```
pnpx prisma generate
```

This needs to be done once (or everytime the DB schema is changed)

#### Start the server

```
pnpm dev
```

## Related

- [5paisa API scripts](https://github.com/anurag-roy/5paisa-test)
- [NSE Banned securities for the day](https://nse-banned-securities.deno.dev/)
- [Convert a CSV to an SQLite DB](https://github.com/anurag-roy/csv-to-sqlite)

## Contact

- [Twitter](https://twitter.com/anurag__roy)
- [Email](mailto:anuragroy@duck.com)

## License

[MIT © 2023 Anurag Roy](/LICENSE)
