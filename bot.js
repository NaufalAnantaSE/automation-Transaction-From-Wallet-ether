const ethers = require('ethers');
const readline = require('readline');

// Configuration object
const config = {
    rpcUrl: 'RPC URL From network', // enter your rpc url
    senderPrivateKey: 'Your Private Key',//enter your private key
    amountInEth: (Math.random() * (0.00006 - 0.00003) + 0.00003).toFixed(8), // random amount between 0.00003 and 0.00006
    gasLimit: 21000,
    numberOfRecipients: 0 // to be set dynamically by user input
};

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(config.senderPrivateKey, provider);

// Function to get current gas price
const getGasPrice = async () => {
    try {
        return await provider.getGasPrice();
    } catch (error) {
        console.error('Error fetching gas price:', error);
        throw error;
    }
};

// Function to create random Ethereum address
const createRandomAddress = () => {
    const randomWallet = ethers.Wallet.createRandom();
    return randomWallet.address;
};

// Function to create a transaction object
const createTransaction = async (to, amount) => {
    try {
        const gasPrice = await getGasPrice();
        const chainId = (await provider.getNetwork()).chainId;

        return {
            to,
            value: ethers.utils.parseEther(amount),
            gasLimit: config.gasLimit,
            gasPrice,
            chainId
        };
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

// Function to send a single transaction
const sendTransaction = async (tx) => {
    try {
        const transaction = await wallet.sendTransaction(tx);
        await transaction.wait();
        return transaction.hash;
    } catch (error) {
        console.error(`Error sending transaction to ${tx.to}:`, error);
        throw error;
    }
};

// Function to sleep with countdown display
const sleepWithCountdown = async (seconds) => {
    console.log(`Sleeping for ${seconds} seconds...`);
    for (let i = seconds; i > 0; i--) {
        process.stdout.write(`Countdown: ${i} seconds remaining...\r`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Sleep for 1 second
    }
    console.log('Resuming...');
};

// Main function to send ETH to random recipients
const main = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the number of random recipients: ', async (input) => {
        config.numberOfRecipients = parseInt(input);
        
        if (isNaN(config.numberOfRecipients) || config.numberOfRecipients <= 0) {
            console.error('Invalid number of recipients. Please enter a valid number.');
            rl.close();
            return;
        }

        for (let i = 0; i < config.numberOfRecipients; i++) {
            try {
                const recipient = createRandomAddress();
                const tx = await createTransaction(recipient, config.amountInEth);
                const txHash = await sendTransaction(tx);
                console.log(`Transaction sent to ${recipient}, tx hash: ${txHash}`);
                
                const timeSleep = Math.floor(Math.random() * (13 - 5 + 1)) + 5;
                await sleepWithCountdown(timeSleep);
            } catch (error) {
                console.error(`Failed to send transaction to random address:`, error);
            }
        }

        rl.close();
    });
};

main().catch((error) => {
    console.error('Error in main function:', error);
});
