import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	getAvailableL1NetworkByChainId,
	getAvailableNetworkByChainId,
	getGatewayAddressByChainId,
	getL1WrapperAddressByChainId,
	getTargetNetworkOptions,
	isNumberInput,
	isValidChain,
	isValidL1Chain,
	isValidL2Chain
} from '../../utils/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract, ethers, utils } from 'ethers';
import { UndefinedOr, whenDefined } from '@devprotocol/util-ts';
import { AvailableNetwork, Destination } from '../../types/types';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { AllowanceContext } from '../../context/allowanceContext';
import Approval from '../approval/Approval';
import Convert from './Convert';
import { L1_MAINNET_DEV_ADDRESS, RINKEBY_DEST_ARBITRUM } from '../../constants/constants';
import erc20ABI from '../../constants/erc20.abi.json';

type DepositParams = {
	currentChain: number | null;
	wDevBalance: UndefinedOr<BigNumber>;
	devBalance: UndefinedOr<BigNumber>;
	dest: Destination;
};

const DepositForm: React.FC<DepositParams> = ({ currentChain, wDevBalance, devBalance, dest }) => {
	const [amount, setAmount] = useState<BigNumber>();
	const [displayAmount, setDisplayAmount] = useState('');
	const [formValid, setFormValid] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [isValidNetwork, setIsValidNetwork] = useState(false);
	const [network, setNetwork] = useState<UndefinedOr<AvailableNetwork>>();
	const [selectedTargetChain, setSelectedTargetChain] = useState<AvailableNetwork>(RINKEBY_DEST_ARBITRUM);
	const [targetChainOptions, setTargetChainOptions] = useState<AvailableNetwork[]>([]);
	const [gatewayAddress, setGatewayAddress] = useState<UndefinedOr<string>>();
	const web3Context = useWeb3Provider();
	const { allowance, fetchAllowance } = useContext(AllowanceContext);

	const updateAmount = (val: string): void => {
		// empty string
		if (val.length <= 0) {
			setAmount(undefined);
			setFormValid(false);
			setDisplayAmount('');
			return;
		}

		if (!isNumberInput(val)) {
			return;
		}

		setDisplayAmount(val);

		// check if is valid number
		if (!isNaN(parseFloat(val)) && isFinite(+val)) {
			try {
				const units = utils.parseUnits(val);
				setAmount(units);

				if (!network?.chainId) {
					return;
				}

				/**
				 * Exchange L1 WDEV -> Arbitrum L2
				 */
				if (isValidL1Chain(network.chainId)) {
					setFormValid(wDevBalance && wDevBalance?.gte(units) && +val > 0 ? true : false);
				}

				/**
				 * Exchange L2 DEV -> L1
				 */
				if (isValidL2Chain(network.chainId)) {
					setFormValid(devBalance && devBalance?.gte(units) && +val > 0 ? true : false);
				}
			} catch (error) {
				setFormValid(false);
				console.log('err is: ', error);
			}
		} else {
			setFormValid(false);
		}
	};

	const getNetwork = useCallback(async (): Promise<void> => {
		const currentProvider = web3Context?.web3Provider;
		if (currentProvider) {
			const network = getAvailableNetworkByChainId(await (await currentProvider.getNetwork()).chainId);
			if (!network) {
				return;
			}

			setNetwork(network);

			const validSourceNetwork = getAvailableNetworkByChainId(network.chainId);
			if (validSourceNetwork) {
				const options =
					validSourceNetwork.layer === 2
						? // set manually since getAvailableNetworkByChainId returns 2 mainnets
						  [
								{
									name: 'Mainnet',
									chainId: 1,
									layer: 1,
									isTestnet: false,
									tokenAddress: L1_MAINNET_DEV_ADDRESS
								}
						  ]
						: // L2 options
						  getTargetNetworkOptions({
								layer: 2, // send to different layer
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
				const sourceL1Network = getAvailableL1NetworkByChainId(network.chainId, dest);
				const gatewayAddress = getGatewayAddressByChainId(network.chainId);
				setGatewayAddress(gatewayAddress);
				if (sourceNetwork) {
					await fetchAllowance({
						provider: currentProvider,
						tokenAddress: sourceL1Network ? sourceL1Network.wrapperTokenAddress : sourceNetwork?.tokenAddress,
						spenderAddress: gatewayAddress
					});
					// setAllowance(_allowance);
				}
			}
		};
		getAllowance();
	}, [currentChain, network, dest, web3Context, getNetwork, fetchAllowance]);

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

	const setMax = async (e: React.FormEvent) => {
		e.preventDefault();
		if (web3Context?.web3Provider) {
			const provider = web3Context?.web3Provider;
			const network = await provider.getNetwork();
			const address = await provider.getSigner().getAddress();

			const availableNetwork = getAvailableNetworkByChainId(network?.chainId);
			const l1AvailableNetwork = getAvailableL1NetworkByChainId(network?.chainId, dest);

			const contractAddress = l1AvailableNetwork
				? l1AvailableNetwork.wrapperTokenAddress
				: availableNetwork?.tokenAddress;
			const contract = whenDefined(contractAddress, x => new Contract(x, erc20ABI, provider));
			const balance = await whenDefined(contract, x => x.balanceOf(address));
			const amount = balance ? ethers.utils.formatUnits(balance?.toString(), 18) : '0';
			updateAmount(amount);
		}
	};

	// this is for testing allowance to reset
	// const onRevoke = async () => {
	// 	revoke({ network, provider: web3Context?.web3Provider });
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
								id="bridge-input"
								type="text"
								placeholder="Enter DEV amount"
								onChange={e => updateAmount(e.target.value)}
								value={displayAmount}
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
				{allowance.isZero() && isConnected && network && gatewayAddress && selectedTargetChain.layer == 2 && (
					<Approval
						allowanceUpdated={() => console.log('allowance updated')}
						onError={e => console.log('an approval error occurred: ', e)}
						sourceNetwork={network}
						tokenAddress={getL1WrapperAddressByChainId(network?.chainId)}
						spenderAddress={gatewayAddress}
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
