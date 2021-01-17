import fs from 'fs';
import Transaction from './interfaces/Transaction';
import { exit } from 'process';
import { getAddressToWatch, getTransactions, handleFiles } from './utils';

let latestBlockNumber = handleFiles()[0];
let latestTransactionIndex = handleFiles()[1];
const outputWriteStream = handleFiles()[2];

async function watchAddress(addressToWatch: string) {
    const url = `https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${addressToWatch}&startblock=${latestBlockNumber}&endblock=99999999&sort=asc`;
    try {
        let txs = await getTransactions(url);
        if (typeof txs === 'string') {
            console.log('Rate limited, trying again...')
        } else {
            txs = txs.filter((tx: Transaction) => tx.to === addressToWatch);
            txs.forEach(tx => {
                if (parseInt(tx.blockNumber) > latestBlockNumber) {
                    // fs.appendFileSync("OUTPUT.txt", `MINT ${tx.value} ${tx.from}\n`);
                    latestBlockNumber = parseInt(tx.blockNumber);
                    latestTransactionIndex = parseInt(tx.transactionIndex);
                    outputWriteStream.write(`MINT ${tx.value} ${tx.from}\n`);
                    fs.writeFileSync('log.txt', `${latestBlockNumber},${latestTransactionIndex}`);
                }
                else if (parseInt(tx.blockNumber) === latestBlockNumber) {
                    if (parseInt(tx.transactionIndex) > latestTransactionIndex) {
                        // fs.appendFileSync("OUTPUT.txt", `MINT ${tx.value} ${tx.from}\n`);
                        latestTransactionIndex = parseInt(tx.transactionIndex);
                        outputWriteStream.write(`MINT ${tx.value} ${tx.from}\n`);
                        fs.writeFileSync('log.txt', `${latestBlockNumber},${latestTransactionIndex}`);
                    }
                }
            });
        }
    } catch (error) {
        throw Error(error);
    }


}

function main() {
    try {
        const addressToWatch = getAddressToWatch();
        console.log(`listening for transfers to ${addressToWatch}...`);
        setInterval(() => watchAddress(addressToWatch), 6000);
    } catch (error) {
        console.log('Exiting...');
        console.log(error);
        exit();
    }

}

main();