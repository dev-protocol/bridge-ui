import { UndefinedOr } from '@devprotocol/util-ts';
import { Bridge, networks } from 'arb-ts';
import { Network } from 'arb-ts/dist/lib/networks';
import { ethers } from 'arb-ts/node_modules/ethers';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import { getDEVAddressByChainId, getRpcUrl } from '../utils/utils';

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
	l1PendingTxs: IPendingItem[];
	l2PendingTxs: IPendingItem[];
	txReceipts: IReceiptItem[];
	deposit(amount: ethers.BigNumber): Promise<void>;
	withdraw(amount: ethers.BigNumber): Promise<void>;
}

export enum ConvertDirection {
	WITHDRAW = 'Withdraw',
	DEPOSIT = 'Deposit'
}

export interface IPendingItem {
	direction: ConvertDirection;
	hash: string;
	value: ethers.BigNumber;
}

export interface IReceiptItem {
	receipt: ethers.providers.TransactionReceipt;
	value: ethers.BigNumber;
	layer: 1 | 2;
	direction: ConvertDirection;
}

const bridgeContext: IBridgeContext = {
	bridge: undefined,
	l1PendingTxs: [],
	l2PendingTxs: [],
	txReceipts: [],
	deposit: async _ => {},
	withdraw: async _ => {}
};

export const BridgeContext = createContext(bridgeContext);

export const BridgeProvider: React.FC<IBridgeProviderParams> = ({ children, provider }: IBridgeProviderParams) => {
	const [bridge, setBridge] = useState<UndefinedOr<Bridge>>(undefined);
	const [pollDelay] = useState(10000);
	const [isPolling] = useState(true);
	const [l1PendingTxs, setL1PendingTxHashes] = useState<IPendingItem[]>([]);
	const [l2PendingTxs, setL2PendingTxHashes] = useState<IPendingItem[]>([]);
	const [txReceipts, setTxReceipts] = useState<IReceiptItem[]>([]);

	// poll l1 txs
	useInterval(
		async () => {
			if (!bridge) {
				return;
			}
			for (const tx of l1PendingTxs) {
				try {
					const l1Tx = await bridge.getL1Transaction(tx.hash);

					_addTxReceipt({
						receipt: l1Tx,
						layer: 1,
						value: tx.value,
						direction: tx.direction
					});

					const l2TxHash = await bridge.getL2TxHashByRetryableTicket(tx.hash);
					if (!l2PendingTxs.some(item => item.hash === l2TxHash)) {
						setL2PendingTxHashes([{ direction: tx.direction, hash: l2TxHash, value: tx.value }, ...l2PendingTxs]);
					}

					if (l1Tx.confirmations > 0) {
						setL1PendingTxHashes(l1PendingTxs.filter(item => item.hash !== tx.hash));
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
			for (const tx of l2PendingTxs) {
				try {
					const l2Tx = await bridge.getL2Transaction(tx.hash);

					_addTxReceipt({
						receipt: l2Tx,
						layer: 2,
						value: tx.value,
						direction: tx.direction
					});

					if (l2Tx.confirmations > 0) {
						setL2PendingTxHashes(l2PendingTxs.filter(item => item.hash !== tx.hash));
					}
				} catch (error) {
					console.log(error);
				}
			}
		},
		isPolling ? pollDelay : 0
	);

	const _addTxReceipt = (txReceipt: IReceiptItem) => {
		const exists = txReceipts.some(item => item.receipt.transactionHash === txReceipt.receipt.transactionHash);
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
			try {
				const ethProvider = new ethers.providers.JsonRpcProvider(getRpcUrl(partnerNetwork));
				const arbProvider = provider;
				const l1Signer = ethProvider.getSigner(window.ethereum?.selectedAddress);
				const l2Signer = arbProvider.getSigner();
				const bridge = await Bridge.init(
					l1Signer,
					l2Signer,
					network.tokenBridge.l1ERC20Gateway, // will need to change to l1CustomGateway
					network.tokenBridge.l2ERC20Gateway // will need to change to l2CustomGateway
				);
				setBridge(bridge);
			} catch (error) {
				console.log('error creating l2 bridge: ', error);
			}
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

		const parsedAmount = ethers.utils.parseUnits(amount.toString());

		const res = await bridge.deposit(l1TokenAddress, parsedAmount);

		setL1PendingTxHashes([
			...l1PendingTxs,
			{
				direction: ConvertDirection.DEPOSIT,
				hash: res.hash,
				value: parsedAmount
			}
		]);
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

		const parsedAmount = ethers.utils.parseUnits(amount.toString());

		const withdrawTx = await bridge.withdrawERC20(l1TokenAddress, parsedAmount);

		setL2PendingTxHashes([
			...l1PendingTxs,
			{
				direction: ConvertDirection.WITHDRAW,
				hash: withdrawTx.hash,
				value: parsedAmount
			}
		]);
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

	return (
		<BridgeContext.Provider value={{ bridge, deposit, withdraw, l1PendingTxs, l2PendingTxs, txReceipts }}>
			{children}
		</BridgeContext.Provider>
	);
};
