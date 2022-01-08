export type Destination = 'arbitrum' | 'polygon';

export type AvailableNetwork = {
	name: string;
	chainId: number;
	layer: number;
	isTestnet: boolean;
	tokenAddress: string;
};

export type L1Network = AvailableNetwork & {
	wrapperTokenAddress: string;
	destination: Destination;
};
