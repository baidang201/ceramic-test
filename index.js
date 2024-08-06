// Import ComposeDB client

import { ComposeClient }from '@composedb/client'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays/from-string'

// Import your compiled composite
import definition from './runtime-composite.json' with { type: "json" }

// Create an instance of ComposeClient
// Pass the URL of your Ceramic server
// Pass reference to your compiled composite

const compose = new ComposeClient({ ceramic: 'http://localhost:7007', definition })

// Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
// Replace the example key here by your admin private key
const privateKey = fromString('61b2b07eed5e5a0f24fb4101c4d2d1dd214205fecd90d38a199e083008f749bf', 'base16')

const did = new DID({
  resolver: getResolver(),
  provider: new Ed25519Provider(privateKey),
})
await did.authenticate()

compose.setDID(did)

let rtMutation = await compose.executeQuery(`
  mutation CreateNewRequest($i: CreateRequestInput!) {
    createRequest(input: $i) {
      document{
          amount
          bitcoinAddress
          ethereumAddress
          expirationData
          nonce
          publicKey
      }
    }
  }
  `
  , 
  {
    "i": {
      "content": {
        "amount": 1,
        "bitcoinAddress": "0x31111111aaafB3972B05630fCceE866eC69CdADd9baC2771",
        "ethereumAddress": "0xaaafB3972B05630fCceE866eC69CdADd9baC2771" ,
        "expirationData": 2,
        "nonce": 3,
        "publicKey": "xxxx"
      }
    }
  }
  );
  
  console.log("\n@@@ mutation: ", JSON.stringify(rtMutation));
  
// Get account of authenticated user
let rt = await compose.executeQuery(`
query MyQuery {
  viewer {
    requestList(first: 10) {
      edges {
        node {
          amount
          bitcoinAddress
          ethereumAddress
          expirationData
          id
          nonce
          publicKey
        }
        cursor
      }
    }
  }
}
`
)

console.log("\n@@@ get: ", JSON.stringify(rt));



