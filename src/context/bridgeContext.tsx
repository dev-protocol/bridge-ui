import { UndefinedOr } from '@devprotocol/util-ts';
import { Bridge, networks } from 'arb-ts';
import { Network } from 'arb-ts/dist/lib/networks';
import { ethers } from 'arb-ts/node_modules/ethers';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import { getDEVAddressByChainId } from '../utils/utils';

interface IBridgeProviderParams {
	children: React.ReactNode;
	provider: UndefinedOr<ethers.providers.Web3Provider>;
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
	const [pollDelay] = useState(10000);
	const [isPolling] = useState(true);
	const [l1PendingTxHashes, setL1PendingTxHashes] = useState<string[]>([]);
	const [l2PendingTxHashes, setL2PendingTxHashes] = useState<string[]>([]);
	const [txReceipts, setTxReceipts] = useState<ethers.providers.TransactionReceipt[]>([]);

	// poll l1 txs
	useInterval(
		async () => {
			if (!bridge) {
				return;
			}
			for (const hash of l1PendingTxHashes) {
				try {
					const l1Tx = await bridge.getL1Transaction(hash);

					_addTxReceipt(l1Tx);

					const l2TxHash = await bridge.getL2TxHashByRetryableTicket(hash);
					if (!l2PendingTxHashes.includes(l2TxHash)) {
						setL2PendingTxHashes([l2TxHash, ...l2PendingTxHashes]);
					}

					if (l1Tx.confirmations > 0) {
						setL1PendingTxHashes(l1PendingTxHashes.filter(_hash => _hash !== hash));
					}
				} catch (error) {
					console.log(error);
				}
			}
		},
		isPolling ? pollDelay : 0
	);

	// poll l2 txs
	useInterval(
		async () => {
			if (!bridge) {
				return;
			}
			for (const hash of l2PendingTxHashes) {
				try {
					const l2Tx = await bridge.getL2Transaction(hash);

					_addTxReceipt(l2Tx);

					if (l2Tx.confirmations > 0) {
						setL2PendingTxHashes(l2PendingTxHashes.filter(_hash => _hash !== hash));
					}
				} catch (error) {
					console.log(error);
				}
			}
		},
		isPolling ? pollDelay : 0
	);

	const _addTxReceipt = (txReceipt: ethers.providers.TransactionReceipt) => {
		const exists = txReceipts.some(receipt => receipt.transactionHash === txReceipt.transactionHash);
		if (!exists) {
			setTxReceipts([txReceipt, ...txReceipts]);
		}
	};

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

		const l1TokenAddress = await _getL1TokenAddress();
		if (!l1TokenAddress) {
			console.error('error fetching l1ChainId');
			return;
		}

		const res = await bridge.deposit(l1TokenAddress, ethers.utils.parseUnits(amount.toString()));

		setL1PendingTxHashes([...l1PendingTxHashes, res.hash]);
	};

	const withdraw = async (amount: ethers.BigNumber) => {
		if (!bridge) {
			console.error('Bridge not initilized');
			return;
		}

		const l1TokenAddress = await _getL1TokenAddress();
		if (!l1TokenAddress) {
			console.error('error fetching l1ChainId');
			return;
		}

		const res = await bridge.withdrawERC20(l1TokenAddress, ethers.utils.parseUnits(amount.toString()));
		console.log('withdraw res', res);
	};

	const _getL1TokenAddress = async (): Promise<UndefinedOr<string>> => {
		if (!provider) {
			return;
		}

		const network = networks[(await provider.getNetwork()).chainId];
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
		const buildBridge = async () => {
			if (!provider) {
				return;
			}

			const network = networks[(await provider.getNetwork()).chainId];
			if (!network) {
				return;
			}
			const partnerNetwork = networks[network.partnerChainID];

			// set Bridge
			if (network.isArbitrum) createL2Bridge({ provider, network, partnerNetwork });
			else createL1Bridge({ provider, network, partnerNetwork });
		};
		buildBridge();
	}, [provider, createL1Bridge, createL2Bridge]);

	return <BridgeContext.Provider value={{ bridge, deposit, withdraw }}>{children}</BridgeContext.Provider>;
};
