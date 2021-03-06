import { AvailableNetwork, L1Network } from '../types/types';

export const MAINNET_GATEWAY_ADDRESS = '0xcEe284F754E854890e311e3280b767F80797180d';
export const ARBITRUM_MAINNET_GATEWAY_ADDRESS = '0x096760F208390250649E3e8763348E783AEF5562';
export const RINKEBY_GATEWAY_ADDRESS = '0x917dc9a69F65dC3082D518192cd3725E1Fa96cA2';
export const ARBITRUM_RINKEBY_GATEWAY_ADDRESS = '0x9b014455AcC2Fe90c52803849d0002aeEC184a06';

export const L1_MAINNET_DEV_ADDRESS = '0x5caf454ba92e6f2c929df14667ee360ed9fd5b26';
export const L1_RINKEBY_DEV_ADDRESS = '0xa21cb351fc29acb7c3901270a5259bf5e68f11d8'; // TODO: this needs to be changed is Dummy DEV for testing
export const ARB_MAINNET_DEV_ADDRESS = '0x91F5dC90979b058eBA3be6B7B7e523df7e84e137';
export const ARB_RINKEBY_DEV_ADDRESS = '0x53a8fc7d1663807eac3daafa81b5b3c81f028479'; // TODO: this needs to be changed is Dummy DEV for testing
export const ARB_DEV_WRAPPER_RINKEBY = '0xb970C9AB82C9b5110d734bA413AA3527ddd9eB6F';
export const ARB_DEV_WRAPPER_MAINNET = '0xcc069f8323858537158Dc47F6c208C8174038aF9';
export const POLYGON_DEV_WRAPPER_MAINNET = '0x4A5DF63b0C37B38515e4eE51bAf40edd420bF7d5';

// TODO - separate out available BRIDGE networks and available WRAP (only L1) networks

export const ArbitrumMainnet: AvailableNetwork = {
	name: 'Arbitrum Mainnet',
	chainId: 42161,
	layer: 2,
	isTestnet: false,
	tokenAddress: ARB_MAINNET_DEV_ADDRESS
};

export const MAINNET_DEST_ARBITRUM: L1Network = {
	name: 'Mainnet',
	chainId: 1,
	layer: 1,
	isTestnet: false,
	tokenAddress: L1_MAINNET_DEV_ADDRESS,
	wrapperTokenAddress: ARB_DEV_WRAPPER_MAINNET,
	destination: 'arbitrum'
};

export const RINKEBY_DEST_ARBITRUM: L1Network = {
	name: 'Rinkeby',
	chainId: 4,
	layer: 1,
	isTestnet: true,
	tokenAddress: L1_RINKEBY_DEV_ADDRESS, // this is a dummy ERC20 DEV token used for testing
	wrapperTokenAddress: ARB_DEV_WRAPPER_RINKEBY,
	destination: 'arbitrum'
};

export const MAINNET_DEST_POLYGON: L1Network = {
	name: 'Mainnet',
	chainId: 1,
	layer: 1,
	isTestnet: false,
	tokenAddress: L1_MAINNET_DEV_ADDRESS,
	wrapperTokenAddress: POLYGON_DEV_WRAPPER_MAINNET,
	destination: 'polygon'
};

export const L1Networks = [MAINNET_DEST_ARBITRUM, RINKEBY_DEST_ARBITRUM, MAINNET_DEST_POLYGON];

export const AvailableNetworks: AvailableNetwork[] = [
	MAINNET_DEST_ARBITRUM,
	RINKEBY_DEST_ARBITRUM,
	MAINNET_DEST_POLYGON,
	ArbitrumMainnet,
	{
		name: 'Arbitrum Rinkeby',
		chainId: 421611,
		layer: 2,
		isTestnet: true,
		tokenAddress: ARB_RINKEBY_DEV_ADDRESS // testing
	}
];
