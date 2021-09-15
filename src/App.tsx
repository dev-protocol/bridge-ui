import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ethers, providers } from 'ethers';
import { UndefinedOr } from '@devprotocol/util-ts';
import Deposit from './deposit/Deposit';
import ConnectButton from './_components/ConnectButton';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import erc20ABI from './_const/erc20.abi.json';
import { getAvailableNetworkByChainId } from './_utils/utils';

interface Web3ContextInterface {
	web3Provider: UndefinedOr<providers.Web3Provider>;
	setWeb3Provider: React.Dispatch<React.SetStateAction<UndefinedOr<providers.Web3Provider>>>;
}

export function useWeb3ProviderContext(): Web3ContextInterface {
	const [web3Provider, setWeb3Provider] = useState<UndefinedOr<providers.Web3Provider>>(undefined);
	const web3ProviderContext = useMemo(
		() => ({
			web3Provider,
			setWeb3Provider
		}),
		[web3Provider, setWeb3Provider]
	);
	return web3ProviderContext;
}

const WebProviderContext = React.createContext<Web3ContextInterface | null>(null);

export function useWeb3Provider(): Web3ContextInterface | null {
	return useContext(WebProviderContext);
}

const App: React.FC = () => {
	const web3ProviderContext = useWeb3ProviderContext();
	const [currentChainId, setCurrentChainId] = useState<number | null>(null);
	const [devBalance, setDevBalance] = useState<BigNumber>();

	const updateChain = (chainId: number) => {
		setCurrentChainId(+chainId);
	};

	useEffect(() => {
		getDEVBalance();
	}, [web3ProviderContext]);

	const getDEVBalance = async () => {
		if (web3ProviderContext?.web3Provider) {
			const provider = web3ProviderContext?.web3Provider;
			const network = await provider.getNetwork();
			const chainId = await network?.chainId;
			const availableNetwork = getAvailableNetworkByChainId(chainId);
			if (availableNetwork) {
				const contract = new Contract(availableNetwork.tokenAddress, erc20ABI, provider);
				const address = await provider.getSigner().getAddress();
				const balance: BigNumber = await contract.balanceOf(address);
				setDevBalance(balance);
			}
		}
	};

	return (
		<WebProviderContext.Provider value={web3ProviderContext}>
			<div className="container mx-auto">
				<header className="flex justify-between p-4">
					<h1 className="text-white text-lg font-bold">
						<div className="w-12">
							<img src={process.env.PUBLIC_URL + 'devmark.png'} />
						</div>
						DEV Bridge
					</h1>
					<div className="flex flex-col items-end">
						<ConnectButton onChainChanged={updateChain} />
						{devBalance && (
							<span className="text-white">
								Balance: {ethers.utils.formatUnits(devBalance?.toString(), 18).toString()} DEV
							</span>
						)}
					</div>
				</header>
				<main>
					<div className="max-w-sm bg-white mx-auto my-12 p-8 rounded">
						<div className="pt-4">
							<Deposit currentChain={currentChainId} devBalance={devBalance} />
						</div>
					</div>
				</main>
			</div>
		</WebProviderContext.Provider>
	);
};

export default App;
