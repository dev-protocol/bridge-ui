import { UndefinedOr } from '@devprotocol/util-ts';
import { ethers } from 'ethers';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import erc20ABI from '../constants/erc20.abi.json';
import { getAvailableNetworkByChainId, getGatewayAddressByChainId } from '../utils/utils';

interface IFetchAllowanceParams {
	provider: ethers.providers.Web3Provider;
	tokenAddress: string;
	spenderAddress: string;
}

interface IApproveParams {
	tokenAddress: string;
	provider: ethers.providers.Web3Provider;
	gatewayAddress: string;
	amount?: ethers.BigNumber;
}

interface IRevokeParams {
	network: UndefinedOr<ethers.providers.Network>;
	provider: UndefinedOr<ethers.providers.Web3Provider>;
}

interface AllowanceContextInterface {
	allowance: ethers.BigNumber;
	setAllowance: React.Dispatch<React.SetStateAction<ethers.BigNumber>>;
	fetchAllowance(params: IFetchAllowanceParams): Promise<void>;
	approve(params: IApproveParams): Promise<boolean>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	revoke(params: IRevokeParams): Promise<void>;
}

export function useAllowanceContext(): AllowanceContextInterface {
	const [allowance, setAllowance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
	const [loading, setLoading] = useState(false);

	const fetchAllowance = async ({ provider, tokenAddress, spenderAddress }: IFetchAllowanceParams): Promise<void> => {
		const userAddress = await provider.getSigner().getAddress();
		const contract = new ethers.Contract(tokenAddress, erc20ABI, provider);
		setAllowance((await contract.allowance(userAddress, spenderAddress)) ?? ethers.BigNumber.from(0));
	};

	const approve = useCallback(
		async ({
			tokenAddress,
			provider,
			gatewayAddress,
			amount = ethers.constants.MaxUint256
		}: IApproveParams): Promise<boolean> => {
			setLoading(true);
			const signer = provider.getSigner();
			const userAddress = await signer.getAddress();
			const gasPrice = await provider.getGasPrice();
			const contract = new ethers.Contract(tokenAddress, erc20ABI, provider).connect(signer);
			const approval = await contract.approve(gatewayAddress, amount, {
				from: userAddress,
				gasPrice,
				gasLimit: '65000'
			});

			contract.on('Approval', (_owner, _spender, _value) => {
				fetchAllowance({ provider, tokenAddress, spenderAddress: gatewayAddress });
				setLoading(false);
			});

			return approval;
		},
		[]
	);

	// for testing
	const revoke = useCallback(
		async ({ network, provider }: IRevokeParams): Promise<void> => {
			let gatewayAddress = '';
			let tokenAddress = '';

			if (network) {
				const _validSourceNetwork = getAvailableNetworkByChainId(network.chainId);
				if (_validSourceNetwork) {
					gatewayAddress = getGatewayAddressByChainId(_validSourceNetwork.chainId);
					tokenAddress = _validSourceNetwork?.tokenAddress;
				} else {
					return;
				}
			} else {
				return;
			}

			if (provider) {
				try {
					await approve({
						gatewayAddress,
						tokenAddress,
						provider: provider,
						amount: ethers.BigNumber.from(0)
					});
				} catch (error: any) {
					console.log('an error has been CAUGHT: ', error);
				}
			}
		},
		[approve]
	);

	const web3ProviderContext = useMemo(
		() => ({
			allowance,
			setAllowance,
			loading,
			setLoading,
			fetchAllowance,
			approve,
			// for testing allowance
			revoke
		}),
		[allowance, setAllowance, approve, loading, setLoading, revoke]
	);
	return web3ProviderContext;
}

export const AllowanceContext = React.createContext<AllowanceContextInterface | null>(null);

export function useAllowance(): AllowanceContextInterface | null {
	return useContext(AllowanceContext);
}
