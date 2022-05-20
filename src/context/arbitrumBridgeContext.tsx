import {
	getL1Network,
	getL2Network,
	Erc20Bridger,
	L2ContractTransaction,
	L2TransactionReceipt,
	L2ToL1MessageReader
} from '@arbitrum/sdk';
import { L1ContractCallTransaction } from '@arbitrum/sdk/dist/lib/message/L1Transaction';
// import { Network } from '@arbitrum/sdk/dist/lib/dataEntities/networks';
// import { L1ContractCallTransactionReceipt } from '@arbitrum/sdk/dist/lib/message/L1Transaction';
import { UndefinedOr } from '@devprotocol/util-ts';
// import { Bridge, networks } from 'arb-ts';
// import { Network } from 'arb-ts/dist/lib/networks';
// import { ethers } from 'arb-ts/node_modules/ethers';
import { BigNumber, providers } from 'ethers';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getL2GatewayGraphLatestBlockNumber } from '../utils/arbitrumGraph';
// import { useInterval } from '../hooks/useInterval';
import {
	getAvailableNetworkByChainId,
	getGatewayAddressByChainId,
	getL1WrapperAddressByChainId,
	getRpcUrl
} from '../utils/utils';
// import erc20ABI from '../constants/erc20.abi.json';
// import // getL2GatewayGraphLatestBlockNumber
// // getTokenWithdrawals as getTokenWithdrawalsGraph
// '../utils/arbitrumGraph';

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
	const [erc20Bridger, setErc20Bridger] = useState<Erc20Bridger>();
	// const [withdrawToL1Bridge, setWithdrawToL1Bridge] = useState<Erc20Bridger>();
	// const [depositToL2Bridge, setDepositToL2Bridge] = useState<Erc20Bridger>();

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
		if (!erc20Bridger) {
			console.error('no erc20Bridger');
			return;
		}

		const l1Signer = ethProvider.getSigner(0);
		const l1Network = await getL1Network(l1Signer /** <-- chain id of target Arbitrum chain */);
		const l2Network = await getL2Network(l1Network.partnerChainIDs[0] /** <-- chain id of target Arbitrum chain */);
		const l2Provider = new providers.JsonRpcProvider(l2Network.rpcURL);
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

		console.log('amount is: ', amount.toString());

		const ethProvider = provider;
		if (!ethProvider) {
			console.error('no provider found');
			return;
		}

		if (!erc20Bridger) {
			console.error('no erc20Bridger');
			return;
		}

		const l2Signer = ethProvider.getSigner(0);
		// const l2Provider = new providers.JsonRpcProvider(partnerNetwork.rpcURL);
		const l2Network = await getL2Network(l2Signer);

		const l1Network = await getL1Network(l2Network.partnerChainID /** <-- chain id of target Arbitrum chain */);
		console.log('l2 network is: ', l1Network);

		const l1WrapperAddress = await _getL1TokenAddress();
		const l1Provider = new providers.JsonRpcProvider(getRpcUrl(l1Network));

		if (l1WrapperAddress) {
			const gatewayAddress = await erc20Bridger.getL2GatewayAddress(l1WrapperAddress, ethProvider);
			console.log('gateway address is: ', gatewayAddress);
			try {
				console.log('l1 network is: ', l1Network);
				const getL1GatewayAddress = await erc20Bridger.getL1GatewayAddress(l1WrapperAddress, l1Provider);
				console.log('getL1GatewayAddress: ', getL1GatewayAddress);
			} catch (error) {
				console.log('error: ', error);
			}
		}

		if (!l1WrapperAddress) {
			console.error('error fetching l1ChainId');
			return;
		}

		let withdrawTx: L2ContractTransaction;

		withdrawTx = await erc20Bridger.withdraw({
			erc20l1Address: l1WrapperAddress,
			l2Signer,
			amount
		});

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
		// const l1Provider = new providers.JsonRpcProvider(l1Network.rpcURL);

		// await l2TxReceipt.isDataAvailable(ethProvider, l1Provider);

		console.log('PRE');
		const l2ToL1Events = await l2TxReceipt.getL2ToL1Events();
		l2ToL1Events.map(e => console.log('l2ToL1Events: ', e));
		const l2ToL1Msg = await l2TxReceipt.getL2ToL1Messages(l1Provider, l2Network);
		l2ToL1Msg.map(e => console.log('l2ToL1Msg: ', e));

		// l2TxReceipt.

		// erc20Bridger.

		try {
			// await l2TxReceipt.isDataAvailable(ethProvider, l1Provider);
			// console.log('... DATA IS AVAILABLE ...');
			const l2ToL1Events1 = await l2TxReceipt.getL2ToL1Events();
			l2ToL1Events1.map(e => console.log('l2ToL1Events1: ', e));
			const l2ToL1Msg1 = await l2TxReceipt.getL2ToL1Messages(l1Provider, l2Network);
			l2ToL1Msg1.map(e => console.log('l2ToL1Msg1: ', e));
		} catch (error) {
			console.log('1 error: ', error);
		}

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

	// const _fetchDevTxsByAddress = useCallback(async () => {
	// 	if (!provider) {
	// 		return;
	// 	}
	// 	console.log('...fetching...');
	// 	const chainId = (await provider.getNetwork()).chainId;
	// 	const userAddress = await provider.getSigner().getAddress();
	// 	const _l1WrappedDev = new ethers.Contract(getL1WrapperAddressByChainId(chainId), erc20ABI);
	// 	// _l1WrappedDev.queryFilter(ethers.EventFilter(), 0);
	// 	const txsFrom = await _l1WrappedDev.filters.Transfer(userAddress);
	// 	console.log('txs from: ', txsFrom);
	// }, [provider]);

	// const getTokenWithdrawals = async (gatewayAddresses: string[], filter?: providers.Filter) => {
	// 	const t = new Date().getTime();

	// 	const latestGraphBlockNumber = await getL2GatewayGraphLatestBlockNumber(l1NetworkID);
	// 	const startBlock = (filter && filter.fromBlock && +filter.fromBlock.toString()) || 0;
	// 	const pivotBlock = Math.max(latestGraphBlockNumber, startBlock);

	// 	const gatewayWithdrawalsResultsNested = await Promise.all(
	// 		gatewayAddresses.map(gatewayAddress =>
	// 			erc20Bridger.getL2WithdrawalEvents(
	// 				l2.signer.provider,
	// 				gatewayAddress,
	// 				{ fromBlock: pivotBlock, toBlock: 'latest' },
	// 				undefined,
	// 				walletAddress
	// 			)
	// 		)
	// 	);

	// 	console.log(`*** got token gateway event data in ${(new Date().getTime() - t) / 1000} seconds *** `);

	// 	const gatewayWithdrawalsResults = gatewayWithdrawalsResultsNested.flat();
	// 	const symbols = await Promise.all(
	// 		gatewayWithdrawalsResults.map(withdrawEventData => getTokenSymbol(withdrawEventData.l1Token))
	// 	);
	// 	const decimals = await Promise.all(
	// 		gatewayWithdrawalsResults.map(withdrawEventData => getTokenDecimals(withdrawEventData.l1Token))
	// 	);

	// 	const l2Txns = await Promise.all(
	// 		gatewayWithdrawalsResults.map(withdrawEventData =>
	// 			l2.signer.provider.getTransactionReceipt(withdrawEventData.txHash)
	// 		)
	// 	);

	// 	const outgoingMessageStates = await Promise.all(
	// 		l2Txns.map(txReceipt => {
	// 			const l2TxReceipt = new L2TransactionReceipt(txReceipt);
	// 			// TODO: length != 1
	// 			const [{ batchNumber, indexInBatch }] = l2TxReceipt.getL2ToL1Events();
	// 			return getOutgoingMessageState(batchNumber, indexInBatch);
	// 		})
	// 	);

	// 	return gatewayWithdrawalsResults.map((withdrawEventData: WithdrawalInitiated, i) => {
	// 		const l2TxReceipt = new L2TransactionReceipt(l2Txns[i]);
	// 		// TODO: length != 1
	// 		const [
	// 			{
	// 				caller,
	// 				destination,
	// 				uniqueId,
	// 				batchNumber,
	// 				indexInBatch,
	// 				arbBlockNum,
	// 				ethBlockNum,
	// 				timestamp,
	// 				callvalue,
	// 				data
	// 			}
	// 		] = l2TxReceipt.getL2ToL1Events();

	// 		const eventDataPlus: L2ToL1EventResultPlus = {
	// 			caller,
	// 			destination,
	// 			uniqueId,
	// 			batchNumber,
	// 			indexInBatch,
	// 			arbBlockNum,
	// 			ethBlockNum,
	// 			timestamp,
	// 			callvalue,
	// 			data,
	// 			type: AssetType.ERC20,
	// 			value: withdrawEventData._amount,
	// 			tokenAddress: withdrawEventData.l1Token,
	// 			outgoingMessageState: outgoingMessageStates[i],
	// 			symbol: symbols[i],
	// 			decimals: decimals[i]
	// 		};

	// 		return eventDataPlus;
	// 	});
	// };

	// const getTokenWithdrawalsV2 = useCallback(
	// 	async (gatewayAddresses: string[], filter?: providers.Filter) => {
	// 		if (!provider) {
	// 			return;
	// 		}
	// 		const network = getAvailableNetworkByChainId((await provider.getNetwork()).chainId);

	// 		if (!network) {
	// 			return;
	// 		}

	// 		const l1NetworkID = network.isTestnet ? '4' : '1';
	// 		const walletAddress = await provider.getSigner().getAddress();
	// 		if (!walletAddress) {
	// 			return;
	// 		}

	// 		const latestGraphBlockNumber = await getL2GatewayGraphLatestBlockNumber(l1NetworkID);
	// 		console.log(`*** L2 gateway graph block number: ${latestGraphBlockNumber} ***`);

	// 		const startBlock = (filter && filter.fromBlock && +filter.fromBlock.toString()) || 0;

	// 		const pivotBlock = Math.max(latestGraphBlockNumber, startBlock);

	// 		const results = await getTokenWithdrawalsGraph(walletAddress, startBlock, pivotBlock, l1NetworkID);

	// 		const symbols = await Promise.all(results.map(resultData => getTokenSymbol(resultData.otherData.tokenAddress)));
	// 		const decimals = await Promise.all(
	// 			results.map(resultData => getTokenDecimals(resultData.otherData.tokenAddress))
	// 		);

	// 		const outgoingMessageStates = await Promise.all(
	// 			results.map(withdrawEventData => {
	// 				const { batchNumber, indexInBatch } = withdrawEventData.l2ToL1Event;
	// 				return getOutgoingMessageState(batchNumber, indexInBatch);
	// 			})
	// 		);

	// 		const oldTokenWithdrawals: L2ToL1EventResultPlus[] = results.map((resultsData, i) => ({
	// 			...resultsData.l2ToL1Event,
	// 			...resultsData.otherData,
	// 			outgoingMessageState: outgoingMessageStates[i],
	// 			symbol: symbols[i],
	// 			decimals: decimals[i]
	// 		}));

	// 		const recentTokenWithdrawals = await getTokenWithdrawals(gatewayAddresses, {
	// 			fromBlock: pivotBlock
	// 		});

	// 		return [...oldTokenWithdrawals, ...recentTokenWithdrawals];
	// 	},
	// 	[provider]
	// );

	const _initBridge = useCallback(async () => {
		try {
			const ethProvider = provider;
			if (!ethProvider) {
				console.error('no provider found');
				return;
			}

			const network = getAvailableNetworkByChainId((await provider.getNetwork()).chainId);

			if (!network) {
				return;
			}

			const l2NetworkId = network.isTestnet ? 421611 : 42161;
			const l2Network = await getL2Network(l2NetworkId);
			setErc20Bridger(new Erc20Bridger(l2Network));
			console.log('erc20 bridge set');
		} catch (e) {
			console.log('e is: ', e);
		}
	}, [provider]);

	const _handleL2ToL1Msg = async (msg: L2ToL1MessageReader, l2Provider: providers.Web3Provider) => {
		await msg.waitUntilOutboxEntryCreated();

		/**
		 * Now fetch the proof info we'll need in order to execute, or check execution
		 */
		const proofInfo = await msg.tryGetProof(l2Provider);
		console.log('proof info is: ', proofInfo);
	};

	const _getDevWithdrawals = async (
		provider: UndefinedOr<providers.Web3Provider>,
		erc20Bridger: UndefinedOr<Erc20Bridger>
	) => {
		console.log('_getDevWithdrawals');
		if (!erc20Bridger) {
			console.error('no erc20Bridger');
			return;
		}
		console.log('000');

		if (!provider) {
			return;
		}
		console.log('111');
		const network = getAvailableNetworkByChainId((await provider.getNetwork()).chainId);

		if (!network) {
			return;
		}
		console.log('222');

		// connected user is not on abritrum
		if (network.chainId !== 42161 && network.chainId !== 421611) {
			return;
		}
		console.log('333');

		const l1NetworkID = network.isTestnet ? '4' : '1';
		const l1Network = await getL1Network(+l1NetworkID);
		console.log('l1NetworkID: ', l1NetworkID);

		const latestGraphBlockNumber = await getL2GatewayGraphLatestBlockNumber(l1NetworkID);
		if (!latestGraphBlockNumber) {
			return;
		}
		console.log('latestGraphBlockNumber: ', latestGraphBlockNumber);

		// const startBlock = (filter && filter.fromBlock && +filter.fromBlock.toString()) || 0;
		// const startBlock = 0;
		// const pivotBlock = Math.max(latestGraphBlockNumber, startBlock);

		const gatewayAddress = getGatewayAddressByChainId(network.chainId);
		const walletAddress = await provider.getSigner().getAddress();
		console.log('444');
		// 11992804

		const fromBlock = network.isTestnet ? latestGraphBlockNumber - 100_000 : 2754993;

		const withdrawalEvents = await erc20Bridger.getL2WithdrawalEvents(
			// l2.signer.provider,
			provider,
			gatewayAddress,
			{ fromBlock: fromBlock, toBlock: 'latest' },
			undefined,
			walletAddress
		);
		console.log('gatewayWithdrawalsResultsNested are: ', withdrawalEvents);

		const l2Txns = await Promise.all(
			withdrawalEvents.map(withdrawEventData => provider.getTransactionReceipt(withdrawEventData.txHash))
		);

		// TODO -> use ENV variable for this
		// const l1Network = getAvailableNetworkByChainId(+l1NetworkID);
		// if (!l1Network) {
		// 	return;
		// }

		const l1Provider = new providers.JsonRpcProvider(getRpcUrl(l1Network));
		const l2Network = await getL2Network(network.chainId);

		const test = await Promise.all(
			l2Txns.map(txReceipt => {
				const rec = new L2TransactionReceipt(txReceipt);
				return rec.getL2ToL1Messages(l1Provider, l2Network);
			})
		);

		console.log('test is: ', test);

		const _statuses = await Promise.all(
			test[0].map(l2ToL1Msg => {
				// console.log('some status is: ', );
				// l2ToL1Msg.waitUntilOutboxEntryCreated();
				_handleL2ToL1Msg(l2ToL1Msg, provider);
			})
		);
		console.log('statuses are: ', _statuses);

		// const test2 = await Promise.all(
		// 	l2Txns.map(txReceipt => {
		// 		const rec = new L2TransactionReceipt(txReceipt);
		// 		return rec.getL2ToL1Events();
		// 		// _handleL2ToL1Msg(rec);
		// 	})
		// );

		// console.log('events is: ', test2);

		// const test = await Promise.all([...l2Txns]);
		// test.map(txReceipt => txReceipt.getL2ToL1Messages(l1Wallet, l2Network));

		// l2Txns.map(txReceipt => await txReceipt.getL2ToL1Messages(l1Wallet, l2Network));

		// const messages = await l2Receipt.getL2ToL1Messages(l1Wallet, l2Network)
		// console.log('messages is: ', messages);

		// const outgoingMessageStates = await Promise.all(
		// 	l2Txns.map(txReceipt => {
		// 		const l2TxReceipt = new L2TransactionReceipt(txReceipt);
		// 		// TODO: length != 1
		// 		const [{ batchNumber, indexInBatch }] = l2TxReceipt.getL2ToL1Events();
		// 		return getOutgoingMessageState(batchNumber, indexInBatch);
		// 	})
		// );
		// console.log('outgoing message states is: ', outgoingMessageStates);
	};

	// const gatewayWithdrawalsResultsNested = await Promise.all(
	// 	gatewayAddresses.map(gatewayAddress =>
	// 		erc20Bridger.getL2WithdrawalEvents(
	// 			l2.signer.provider,
	// 			gatewayAddress,
	// 			{ fromBlock: pivotBlock, toBlock: 'latest' },
	// 			undefined,
	// 			walletAddress
	// 		)
	// 	)
	// );
	// f

	// const _init = useCallback(async () => {
	// 	console.log('init hit...');
	// 	await _initBridge();
	// 	await _getDevWithdrawals();
	// }, [_initBridge, _getDevWithdrawals]);

	useEffect(() => {
		// _fetchDevTxsByAddress();
		// _init();
		_getDevWithdrawals(provider, erc20Bridger);
	}, [provider, erc20Bridger]);

	useEffect(() => {
		_initBridge();
	}, [_initBridge]);

	return (
		<BridgeContext.Provider value={{ deposit, withdraw, txReceipts, l1PendingTxs, l2PendingTxs }}>
			{children}
		</BridgeContext.Provider>
	);
};
