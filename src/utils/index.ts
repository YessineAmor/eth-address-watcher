import axios from "axios";
import fs, { WriteStream } from 'fs';
import Transaction from "../interfaces/Transaction";
var ethereum_address = require('ethereum-address');

export async function getTransactions(url: string): Promise<Transaction[]> {
    try {
        const txs = await axios.get(url);
        return txs.data.result;
    } catch (error) {
        throw Error('Could not get url');
    }
}

export function getAddressToWatch(): string {
    const args: string[] = process.argv.slice(2);
    if (args.length !== 1)
        throw Error("One argument containing the address to watch is required");
    if (!ethereum_address.isAddress(args[0]))
        throw Error("Please input a valid Ethereum address");
    return args[0];

}

export function handleFiles(): [number, number, WriteStream] {
    let latestBlockNumber = 0;
    let latestTransactionIndex = 0;
    let outputWs = fs.createWriteStream('OUTPUT.txt', { flags: 'a' });
    if (fs.existsSync('log.txt')) {
        let logContents = fs.readFileSync('log.txt');
        if (logContents.toString().length > 0) {
            latestBlockNumber = parseInt(logContents.toString().split(',')[0]);
            latestTransactionIndex = parseInt(logContents.toString().split(',')[1]);
        }
    } else {
        fs.openSync('log.txt', 'a');

    }
    return [latestBlockNumber, latestTransactionIndex, outputWs];

}

let latestBlockNumber = handleFiles()[0];
let latestTransactionIndex = handleFiles()[1];
const outputWriteStream = handleFiles()[2];

export async function watchAddress(addressToWatch: string) {
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
