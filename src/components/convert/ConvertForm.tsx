import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ArbitrumMainnet } from '../../constants/constants';
import {
	getAvailableNetworkByChainId,
	getGatewayAddressByChainId,
	getTargetNetworkOptions,
	isValidChain,
	patchNetworkName
} from '../../utils/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import { UndefinedOr } from '@devprotocol/util-ts';
import { AvailableNetwork } from '../../types/types';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { AllowanceContext } from '../../context/allowanceContext';
import Approval from '../approval/Approval';
import Convert from './Convert';

type DepositParams = {
	currentChain: number | null;
	devBalance: UndefinedOr<BigNumber>;
};

const DepositForm: React.FC<DepositParams> = ({ currentChain, devBalance }) => {
	const [amount, setAmount] = useState<BigNumber>();
	const [formValid, setFormValid] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [isValidNetwork, setIsValidNetwork] = useState(false);
	const [network, setNetwork] = useState<UndefinedOr<ethers.providers.Network>>();
	const [selectedTargetChain, setSelectedTargetChain] = useState(ArbitrumMainnet);
	const [targetChainOptions, setTargetChainOptions] = useState<AvailableNetwork[]>([]);
	const web3Context = useWeb3Provider();
	const { allowance, fetchAllowance } = useContext(AllowanceContext);

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
			setFormValid(devBalance && devBalance?.gte(newAmount) && +val > 0 ? true : false);
		} else {
			setFormValid(false);
		}
	};

	const getNetwork = useCallback(async (): Promise<void> => {
		const currentProvider = web3Context?.web3Provider;
		if (currentProvider) {
			const network = await currentProvider.getNetwork();

			setNetwork(patchNetworkName(network));

			const validSourceNetwork = getAvailableNetworkByChainId(network.chainId);
			if (validSourceNetwork) {
				const options = getTargetNetworkOptions({
					layer: validSourceNetwork.layer === 1 ? 2 : 1, // send to different layer
					isTestnet: validSourceNetwork.isTestnet
				});
				setTargetChainOptions(options);

				// update target network select to first option
				if (options.length > 0) {
					setSelectedTargetChain(options[0]);
				}
			} else {
				setTargetChainOptions([]);
			}
		}
	}, [web3Context?.web3Provider]);

	useEffect(() => {
		setIsValidNetwork(currentChain ? isValidChain(currentChain) : false);
		getNetwork();
		const getAllowance = async () => {
			const currentProvider = web3Context?.web3Provider;
			if (currentProvider && network) {
				const sourceNetwork = getAvailableNetworkByChainId(network.chainId);
				const gatewayAddress = getGatewayAddressByChainId(network.chainId);
				if (sourceNetwork) {
					await fetchAllowance({
						provider: currentProvider,
						tokenAddress: sourceNetwork?.tokenAddress,
						spenderAddress: gatewayAddress
					});
					// setAllowance(_allowance);
				}
			}
		};
		getAllowance();
	}, [currentChain, network, web3Context, getNetwork, fetchAllowance]);

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

	const setMax = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = devBalance ? ethers.utils.formatUnits(devBalance?.toString(), 18) : '0';
		updateAmount(amount);
	};

	// this is for testing allowance to reset
	// const onRevoke = async () => {
	// 	allowanceContext?.revoke({ network, provider: web3Context?.web3Provider });
	// };

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
								id="username"
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
				<div className="flex flex-col mb-4">
					<span className="block text-gray-700 text-sm font-bold flex-grow pr-2">From</span>

					<span className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full capitalize bg-gray-100">
						{network && network.chainId !== 1 && <>{network.name}</>}
						{(!network || (network && network.chainId === 1)) && <>Mainnet</>}
					</span>
				</div>
				<div className="text-center">
					<FontAwesomeIcon icon={faArrowDown} />
				</div>
				<span className="block text-gray-700 text-sm font-bold flex-grow pr-2">To</span>

				{targetChainOptions.length > 0 && (
					<select
						onChange={e => setSelectedTargetChain(JSON.parse(e.target.value) as AvailableNetwork)}
						className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-8">
						{targetChainOptions.map(network => (
							<option key={network.chainId} value={JSON.stringify(network)}>
								{network.name}
							</option>
						))}
					</select>
				)}

				{/** User not connected, only for UI purposes */}
				{targetChainOptions.length <= 0 && (
					<select className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-8">
						<option>Arbitrum</option>
					</select>
				)}

				{/** VALID -> Connected to compatible chain */}
				{isConnected &&
					network &&
					isValidNetwork &&
					((selectedTargetChain.layer == 2 && allowance.gt(0)) || selectedTargetChain.layer == 1) && (
						<Convert
							formValid={formValid}
							amount={amount}
							network={network}
							selectedTargetChain={selectedTargetChain}
						/>
					)}

				{/** Approval Required */}
				{allowance.isZero() && isConnected && selectedTargetChain.layer == 2 && (
					<Approval
						allowanceUpdated={() => console.log('allowance updated')}
						onError={e => console.log('an approval error occurred: ', e)}
						sourceNetwork={network}
					/>
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

export default DepositForm;
