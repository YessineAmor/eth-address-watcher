# Eth Address Watcher

## Install
Install dependencies using `npm i`

## Execution
Run using `npm run minter YOUR_ADDRESS`

## Tests
Run tests using `npm test`
  These are the different test cases implemented:
- Should read address to watch
- Exit if not able to read address to watch
- Exit if address to watch is not valid eth address
- Call axios to get transactions from Etherscan API
- Should create OUTPUT.txt write stream
- Should create log.txt when not found
- Should read latestBlockNumber, latestTransactionIndex from log.txt
