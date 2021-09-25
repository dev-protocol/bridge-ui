import { UndefinedOr } from '@devprotocol/util-ts';
import { ethers } from 'ethers';
import {
	ARBITRUM_MAINNET_GATEWAY_ADDRESS,
	ARBITRUM_RINKEBY_GATEWAY_ADDRESS,
	AvailableNetworks,
	MAINNET_GATEWAY_ADDRESS,
	RINKEBY_GATEWAY_ADDRESS
} from '../constants/constants';
import { AvailableNetwork } from '../types/types';
import { getAddress } from '@ethersproject/address';

export const getAvailableNetworkByChainId = (id: number): UndefinedOr<AvailableNetwork> =>
	AvailableNetworks.find(network => network.chainId === id);

/**
 * Check by chainId if you can interact with it as a bridge
 * @param chainId number
 * @returns boolean
 */
export const isValidChain = (chainId: number): boolean => {
	const validNetwork = AvailableNetworks.filter(network => network.chainId === chainId);
	return validNetwork.length > 0;
};

/**
 * Pass in the source network to get the bridge contract gateway address
 * @param network source AvailableNetwork. For example, sending Mainnet -> Arbitrum Mainnet, pass in Mainnet Network
 * @returns Gateway address
 */
export const getGatewayAddressByChainId = (chainId: number): string => {
	switch (chainId) {
		case 1:
			return MAINNET_GATEWAY_ADDRESS;

		case 4:
			return RINKEBY_GATEWAY_ADDRESS;

		case 42161:
			return ARBITRUM_MAINNET_GATEWAY_ADDRESS;

		case 421611:
			return ARBITRUM_RINKEBY_GATEWAY_ADDRESS;

		default:
			throw Error(`no gateway address for this network ${chainId}`);
	}
};

/**
 * Once connected, get the available target networks.
 * For example, if connected to mainnet, target network could be Arbitrum Mainnet
 * @param layer 1 | 2
 * @param isTestnet boolean
 * @returns AvailableNetwork[]
 */
export const getTargetNetworkOptions = ({
	layer,
	isTestnet
}: {
	layer: 1 | 2;
	isTestnet: boolean;
}): AvailableNetwork[] =>
	AvailableNetworks.filter(network => network.layer === layer && network.isTestnet === isTestnet);

/**
 * This is created since provider.getNetwork() returns 'unknown' name for Arbitrum Rinkeby
 * @param network ethers.providers.Network
 * @returns ethers.providers.Network
 */
export const patchNetworkName = (network: ethers.providers.Network): ethers.providers.Network => {
	switch (network.chainId) {
		case 421611: // Arbitrum Rinkeby
			return { name: 'Arbitrum Rinkeby', chainId: network.chainId };
		default:
			return network;
	}
};

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
	try {
		return getAddress(value);
	} catch {
		return false;
	}
}
