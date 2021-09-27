import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import DepositForm from './components/DepositForm';
import ConnectButton from './components/ConnectButton';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import erc20ABI from './constants/erc20.abi.json';
import { getAvailableNetworkByChainId } from './utils/utils';
import { useWeb3ProviderContext, WebProviderContext } from './context/web3ProviderContext';
import { AllowanceProvider } from './context/allowanceContext';

const App: React.FC = () => {
	const web3ProviderContext = useWeb3ProviderContext();
	const [currentChainId, setCurrentChainId] = useState<number | null>(null);
	const [devBalance, setDevBalance] = useState<BigNumber>();

	const updateChain = (chainId: number) => {
		setCurrentChainId(+chainId);
	};

	useEffect(() => {
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
		getDEVBalance();
	}, [web3ProviderContext]);

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
							<AllowanceProvider>
								<DepositForm currentChain={currentChainId} devBalance={devBalance} />
							</AllowanceProvider>
						</div>
					</div>
				</main>
			</div>
		</WebProviderContext.Provider>
	);
};

export default App;
