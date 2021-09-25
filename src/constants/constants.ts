import { AvailableNetwork } from '../types/types';

// !!! TODO these need to be updated to correct bridge contracts
export const MAINNET_GATEWAY_ADDRESS = '';
export const ARBITRUM_MAINNET_GATEWAY_ADDRESS = '';
export const RINKEBY_GATEWAY_ADDRESS = '0x917dc9a69F65dC3082D518192cd3725E1Fa96cA2';
export const ARBITRUM_RINKEBY_GATEWAY_ADDRESS = '0x9b014455AcC2Fe90c52803849d0002aeEC184a06';
// !!!

export const ArbitrumMainnet: AvailableNetwork = {
	name: 'Arbitrum Mainnet',
	chainId: 42161,
	layer: 2,
	isTestnet: false,
	tokenAddress: ''
};

export const AvailableNetworks: AvailableNetwork[] = [
	{
		name: 'Mainnet',
		chainId: 1,
		layer: 1,
		isTestnet: false,
		tokenAddress: '0x5caf454ba92e6f2c929df14667ee360ed9fd5b26'
	},
	ArbitrumMainnet,
	{
		name: 'Rinkeby',
		chainId: 4,
		layer: 1,
		isTestnet: true,
		tokenAddress: '0xa21CB351Fc29aCB7c3901270a5259Bf5e68f11d8' // this is a dummy ERC20 DEV token used for testing
	},
	{
		name: 'Arbitrum Rinkeby',
		chainId: 421611,
		layer: 2,
		isTestnet: true,
		tokenAddress: '0xFaD23945aFa4dF5C7e1F4532C718A125328372e7' // testing
	}
];
