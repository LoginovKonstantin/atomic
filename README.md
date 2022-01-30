## Installation

```bash
$ npm install
```

## Check .env file
```bash
API_PORT=3000
BTC_USD_PRICE_URL=https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD
BTC_USD_HISTORICAL_PRICE_URL=https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=USD&limit=60
CRYPTO_API_KEY=SET_YOUR_KEY
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```