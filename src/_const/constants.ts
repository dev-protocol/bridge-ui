import { AvailableNetwork } from '../_types/types';

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
		tokenAddress: ''
	},
	{
		name: 'Arbitrum Rinkeby',
		chainId: 421611,
		layer: 2,
		isTestnet: true,
		tokenAddress: ''
	}
];
