import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import DepositForm from './components/convert/ConvertForm';
import ConnectButton from './components/ConnectButton';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import erc20ABI from './constants/erc20.abi.json';
import { getAvailableL1NetworkByChainId, getAvailableNetworkByChainId } from './utils/utils';
import { useWeb3ProviderContext, WebProviderContext } from './context/web3ProviderContext';
import { AllowanceProvider } from './context/allowanceContext';
import { WrappableProvider } from './context/wrappableContext';
import { BridgeProvider } from './context/bridgeContext';
import TransactionsTable from './components/transactions-table/TransactionsTable';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Wrap from './components/wrap/Wrap';
import MainContentContainer from './components/MainContentContainer';
import Unwrap from './components/unwrap/Unwrap';

const App: React.FC = () => {
	const web3ProviderContext = useWeb3ProviderContext();
	const [currentChainId, setCurrentChainId] = useState<number | null>(null);
	const [devBalance, setDevBalance] = useState<BigNumber>();
	const [wDevBalance, setWDevBalance] = useState<BigNumber>();

	const updateChain = (chainId: number) => {
		setCurrentChainId(+chainId);
	};

	const getDEVBalance = useCallback(async () => {
		if (web3ProviderContext?.web3Provider) {
			const provider = web3ProviderContext?.web3Provider;
			const network = await provider.getNetwork();
			const chainId = await network?.chainId;
			const address = await provider.getSigner().getAddress();

			const availableNetwork = getAvailableNetworkByChainId(chainId);

			// is L1 or L2 compliant network
			if (availableNetwork) {
				const devContract = new Contract(availableNetwork.tokenAddress, erc20ABI, provider);
				const devBalance: BigNumber = await devContract.balanceOf(address);
				setDevBalance(devBalance);
			}

			// is L1 network
			const l1AvailableNetwork = getAvailableL1NetworkByChainId(chainId);
			if (l1AvailableNetwork) {
				const arbWrapperContract = new Contract(l1AvailableNetwork.wrapperTokenAddress, erc20ABI, provider);
				const wDevBalance = await arbWrapperContract.balanceOf(address);
				setWDevBalance(wDevBalance);
			}
		}
	}, [web3ProviderContext?.web3Provider]);

	useEffect(() => {
		getDEVBalance();
	}, [web3ProviderContext, getDEVBalance]);

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
						{devBalance && wDevBalance && (
							<div className="text-white text-right">
								<span>DEV: {ethers.utils.formatUnits(devBalance?.toString(), 18).toString()}</span>
								<br />
								<span>Wrapped DEV: {ethers.utils.formatUnits(wDevBalance?.toString(), 18).toString()}</span>
							</div>
						)}
					</div>
				</header>
				<main>
					<BridgeProvider provider={web3ProviderContext?.web3Provider}>
						<Router>
							<Switch>
								<Redirect exact from="/" to="/wrap" />
								<Route path="/wrap">
									<MainContentContainer>
										<AllowanceProvider>
											<WrappableProvider>
												<Wrap
													devBalance={devBalance ?? BigNumber.from(0)}
													currentChain={currentChainId}
													refreshBalances={getDEVBalance}
												/>
											</WrappableProvider>
										</AllowanceProvider>
									</MainContentContainer>
								</Route>
								<Route path="/unwrap">
									<MainContentContainer>
										<WrappableProvider>
											<Unwrap
												wDevBalance={wDevBalance ?? BigNumber.from(0)}
												currentChain={currentChainId}
												refreshBalances={getDEVBalance}
											/>
										</WrappableProvider>
									</MainContentContainer>
								</Route>
								<Route path="/bridge">
									<AllowanceProvider>
										<MainContentContainer>
											<DepositForm currentChain={currentChainId} wDevBalance={wDevBalance} />
										</MainContentContainer>
										<TransactionsTable />
									</AllowanceProvider>
								</Route>
							</Switch>
						</Router>
						{/* </div>
						</div> */}
					</BridgeProvider>
				</main>
			</div>
		</WebProviderContext.Provider>
	);
};

export default App;
