import { getL1Network, getL2Network, Erc20Bridger, L2ContractTransaction } from '@arbitrum/sdk';
import { L1ContractCallTransaction } from '@arbitrum/sdk/dist/lib/message/L1Transaction';
// import { Network } from '@arbitrum/sdk/dist/lib/dataEntities/networks';
// import { L1ContractCallTransactionReceipt } from '@arbitrum/sdk/dist/lib/message/L1Transaction';
import { UndefinedOr } from '@devprotocol/util-ts';
// import { Bridge, networks } from 'arb-ts';
// import { Network } from 'arb-ts/dist/lib/networks';
// import { ethers } from 'arb-ts/node_modules/ethers';
import { BigNumber, providers } from 'ethers';
import React, { createContext, useState } from 'react';
// import { useInterval } from '../hooks/useInterval';
import { getL1WrapperAddressByChainId } from '../utils/utils';

interface IBridgeProviderParams {
	children: React.ReactNode;
	provider: UndefinedOr<providers.Web3Provider>;
	refreshBalances(): void;
}

// interface ICreateBridgeParams {
// 	provider: providers.Web3Provider;
// 	network: Network;
// 	partnerNetwork: Network;
// }

interface IBridgeContext {
	// bridge: UndefinedOr<Bridge>;
	l1PendingTxs: IPendingItem[];
	l2PendingTxs: IPendingItem[];
	txReceipts: IReceiptItem[];
	deposit(amount: BigNumber): Promise<void>;
	withdraw(amount: BigNumber): Promise<void>;
}

export enum ConvertDirection {
	WITHDRAW = 'Withdraw',
	DEPOSIT = 'Deposit'
}

export interface IPendingItem {
	direction: ConvertDirection;
	hash: string;
	value: BigNumber;
}

export interface IReceiptItem {
	receipt: providers.TransactionReceipt;
	value: BigNumber;
	layer: 1 | 2;
	direction: ConvertDirection;
}

const bridgeContext: IBridgeContext = {
	// bridge: undefined,
	l1PendingTxs: [],
	l2PendingTxs: [],
	txReceipts: [],
	deposit: async _ => {},
	withdraw: async _ => {}
};

export const BridgeContext = createContext(bridgeContext);

