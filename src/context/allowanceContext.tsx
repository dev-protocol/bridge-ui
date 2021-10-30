import { UndefinedOr } from '@devprotocol/util-ts';
import { ethers } from 'ethers';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import erc20ABI from '../constants/erc20.abi.json';
import { getAvailableNetworkByChainId, getGatewayAddressByChainId } from '../utils/utils';

interface IApproveParams {
	tokenAddress: string;
	provider: ethers.providers.Web3Provider;
	spenderAddress: string;
	amount?: ethers.BigNumber;
}

interface IRevokeParams {
	network: UndefinedOr<ethers.providers.Network>;
	provider: UndefinedOr<ethers.providers.Web3Provider>;
}

interface IFetchAllowanceParams {
	provider: ethers.providers.Web3Provider;
	tokenAddress: string;
	spenderAddress: string;
}

interface AllowanceContextInterface {
	allowance: ethers.BigNumber;
	setAllowance: Dispatch<SetStateAction<ethers.BigNumber>>;
	approve(params: IApproveParams): Promise<boolean>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	revoke(params: IRevokeParams): Promise<void>;
	fetchAllowance(params: IFetchAllowanceParams): Promise<void>;
}

const allowance: AllowanceContextInterface = {
	allowance: ethers.BigNumber.from(0),
	setAllowance: () => {},
	approve: async () => false,
	loading: false,
	setLoading: () => {},
	revoke: async () => {},
	fetchAllowance: async (_params: IFetchAllowanceParams) => {}
};

export const AllowanceContext = React.createContext(allowance);

export const AllowanceProvider: React.FC = ({ children }) => {
	const [allowance, setAllowance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
	const [loading, setLoading] = useState(false);

	const fetchAllowance = useCallback(
		async ({ provider, tokenAddress, spenderAddress }: IFetchAllowanceParams): Promise<void> => {
			const userAddress = await provider.getSigner().getAddress();
			const contract = new ethers.Contract(tokenAddress, erc20ABI, provider);
			setAllowance((await contract.allowance(userAddress, spenderAddress)) ?? ethers.BigNumber.from(0));
		},
		[setAllowance]
	);

	const approve = useCallback(
		async ({
			tokenAddress,
			provider,
			spenderAddress,
			amount = ethers.constants.MaxUint256
		}: IApproveParams): Promise<boolean> => {
			setLoading(true);
			const signer = provider.getSigner();
			const userAddress = await signer.getAddress();
			const gasPrice = await provider.getGasPrice();
			const contract = new ethers.Contract(tokenAddress, erc20ABI, provider).connect(signer);
			const approval = await contract.approve(spenderAddress, amount, {
				from: userAddress,
				gasPrice,
				gasLimit: '65000'
			});

			contract.on('Approval', async (_owner, _spender, _value) => {
				await fetchAllowance({ provider, tokenAddress, spenderAddress: spenderAddress });

				setLoading(false);
			});

			return approval;
		},
		[fetchAllowance]
	);

	// for testing
	const revoke = useCallback(
		async ({ network, provider }: IRevokeParams): Promise<void> => {
			let spenderAddress = '';
			let tokenAddress = '';

			if (network) {
				const _validSourceNetwork = getAvailableNetworkByChainId(network.chainId);
				if (_validSourceNetwork) {
					spenderAddress = getGatewayAddressByChainId(_validSourceNetwork.chainId);
					tokenAddress = _validSourceNetwork?.tokenAddress;
				} else {
					return;
				}
			} else {
				return;
			}

			if (provider) {
				await approve({
					spenderAddress,
					tokenAddress,
					provider: provider,
					amount: ethers.BigNumber.from(0)
				});
			}
		},
		[approve]
	);

	return (
		<AllowanceContext.Provider
			value={{ allowance, setAllowance, loading, setLoading, revoke, approve, fetchAllowance }}>
			{children}
		</AllowanceContext.Provider>
	);
};
