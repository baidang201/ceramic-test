
# 1 run data store node
//ComposeDB requires a running ceramic-one node which is responsible for storing the data and coordinating with network participants. Make sure to configure and run the ceramic-one node first. You can find the steps of how to install and start the ceramic-one instance here.
```
brew install ceramicnetwork/tap/ceramic-one
ceramic-one daemon --network testnet-clay
```

# 2 run ceramic node
//ComposeDB requires running a Ceramic node for decentralized data and a SQL instance for your index database.
```
npm install -g @ceramicnetwork/cli @composedb/cli
npx @ceramicnetwork/cli daemon --network=testnet-clay
```

# 3 (option) run graphql UI server on http://localhost:5005/graphql
npx composedb graphql:server --ceramic-url=http://localhost:7007 --graphiql runtime-composite.json --did-private-key=61b2b07eed5e5a0f24fb4101c4d2d1dd214205fecd90d38a199e083008f749bf --port=5005

tip
ComposeDB server/ceramic-one server can also be run locally using Docker.
https://developers.ceramic.network/docs/composedb/guides/composedb-server/running-in-the-cloud#docker-hub


# 4 Generate your private key
```
npx composedb did:generate-private-key
```

output
```
✔ Generating random private key... Done!
61b2b07eed5e5a0f24fb4101c4d2d1dd214205fecd90d38a199e083008f749bf
```

# 5 Generate your account
```
npx composedb did:from-private-key 61b2b07eed5e5a0f24fb4101c4d2d1dd214205fecd90d38a199e083008f749bf
```
output

```
✔ Creating DID... Done!
did:key:z6MkpGyExutSE4fCdbuaNrYkWXoaJ43ctZ9FxJX3yXyrrMhJ
```


# 6 Using your account
kill  "npx @ceramicnetwork/cli daemon --network=testnet-clay"

vim ~/.ceramic/daemon.config.json

edit admin-dids node to "did:key:z6MkoDgemAx51v8w692aZRLPdwP6UPKj3EgUhBTvbL7hCwLu"
```
{
  ...
  "http-api": {
    ...
    "admin-dids": ["did:key:z6MkoDgemAx51v8w692aZRLPdwP6UPKj3EgUhBTvbL7hCwLu"]
  },
  "indexing": {
    ...
    "allow-queries-before-historical-sync": true
  }
}

```

restart ceramicnetwork node
```
npx @ceramicnetwork/cli daemon --network=testnet-clay
```

# 7 create graphql schemas
vim rfq.graphql

```
type Request @createModel(accountRelation: LIST, description: "Request info") {
  bitcoinAddress: String! @string(minLength: 50, maxLength: 70) #bytes25 hex string
  amount: Int!
  ethereumAddress: String! @string(minLength: 42, maxLength: 42) #H160 string example: 0xaaafB3972B05630fCceE866eC69CdADd9baC2771
  expirationData: Int!
  nonce: Int!
  publicKey: String! @string(minLength: 3, maxLength: 50)
}

type QuoteEncrypted @createModel(accountRelation: LIST, description: "Quote info") {
  pm: String! @string(minLength: 50, maxLength: 70) #public key of maker
  pt: String! @string(minLength: 50, maxLength: 70) #public key of taker!
  quoteNonce: Int!
  quoteMessageEncrypted: String! @string(minLength: 50, maxLength: 512)    #encrypt from Quote
  quoteSignatureEncrypted: String! @string(minLength: 50, maxLength: 512)
}

type Quote @createModel(accountRelation: LIST, description: "Quote info") {
  bitcoinAddress: String! @string(minLength: 50, maxLength: 70)#bytes25 hex string
  requestNonce: Int!
  erc20Address: String! @string(minLength: 42, maxLength: 42)#H160 string example: 0xaaafB3972B05630fCceE866eC69CdADd9baC2771
  amount: Int!
  expirationData: Int!
  nonce: Int!
}
```

# 8 create composites
```
npx composedb composite:create rfq.graphql --output=rfq.json --did-private-key=61b2b07eed5e5a0f24fb4101c4d2d1dd214205fecd90d38a199e083008f749bf
```

# 9 Deploying composites
```
npx composedb composite:deploy rfq.json --ceramic-url=http://localhost:7007 --did-private-key=61b2b07eed5e5a0f24fb4101c4d2d1dd214205fecd90d38a199e083008f749bf

```

# 10 Compiling composites for nodejs type loading
npx composedb composite:compile rfq.json runtime-composite.json

# 11 run example
```
npm install
node index.js
```

