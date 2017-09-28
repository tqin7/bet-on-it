if (typeof web3 == 'undefined') {
	web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
	console.log("Provider set to 8545\n");
} else {
	console.log("web3 is not undefined " + web3.provider);
}
