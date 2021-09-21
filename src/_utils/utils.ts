import { UndefinedOr } from '@devprotocol/util-ts';
import { ethers } from 'ethers';
import { AvailableNetworks } from '../_const/constants';
import { AvailableNetwork } from '../_types/types';

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