output
```
@@@ mutation:  {"data":{"createRequest":{"document":{"amount":1,"bitcoinAddress":"0x31111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"nonce":3,"publicKey":"xxxx"}}}}

@@@ get:  {"data":{"viewer":{"requestList":{"edges":[{"node":{"amount":1,"bitcoinAddress":"0x11111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"id":"kjzl6kcym7w8y9cu6fdvewlybvzmezy2aal3hbk22p76x50sa2bfw2mui7tz3p0","nonce":3,"publicKey":"xxxx"},"cursor":"eyJ0eXBlIjoidGltZXN0YW1wIiwiaWQiOiJranpsNmtjeW03dzh5OWN1NmZkdmV3bHlidnptZXp5MmFhbDNoYmsyMnA3Nng1MHNhMmJmdzJtdWk3dHozcDAiLCJ2YWx1ZSI6MTcyMjkzNDUxMjUzNH0"},{"node":{"amount":1,"bitcoinAddress":"0x21111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"id":"kjzl6kcym7w8y5wp9515qk5meb5h1nbef2flpzy2x4c8wba1pgd8adnrresrw42","nonce":3,"publicKey":"xxxx"},"cursor":"eyJ0eXBlIjoidGltZXN0YW1wIiwiaWQiOiJranpsNmtjeW03dzh5NXdwOTUxNXFrNW1lYjVoMW5iZWYyZmxwenkyeDRjOHdiYTFwZ2Q4YWRucnJlc3J3NDIiLCJ2YWx1ZSI6MTcyMjkzNTAyMTgzN30"},{"node":{"amount":1,"bitcoinAddress":"0x31111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"id":"kjzl6kcym7w8y68jvupnijud9sb2hz5k4gi4dppsjvxi9jlxqyk8i1nchednrqj","nonce":3,"publicKey":"xxxx"},"cursor":"eyJ0eXBlIjoidGltZXN0YW1wIiwiaWQiOiJranpsNmtjeW03dzh5NjhqdnVwbmlqdWQ5c2IyaHo1azRnaTRkcHBzanZ4aTlqbHhxeWs4aTFuY2hlZG5ycWoiLCJ2YWx1ZSI6MTcyMjkzNTA0MTMwNH0"},{"node":{"amount":1,"bitcoinAddress":"0x31111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"id":"kjzl6kcym7w8y7wqfjzv4drgkgmfw3z9jzwi32e5my8xybv0h8zansfrlg95jrf","nonce":3,"publicKey":"xxxx"},"cursor":"eyJ0eXBlIjoidGltZXN0YW1wIiwiaWQiOiJranpsNmtjeW03dzh5N3dxZmp6djRkcmdrZ21mdzN6OWp6d2kzMmU1bXk4eHlidjBoOHphbnNmcmxnOTVqcmYiLCJ2YWx1ZSI6MTcyMjkzNTU0MjIxOX0"},{"node":{"amount":1,"bitcoinAddress":"0x31111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"id":"kjzl6kcym7w8y77h5s9j5xb25zu57jc51giwmjmlsalg8ngt8ord8d75r7zh1b0","nonce":3,"publicKey":"xxxx"},"cursor":"eyJ0eXBlIjoidGltZXN0YW1wIiwiaWQiOiJranpsNmtjeW03dzh5NzdoNXM5ajV4YjI1enU1N2pjNTFnaXdtam1sc2FsZzhuZ3Q4b3JkOGQ3NXI3emgxYjAiLCJ2YWx1ZSI6MTcyMjkzNjcyNzM0NH0"},{"node":{"amount":1,"bitcoinAddress":"0x31111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"id":"kjzl6kcym7w8y6lefavklxm9nt6qsvq5ygon8trfgv6i2w357dt6e4tkyw104kd","nonce":3,"publicKey":"xxxx"},"cursor":"eyJ0eXBlIjoidGltZXN0YW1wIiwiaWQiOiJranpsNmtjeW03dzh5NmxlZmF2a2x4bTludDZxc3ZxNXlnb244dHJmZ3Y2aTJ3MzU3ZHQ2ZTR0a3l3MTA0a2QiLCJ2YWx1ZSI6MTcyMjkzNjczODA4MH0"},{"node":{"amount":1,"bitcoinAddress":"0x31111111aaafB3972B05630fCceE866eC69CdADd9baC2771","ethereumAddress":"0xaaafB3972B05630fCceE866eC69CdADd9baC2771","expirationData":2,"id":"kjzl6kcym7w8y81kgnvu6lpirjrmdxx3jvdk7sg9h1iqg03awr3iwcbxdvp82z5","nonce":3,"publicKey":"xxxx"},"cursor":"eyJ0eXBlIjoidGltZXN0YW1wIiwiaWQiOiJranpsNmtjeW03dzh5ODFrZ252dTZscGlyanJtZHh4M2p2ZGs3c2c5aDFpcWcwM2F3cjNpd2NieGR2cDgyejUiLCJ2YWx1ZSI6MTcyMjkzNjc0NTU3MH0"}]}}}}
```