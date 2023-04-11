import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ConnectButton from './components/ConnectButton';
import { BigNumber } from '@ethersproject/bignumber';
import { getAvailableNetworkByChainId } from './utils/utils';
import { useWeb3ProviderContext, WebProviderContext } from './context/web3ProviderContext';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import SwitchNetworks from './components/SwitchNetworks';
import { UndefinedOr, whenDefined } from '@devprotocol/util-ts';
import NetworkContainer from './components/network-container/NetworkContainer';
import { AvailableNetwork } from './types/types';

export type Balances = { dev: UndefinedOr<BigNumber>; wdev: UndefinedOr<BigNumber> };

const App: React.FC = () => {
	const web3ProviderContext = useWeb3ProviderContext();
	const [currentChainId, setCurrentChainId] = useState<number | null>(null);
	const [currentConnectedNetwork, setConnectedNetwork] = useState<AvailableNetwork['name']>();
	const [balances, setBalances] = useState<Balances>();

	const updateChain = (chainId: number) => {
		setCurrentChainId(+chainId);
	};

	useEffect(() => {
		const network = whenDefined(currentChainId, id => getAvailableNetworkByChainId(id));
		setConnectedNetwork(network?.name);
	}, [currentChainId]);

	return (
		<WebProviderContext.Provider value={web3ProviderContext}>
			<div className="container mx-auto">
				<header className="flex justify-between p-4">
					<h1 className="text-white text-lg font-bold">
						<div className="w-12">
							<img src="/devmark.png" />
						</div>
						DEV Bridge
					</h1>
					<div className="flex flex-col items-end gap-2">
						<ConnectButton onChainChanged={updateChain} />
						{currentChainId ? (
							currentConnectedNetwork ? (
								<span className="rounded-full bg-green-600 text-white px-3">{currentConnectedNetwork}</span>
							) : (
								<span className="rounded-full bg-red-600 text-white px-3">Invalid network</span>
							)
						) : (
							''
						)}
						{balances && balances.dev && balances.wdev && (
							<div className="text-white text-right">
								<span>DEV: {ethers.utils.formatUnits(balances.dev.toString() ?? 0, 18).toString()}</span>
								<br />
								<span>Wrapped DEV: {ethers.utils.formatUnits(balances.wdev.toString() ?? 0, 18).toString()}</span>
							</div>
						)}
					</div>
				</header>
				<main>
					<Router>
						<Redirect exact from="/" to="/polygon" />
						<Route path="/:network">
							<SwitchNetworks />
							<NetworkContainer onChangeBalances={setBalances} currentChain={currentChainId} />
						</Route>
					</Router>
				</main>
			</div>
		</WebProviderContext.Provider>
	);
};

export default App;
