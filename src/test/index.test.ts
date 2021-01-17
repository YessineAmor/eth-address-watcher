import axios from 'axios';
import fs from 'fs'
jest.mock('fs');
import { getAddressToWatch, getTransactions, handleFiles } from '../utils';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockTransactions = [{
    blockNumber: "396958",
    timeStamp: "1485158072",
    hash: "0xfc71d21397ed9e4b3765d2…dde1a9edbbd9a732884e3aa",
    nonce: "206",
    blockHash: "0x67d97f9de7747023c4340b…953c14d65accb2abcc242db",
    transactionIndex: "1",
    from: "0x0a67fb4dbaa7a3f46c1bda06f9a2a61acbd7aae5",
    to: "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
    value: "1000000000000000000",
    gas: "121000",
    gasPrice: "20000000000",
    isError: "0",
    txreceipt_status: "",
    input: "0x",
    contractAddress: "",
    cumulativeGasUsed: "117841",
    gasUsed: "21000",
    confirmations: "9080312"
}, {
    blockNumber: "396958",
    timeStamp: "1485158072",
    hash: "0xfc71d21397ed9e4b3765d2…dde1a9edbbd9a732884e3aa",
    nonce: "206",
    blockHash: "0x67d97f9de7747023c4340b…953c14d65accb2abcc242db",
    transactionIndex: "1",
    from: "0x0a67fb4dbaa7a3f46c1bda06f9a2a61acbd7aae5",
    to: "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
    value: "1000000000000000000",
    gas: "121000",
    gasPrice: "20000000000",
    isError: "0",
    txreceipt_status: "",
    input: "0x",
    contractAddress: "",
    cumulativeGasUsed: "117841",
    gasUsed: "21000",
    confirmations: "9080312"
}]
const addressToWatch = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae';
let url = `https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${addressToWatch}&startblock=0&endblock=99999999&sort=asc`;

afterEach(() => {
    jest.clearAllMocks();
});

test('Should read address to watch', () => {
    const addressToWatch = '0xe206E5Cb1fc643908A75906Af6F919a487Af76AC';
    process.argv.push(addressToWatch);
    expect(getAddressToWatch()).toEqual(addressToWatch);
    process.argv.pop();
})

test("Exit if not able to read address to watch", () => {
    // process.argv.pop();
    expect(() => getAddressToWatch()).toThrow('One argument containing the address to watch is required');
})

test("Exit if address to watch is not valid eth address", () => {
    process.argv.push('invalid eth address');
    expect(() => getAddressToWatch()).toThrow('Please input a valid Ethereum address');
    process.argv.pop();
})

test('Call axios to get transactions from Etherscan API', async () => {
    const mockEtherscanResponse = { data: { 'status': '1', "result": mockTransactions } };
    mockedAxios.get.mockResolvedValue(mockEtherscanResponse);
    const txs = await getTransactions('url');
    expect(txs).toEqual(mockTransactions);
});
describe('Handle files', () => {
    test('Should create OUTPUT.txt write stream ', () => {
        const mockCreateWriteStream = fs.createWriteStream = jest.fn();
        const [latestBlockNumber, latestTransactionIndex, outputWs] = handleFiles();
        expect(mockCreateWriteStream).toHaveBeenLastCalledWith("OUTPUT.txt", { "flags": "a" });
    });
    test('Should create log.txt when not found', () => {
        const mockExists = fs.existsSync = jest.fn();
        mockExists.mockReturnValue(false);
        const mockOpenSync = fs.openSync = jest.fn();
        handleFiles();
        expect(mockOpenSync).toHaveBeenCalledWith('log.txt', 'a');
    });
    test('Should read latestBlockNumber, latestTransactionIndex from log.txt', () => {
        const mockExists = fs.existsSync = jest.fn();
        mockExists.mockImplementation((path) => path === 'log.txt' ? true : false); // Mock log.txt file existence
        const testData: Buffer = Buffer.from('9444821,24');
        const mockReadFileSync = fs.readFileSync = jest.fn();
        mockReadFileSync.mockReturnValue(testData);
        const [latestBlockNumber, latestTransactionIndex,] = handleFiles();
        expect(mockExists).toHaveBeenCalledWith('log.txt');
        expect(latestBlockNumber).toEqual(9444821);
        expect(latestTransactionIndex).toEqual(24);
    });
});
