import { ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import wrappableABI from '../constants/wrappable.abi.json';

interface IWrapParams {
	tokenAddress: string;
	provider: ethers.providers.Web3Provider;
	amount?: ethers.BigNumber;
	txSuccess(): void;
}

interface IUnwrapParams {
	tokenAddress: string;
	provider: ethers.providers.Web3Provider;
	amount?: ethers.BigNumber;
}

interface WrappableContextInterface {
	wrap(params: IWrapParams): Promise<boolean>;
	unwrap(params: IUnwrapParams): Promise<boolean>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const wrappable: WrappableContextInterface = {
	wrap: async () => false,
	unwrap: async () => false,
	loading: false,
	setLoading: () => {}
};

export const WrappableContext = React.createContext(wrappable);

export const WrappableProvider: React.FC = ({ children }) => {
	const [loading, setLoading] = useState(false);

	const wrap = useCallback(
		async ({
			tokenAddress,
			provider,
			txSuccess,
			amount = ethers.constants.MaxUint256
		}: IWrapParams): Promise<boolean> => {
			setLoading(true);
			const signer = provider.getSigner();
			const userAddress = await signer.getAddress();
			const gasPrice = await provider.getGasPrice();
			const contract = new ethers.Contract(tokenAddress, wrappableABI, provider).connect(signer);
			const tx = await contract.wrap(amount, {
				from: userAddress,
				gasPrice
			});

			tx.wait().then(() => {
				setLoading(false);
				txSuccess();
			});

			return tx;
		},
		[]
	);

	const unwrap = useCallback(
		async ({
			tokenAddress,
			provider,
			txSuccess,
			amount = ethers.constants.MaxUint256
		}: IWrapParams): Promise<boolean> => {
			setLoading(true);
			const signer = provider.getSigner();
			const userAddress = await signer.getAddress();
			const gasPrice = await provider.getGasPrice();
			const contract = new ethers.Contract(tokenAddress, wrappableABI, provider).connect(signer);
			const tx = await contract.unwrap(amount, {
				from: userAddress,
				gasPrice
			});

			tx.wait().then(() => {
				setLoading(false);
				txSuccess();
			});

			return tx;
		},
		[]
	);

	return (
		<WrappableContext.Provider value={{ wrap, unwrap, loading, setLoading }}>{children}</WrappableContext.Provider>
	);
};