export const BridgeProvider: React.FC<IBridgeProviderParams> = ({
	children,
	provider,
	refreshBalances
}: IBridgeProviderParams) => {
	// const [bridge, setBridge] = useState<UndefinedOr<Bridge>>(undefined);
	// const [pollDelay] = useState(10000);
	// const [isPolling] = useState(true);
	const [l1PendingTxs, setL1PendingTxHashes] = useState<IPendingItem[]>([]);
	const [l2PendingTxs, setL2PendingTxHashes] = useState<IPendingItem[]>([]);

	// const [l1PendingTxs, setL1PendingTxHashes] = useState<L1ContractCallTransactionReceipt[]>([]);
	// const [l2PendingTxs, setL2PendingTxHashes] = useState<L2TransactionReceipt[]>([]);

	const [txReceipts, setTxReceipts] = useState<IReceiptItem[]>([]);

	// // poll l1 txs
	// useInterval(
	// 	async () => {
	// 		// if (!bridge) {
	// 		// 	return;
	// 		// }
	// 		for (const tx of l1PendingTxs) {
	// 			try {
	// 				tx.

	// 				const l1Tx = await bridge.getL1Transaction(tx.hash);

	// 				_addTxReceipt({
	// 					receipt: l1Tx,
	// 					layer: 1,
	// 					value: tx.value,
	// 					direction: tx.direction
	// 				});

	// 				const l2TxHash = await bridge.getL2TxHashByRetryableTicket(tx.hash);
	// 				if (!l2PendingTxs.some(item => item.hash === l2TxHash)) {
	// 					setL2PendingTxHashes([{ direction: tx.direction, hash: l2TxHash, value: tx.value }, ...l2PendingTxs]);
	// 				}

	// 				if (l1Tx.confirmations > 0) {
	// 					setL1PendingTxHashes(l1PendingTxs.filter(item => item.hash !== tx.hash));
	// 					refreshBalances();
	// 				}
	// 			} catch (error) {
	// 				console.log(error);
	// 			}
	// 		}
	// 	},
	// 	isPolling ? pollDelay : 0
	// );

	// // poll l2 txs
	// useInterval(
	// 	async () => {
	// 		// if (!bridge) {
	// 		// 	return;
	// 		// }
	// 		for (const tx of l2PendingTxs) {
	// 			try {
	// 				const l2Tx = await bridge.getL2Transaction(tx.hash);

	// 				_addTxReceipt({
	// 					receipt: l2Tx,
	// 					layer: 2,
	// 					value: tx.value,
	// 					direction: tx.direction
	// 				});

	// 				if (l2Tx.confirmations > 0) {
	// 					setL2PendingTxHashes(l2PendingTxs.filter(item => item.hash !== tx.hash));
	// 					refreshBalances();
	// 				}
	// 			} catch (error) {
	// 				console.log(error);
	// 			}
	// 		}
	// 	},
	// 	isPolling ? pollDelay : 0
	// );

	const _addTxReceipt = (txReceipt: IReceiptItem) => {
		console.log('adding tx receipt: ', txReceipt.receipt.transactionHash);
		const exists = txReceipts.some(item => item.receipt.transactionHash === txReceipt.receipt.transactionHash);
		console.log('tx receipt exists? ', exists);
		if (!exists) {
			console.log('setting new tx receipts');
			setTxReceipts(_txReceipts => [txReceipt, ..._txReceipts]);
			setTimeout(() => console.log('new tx receipts are: ', txReceipts), 1000);
		}
	};

	const _getL1TokenAddress = async (): Promise<UndefinedOr<string>> => {
		if (!provider) {
			return;
		}

		// const network = networks[(await provider.getNetwork()).chainId];
		// if (!network) {
		// 	console.error('invalid network');
		// 	return;
		// }

		return getL1WrapperAddressByChainId(+(await provider.getNetwork()).chainId);
	};

	// const createL1Bridge = useCallback(
	// 	async ({ provider, network, partnerNetwork }: ICreateBridgeParams): Promise<void> => {
	// 		const ethProvider = provider;
	// 		const arbProvider = new ethers.providers.JsonRpcProvider(partnerNetwork.rpcURL);

	// 		const l1Signer = ethProvider.getSigner(0);
	// 		const l2Signer = arbProvider.getSigner(window.ethereum?.selectedAddress);
	// 		const bridge = await Bridge.init(
	// 			l1Signer,
	// 			l2Signer,
	// 			network.tokenBridge.l1ERC20Gateway, // will need to change to l1CustomGateway
	// 			network.tokenBridge.l2ERC20Gateway // will need to change to l2CustomGateway
	// 		);
	// 		setBridge(bridge);
	// 	},
	// 	[setBridge]
	// );

	// const createL1ToL2Bridge = useCallback(
	// 	async ({ provider, network, partnerNetwork }: ICreateBridgeParams): Promise<void> => {
	// 		const ethProvider = provider;
	// 		const l1Signer = ethProvider.getSigner(0);
	// 		const l2Provider = new providers.JsonRpcProvider(partnerNetwork.rpcURL);

	// 		const l2Network = await getL2Network(partnerNetwork /** <-- chain id of target Arbitrum chain */);
	// 		const ethBridger = new Erc20Bridger(l2Network);

	// 		const ethDepositTxResponse = await ethBridger.deposit({
	// 			amount: utils.parseEther('23'),
	// 			l1Signer /** <-- connected ethers-js Wallet */,
	// 			l2Provider /** <--- ethers-js Provider */,
	// 			erc20L1Address: network.tokenBridge.l1ERC20Gateway
	// 		});

	// 		// const ethDepositTxReceipt = await ethDepositTxResponse.wait();

	// 		// const l1Signer = ethProvider.getSigner(0);
	// 		// const l2Signer = arbProvider.getSigner(window.ethereum?.selectedAddress);
	// 		// const bridge = await Bridge.init(
	// 		// 	l1Signer,
	// 		// 	l2Signer,
	// 		// 	network.tokenBridge.l1ERC20Gateway, // will need to change to l1CustomGateway
	// 		// 	network.tokenBridge.l2ERC20Gateway // will need to change to l2CustomGateway
	// 		// );
	// 		// setBridge(bridge);
	// 	},
	// 	[setBridge]
	// );

	// const createL2Bridge = useCallback(
	// 	async ({ provider, network, partnerNetwork }: ICreateBridgeParams): Promise<void> => {
	// 		try {
	// 			const ethProvider = new ethers.providers.JsonRpcProvider(getRpcUrl(partnerNetwork));
	// 			const arbProvider = provider;
	// 			const l1Signer = ethProvider.getSigner(window.ethereum?.selectedAddress);
	// 			const l2Signer = arbProvider.getSigner();
	// 			const bridge = await Bridge.init(
	// 				l1Signer,
	// 				l2Signer,
	// 				network.tokenBridge.l1ERC20Gateway, // will need to change to l1CustomGateway
	// 				network.tokenBridge.l2ERC20Gateway // will need to change to l2CustomGateway
	// 			);
	// 			setBridge(bridge);
	// 		} catch (error) {
	// 			console.log('error creating l2 bridge: ', error);
	// 		}
	// 	},
	// 	[setBridge]
	// );

	const _processDeposit = async ({
		callTx,
		amount,
		l2Provider
	}: {
		callTx: L1ContractCallTransaction;
		amount: BigNumber;
		l2Provider: providers.Provider;
	}) => {
		setL1PendingTxHashes([
			...l1PendingTxs,
			{
				direction: ConvertDirection.DEPOSIT,
				hash: callTx.hash,
				value: amount
			}
		]);

		const ethDepositTxReceipt = await callTx.wait();

		_addTxReceipt({
			receipt: ethDepositTxReceipt,
			value: amount,
			layer: 1,
			direction: ConvertDirection.DEPOSIT
		});

		// remove pending l1
		setL1PendingTxHashes(l1PendingTxs.filter(item => item.hash !== callTx.hash));

		const l1Tol2Message = await ethDepositTxReceipt.getL1ToL2Message(l2Provider);

		setL2PendingTxHashes([
			...l2PendingTxs,
			{
				direction: ConvertDirection.DEPOSIT,
				hash: l1Tol2Message.l2TxHash,
				value: amount
			}
		]);

		const l2Tx = await ethDepositTxReceipt.waitForL2(l2Provider);
		const l2TxReceipt = await l2Tx.message.getL2TxReceipt();

		setL2PendingTxHashes(l2PendingTxs.filter(item => item.hash !== l2TxReceipt.transactionHash));

		_addTxReceipt({
			receipt: l2TxReceipt,
			value: amount,
			layer: 2,
			direction: ConvertDirection.DEPOSIT
		});
		refreshBalances();
	};

	const deposit = async (amount: BigNumber) => {
		const l1WrapperAddress = await _getL1TokenAddress();
		if (!l1WrapperAddress) {
			console.error('error fetching l1ChainId');
			return;
		}

		const ethProvider = provider;
		if (!ethProvider) {
			console.error('no provider found');
			return;
		}
		const l1Signer = ethProvider.getSigner(0);
		const l1Network = await getL1Network(l1Signer /** <-- chain id of target Arbitrum chain */);
		const l2Network = await getL2Network(l1Network.partnerChainIDs[0] /** <-- chain id of target Arbitrum chain */);
		const l2Provider = new providers.JsonRpcProvider(l2Network.rpcURL);
		const erc20Bridger = new Erc20Bridger(l2Network);
		const ethDepositTxResponse = await erc20Bridger.deposit({
			amount,
			l1Signer /** <-- connected ethers-js Wallet */,
			l2Provider /** <--- ethers-js Provider */,
			erc20L1Address: getL1WrapperAddressByChainId(l1Network.chainID)
		});

		_processDeposit({ callTx: ethDepositTxResponse, amount, l2Provider });
	};

	const _processWithdraw = async () => {};

	const withdraw = async (amount: BigNumber) => {
		// if (!bridge) {
		// 	console.error('Bridge not initilized');
		// 	return;
		// }
		console.log('withdraw hit');

		const ethProvider = provider;
		if (!ethProvider) {
			console.error('no provider found');
			return;
		}

		console.log('000');
		const l2Signer = ethProvider.getSigner(0);
		// const l2Provider = new providers.JsonRpcProvider(partnerNetwork.rpcURL);
		const l2Network = await getL2Network(l2Signer);

		const l1Network = await getL1Network(l2Network.partnerChainID /** <-- chain id of target Arbitrum chain */);
		console.log('l2 network is: ', l1Network);

		// l2Network.rpcURL
		// const l2Provider = new providers.JsonRpcProvider(l2Network.rpcURL);

		const erc20Bridger = new Erc20Bridger(l2Network);

		console.log('111');

		const l1WrapperAddress = await _getL1TokenAddress();
		if (!l1WrapperAddress) {
			console.error('error fetching l1ChainId');
			return;
		}

		console.log('222');

		let withdrawTx: L2ContractTransaction;

		try {
			console.log('l1WrapperAddress: ', l1WrapperAddress);
			withdrawTx = await erc20Bridger.withdraw({
				erc20l1Address: l1WrapperAddress,
				l2Signer,
				amount
			});
			console.log('withdrawTx: ', withdrawTx);
		} catch (error) {
			console.log('error is: ', error);
			return;
		}

		console.log('333');

		const l2TxReceipt = await withdrawTx.wait();
		console.log('l2TxReceipt is: ', l2TxReceipt);

		_addTxReceipt({
			receipt: l2TxReceipt,
			value: amount,
			layer: 2,
			direction: ConvertDirection.WITHDRAW
		});

		// const l1Network = await getL1Network(l2Signer /** <-- chain id of target Arbitrum chain */);
		console.log('l2 network is: ', l2Network);
		// l2Network.rpcURL
		const l1Provider = new providers.JsonRpcProvider(l1Network.rpcURL);

		// await l2TxReceipt.isDataAvailable(ethProvider, l1Provider);

		console.log('PRE');
		const l2ToL1Events = await l2TxReceipt.getL2ToL1Events();
		l2ToL1Events.map(e => console.log('l2ToL1Events: ', e));
		const l2ToL1Msg = await l2TxReceipt.getL2ToL1Messages(l1Provider, l2Network);
		l2ToL1Msg.map(e => console.log('l2ToL1Msg: ', e));

		await l2TxReceipt.isDataAvailable(ethProvider, l1Provider);
		console.log('... DATA IS AVAILABLE ...');
		const l2ToL1Events1 = await l2TxReceipt.getL2ToL1Events();
		l2ToL1Events1.map(e => console.log('l2ToL1Events1: ', e));
		const l2ToL1Msg1 = await l2TxReceipt.getL2ToL1Messages(l1Provider, l2Network);
		l2ToL1Msg1.map(e => console.log('l2ToL1Msg1: ', e));

		// l2TxReceipt.

		// const withdrawTx = await bridge.withdrawERC20(l1WrapperAddress, amount);

		// setL2PendingTxHashes([
		// 	...l1PendingTxs,
		// 	{
		// 		direction: ConvertDirection.WITHDRAW,
		// 		hash: withdrawTx.hash,
		// 		value: amount
		// 	}
		// ]);
		// setL2PendingTxHashes([...l2PendingTxs, l2TxReceipt]);
		_processWithdraw();
	};

	// const withdraw = async (amount: BigNumber) => {
	// 	if (!bridge) {
	// 		console.error('Bridge not initilized');
	// 		return;
	// 	}

	// 	const l1WrapperAddress = await _getL1TokenAddress();
	// 	if (!l1WrapperAddress) {
	// 		console.error('error fetching l1ChainId');
	// 		return;
	// 	}

	// 	const withdrawTx = await bridge.withdrawERC20(l1WrapperAddress, amount);

	// 	setL2PendingTxHashes([
	// 		...l1PendingTxs,
	// 		{
	// 			direction: ConvertDirection.WITHDRAW,
	// 			hash: withdrawTx.hash,
	// 			value: amount
	// 		}
	// 	]);
	// };

	// useEffect(() => {
	// 	const buildBridge = async () => {
	// 		if (!provider) {
	// 			return;
	// 		}

	// 		const network = networks[(await provider.getNetwork()).chainId];
	// 		if (!network) {
	// 			return;
	// 		}
	// 		const partnerNetwork = networks[network.partnerChainID];

	// 		// set Bridge
	// 		if (network.isArbitrum) createL2Bridge({ provider, network, partnerNetwork });
	// 		else createL1ToL2Bridge({ provider, network, partnerNetwork });
	// 	};
	// 	buildBridge();
	// }, [provider, createL1ToL2Bridge, createL2Bridge]);

	return (
		<BridgeContext.Provider value={{ deposit, withdraw, txReceipts, l1PendingTxs, l2PendingTxs }}>
			{children}
		</BridgeContext.Provider>
	);
};
