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
