import { exit } from 'process';
import { getAddressToWatch, watchAddress } from './utils';

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