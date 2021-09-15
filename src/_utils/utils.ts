import { UndefinedOr } from '@devprotocol/util-ts';
import { AvailableNetworks } from '../_const/constants';
import { AvailableNetwork } from '../_types/types';

export const getAvailableNetworkByChainId = (id: number): UndefinedOr<AvailableNetwork> =>
	AvailableNetworks.find(network => network.chainId === id);

export const isValidChain = (chainId: number): boolean => {
	const validNetwork = AvailableNetworks.filter(network => network.chainId === chainId);
	return validNetwork.length > 0;
};

export const getTargetNetworkOptions = ({
	layer,
	isTestnet
}: {
	layer: 1 | 2;
	isTestnet: boolean;
}): AvailableNetwork[] =>
	AvailableNetworks.filter(network => network.layer === layer && network.isTestnet === isTestnet);
