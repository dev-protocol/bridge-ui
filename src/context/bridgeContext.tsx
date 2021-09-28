import { UndefinedOr } from '@devprotocol/util-ts';
import { Bridge, networks } from 'arb-ts';
import { Network } from 'arb-ts/dist/lib/networks';
import { ethers } from 'arb-ts/node_modules/ethers';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getDEVAddressByChainId } from '../utils/utils';

interface IBridgeProviderParams {
	children: React.ReactNode;
	provider: ethers.providers.Web3Provider;
}

interface ICreateBridgeParams {
	provider: ethers.providers.Web3Provider;
	network: Network;
	partnerNetwork: Network;
}

interface IBridgeContext {
	bridge: UndefinedOr<Bridge>;
	deposit(amount: ethers.BigNumber): Promise<void>;
	withdraw(amount: ethers.BigNumber): Promise<void>;
}

const bridgeContext: IBridgeContext = {
	bridge: undefined,
	deposit: async _ => {},
	withdraw: async _ => {}
};

export const BridgeContext = createContext(bridgeContext);

export const BridgeProvider: React.FC<IBridgeProviderParams> = ({ children, provider }: IBridgeProviderParams) => {
	const [bridge, setBridge] = useState<UndefinedOr<Bridge>>(undefined);

	const createL1Bridge = useCallback(
		async ({ provider, network, partnerNetwork }: ICreateBridgeParams): Promise<void> => {
			const ethProvider = provider;
			const arbProvider = new ethers.providers.JsonRpcProvider(partnerNetwork.rpcURL);

			const l1Signer = ethProvider.getSigner(0);
			const l2Signer = arbProvider.getSigner(window.ethereum?.selectedAddress);
			const bridge = await Bridge.init(
				l1Signer,
				l2Signer,
				network.tokenBridge.l1ERC20Gateway, // will need to change to l1CustomGateway
				network.tokenBridge.l2ERC20Gateway // will need to change to l2CustomGateway
			);
			setBridge(bridge);
		},
		[setBridge]
	);

	const createL2Bridge = useCallback(
		async ({ provider, network, partnerNetwork }: ICreateBridgeParams): Promise<void> => {
			const ethProvider = new ethers.providers.JsonRpcProvider(partnerNetwork.rpcURL);
			const arbProvider = provider;
			const l1Signer = ethProvider.getSigner(window.ethereum?.selectedAddress);
			const l2Signer = arbProvider.getSigner(0);
			const bridge = await Bridge.init(
				l1Signer,
				l2Signer,
				network.tokenBridge.l1ERC20Gateway, // will need to change to l1CustomGateway
				network.tokenBridge.l2ERC20Gateway // will need to change to l2CustomGateway
			);
			setBridge(bridge);
		},
		[setBridge]
	);

	const deposit = async (amount: ethers.BigNumber) => {
		if (!bridge) {
			console.error('Bridge not initilized');
			return;
		}

		const l1ChainId = _getL1TokenAddress();
		if (!l1ChainId) {
			console.error('error fetching l1ChainId');
			return;
		}

		const l1TokenAddress = getDEVAddressByChainId(+l1ChainId);

		const res = await bridge.deposit(l1TokenAddress, amount);
		console.log('success is: ', res);
	};

	const withdraw = async (amount: ethers.BigNumber) => {
		if (!bridge) {
			console.error('Bridge not initilized');
			return;
		}

		const l1ChainId = _getL1TokenAddress();
		if (!l1ChainId) {
			console.error('error fetching l1ChainId');
			return;
		}

		const l1TokenAddress = getDEVAddressByChainId(+l1ChainId);

		const res = await bridge.withdrawERC20(l1TokenAddress, amount);
		console.log('withdraw res', res);
	};

	const _getL1TokenAddress = (): UndefinedOr<string> => {
		const network = networks[provider.network.chainId];
		if (!network) {
			console.error('invalid network');
			return;
		}

		if (!bridge) {
			console.error('Bridge not initilized');
			return;
		}

		const partnerNetwork = networks[network.partnerChainID];
		const l1ChainId = network.isArbitrum ? partnerNetwork.chainID : network.chainID;
		return getDEVAddressByChainId(+l1ChainId);
	};

	useEffect(() => {
		console.log('network updated!');
		const network = networks[provider.network.chainId];
		if (!network) {
			return;
		}
		const partnerNetwork = networks[network.partnerChainID];

		// set Bridge
		if (network.isArbitrum) createL2Bridge({ provider, network, partnerNetwork });
		else createL1Bridge({ provider, network, partnerNetwork });
	}, [provider, createL1Bridge, createL2Bridge]);

	return <BridgeContext.Provider value={{ bridge, deposit, withdraw }}>{children}</BridgeContext.Provider>;
};
