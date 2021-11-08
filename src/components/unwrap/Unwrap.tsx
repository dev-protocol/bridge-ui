import React, { useState, useEffect, useCallback, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers, utils } from 'ethers';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { UndefinedOr } from '@devprotocol/util-ts';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { getAvailableL1NetworkByChainId, isValidChain, isValidL1Chain } from '../../utils/utils';
import ConfirmUnwrapModal from './ConfirmUnwrapModal';
import { L1Network } from '../../types/types';
import { WrappableContext } from '../../context/wrappableContext';

type UnwrapParams = {
	wDevBalance: BigNumber;
	currentChain: number | null;
	refreshBalances(): void;
};

const Unwrap: React.FC<UnwrapParams> = ({ wDevBalance, currentChain, refreshBalances }) => {
	const [amount, setAmount] = useState<BigNumber>();
	const [formValid, setFormValid] = useState(false);
	const [network, setNetwork] = useState<UndefinedOr<L1Network>>();
	const [isConnected, setIsConnected] = useState(false);
	const web3Context = useWeb3Provider();
	const [isValidNetwork, setIsValidNetwork] = useState(false);
	const { loading } = useContext(WrappableContext);
	const [displayModal, setDisplayModal] = useState(false);

	const getNetwork = useCallback(async (): Promise<void> => {
		const currentProvider = web3Context?.web3Provider;
		if (currentProvider) {
			const network = getAvailableL1NetworkByChainId(await (await currentProvider.getNetwork()).chainId);
			setNetwork(network);
		}
	}, [web3Context?.web3Provider]);

	const updateAmount = (val: string): void => {
		// empty string
		if (val.length <= 0) {
			setAmount(undefined);
			setFormValid(false);
			return;
		}

		// check if is valid number
		if (!isNaN(parseFloat(val)) && isFinite(+val)) {
			const newAmount = BigNumber.from(+val);
			setAmount(newAmount);
			setFormValid(wDevBalance && wDevBalance?.gte(utils.parseUnits(val)) && +val > 0 ? true : false);
		} else {
			setFormValid(false);
		}
	};

	const setMax = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = wDevBalance ? ethers.utils.formatUnits(wDevBalance?.toString(), 18) : '0';
		updateAmount(amount);
	};

	const onTxSuccess = () => {
		updateAmount('');
		refreshBalances();
	};

	useEffect(() => {
		setIsValidNetwork(currentChain ? isValidL1Chain(currentChain) : false);
		getNetwork();
	}, [currentChain, network, web3Context, getNetwork]);

	useEffect(() => {
		const getProvider = async (): Promise<void> => {
			const currentProvider = web3Context?.web3Provider;
			if (currentProvider) {
				const network = await currentProvider.getNetwork();
				getNetwork();
				const accounts = await currentProvider.listAccounts();
				setIsConnected(accounts.length > 0);
				setIsValidNetwork(isValidChain(network.chainId));
			} else {
				setIsConnected(false);
			}
		};

		getProvider();
	}, [web3Context, getNetwork]);

	return (
		<div>
			{/** this is for testing allowance to reset */}
			{/* <button onClick={onRevoke}>revoke</button> */}

			<div>
				<div className="mb-4">
					<div className="flex w-full items-end">
						<label className="block text-gray-700 text-sm font-bold flex-grow pr-2" htmlFor="username">
							Amount
							<input
								className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
								id="unwrap-input"
								type="text"
								placeholder="Enter DEV amount"
								onChange={e => updateAmount(e.target.value)}
								value={amount ? amount?.toString() : ''}
							/>
						</label>
						<button
							onClick={setMax}
							className="text-center text-white px-2 py-1 rounded shadow border font-semibold bg-blue-600">
							MAX
						</button>
					</div>
					<div className="h-4">
						{!formValid && <span className="text-xs text-red-600">*Please enter a valid amount of DEV to send</span>}
					</div>
				</div>

				<div className="text-center">
					<FontAwesomeIcon icon={faArrowDown} />
				</div>
				<div className="flex flex-col mb-8">
					<span className="block text-gray-700 text-sm font-bold flex-grow pr-2">To</span>

					<div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full capitalize bg-gray-100">
						{network && network.chainId !== 1 && <> {network.name} </>}
						{(!network || (network && network.chainId === 1)) && <> Mainnet </>}
						DEV
					</div>
				</div>

				{/** VALID -> Connected to compatible chain */}
				{isConnected && network && (
					<button
						className={`w-full text-white active:bg-blue-700 font-bold text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-28 h-14 flex justify-center items-center ${
							formValid ? 'bg-blue-600' : 'bg-gray-400'
						}`}
						onClick={_ => setDisplayModal(true)}
						disabled={!formValid}>
						{loading && (
							<div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
						)}

						{!loading && <span>Unwrap</span>}
					</button>
				)}

				{displayModal && amount && network && (
					<ConfirmUnwrapModal
						setDisplayModal={setDisplayModal}
						amount={amount}
						tokenAddress={network?.wrapperTokenAddress}
						txSuccess={onTxSuccess}></ConfirmUnwrapModal>
				)}

				{/** INVALID -> Connected to incompatible chain */}
				{isConnected && !isValidNetwork && (
					<div>
						<button
							className={`text-center w-full text-white py-3 rounded shadow border font-semibold bg-gray-400 cursor-not-allowed h-14`}
							disabled={true}>
							Invalid Network
						</button>
					</div>
				)}

				{/** INVALID -> Wallet not connected */}
				{!isConnected && (
					<div>
						<button
							className={`text-center w-full text-white py-3 rounded shadow border font-semibold bg-gray-400 cursor-not-allowed h-14`}
							disabled={true}>
							Connect Wallet
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Unwrap;
