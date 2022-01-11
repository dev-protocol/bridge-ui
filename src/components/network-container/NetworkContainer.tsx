import React, { useCallback, useEffect, useState } from 'react';
import DepositForm from '../convert/ConvertForm';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import erc20ABI from '../../constants/erc20.abi.json';
import { getAvailableL1NetworkByChainId, getAvailableNetworkByChainId } from '../../utils/utils';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { AllowanceProvider } from '../../context/allowanceContext';
import { WrappableProvider } from '../../context/wrappableContext';
import { BridgeProvider as ArbitrumBridgeContext } from '../../context/arbitrumBridgeContext';
import TransactionsTable from '../arbitrum-transactions-table/TransactionsTable';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import Wrap from '../wrap/Wrap';
import ArbitrumContainer from '../main-content-container/ArbitrumContainer';
import Unwrap from '../unwrap/Unwrap';
import PolygonContainer from '../main-content-container/PolygonContainer';
import { UndefinedOr, whenDefined } from '@devprotocol/util-ts';
import { Destination } from '../../types/types';
import Bridge from '../_network/polygon/Bridge';

type NetworkContainerParams = {
	currentChain: number | null;
	onChangeBalances: React.Dispatch<{ dev: UndefinedOr<BigNumber>; wdev: UndefinedOr<BigNumber> }>;
};

const NetworkContainer: React.FC<NetworkContainerParams> = ({
	currentChain,
	onChangeBalances
}: NetworkContainerParams) => {
	const web3ProviderContext = useWeb3Provider();
	const [devBalance, setDevBalance] = useState<BigNumber>();
	const [wDevBalance, setWDevBalance] = useState<BigNumber>();
	const { network } = useParams<{ network: Destination }>();

	const getDEVBalance = useCallback(async () => {
		if (currentChain !== null && web3ProviderContext?.web3Provider) {
			const provider = web3ProviderContext.web3Provider;
			const address = await provider.getSigner().getAddress();

			const availableNetwork = getAvailableNetworkByChainId(currentChain);
			const l1AvailableNetwork = getAvailableL1NetworkByChainId(currentChain, network);

			const devContract = whenDefined(availableNetwork, net => new Contract(net.tokenAddress, erc20ABI, provider));
			const _devBalance: BigNumber = await whenDefined(devContract, dev => dev.balanceOf(address));
			const wdevContract = whenDefined(
				l1AvailableNetwork,
				net => new Contract(net.wrapperTokenAddress, erc20ABI, provider)
			);
			const _wDevBalance = await whenDefined(wdevContract, wdev => wdev.balanceOf(address));
			setDevBalance(_devBalance);
			setWDevBalance(_wDevBalance);
			onChangeBalances({ dev: _devBalance, wdev: _wDevBalance });
		}
	}, [currentChain, network, onChangeBalances, web3ProviderContext?.web3Provider]);

	useEffect(() => {
		getDEVBalance();
	}, [currentChain, getDEVBalance, web3ProviderContext]);

	return (
		<>
			<Route path="/arbitrum">
				<ArbitrumBridgeContext provider={web3ProviderContext?.web3Provider} refreshBalances={getDEVBalance}>
					<Switch>
						<Redirect exact from="/arbitrum" to="/arbitrum/wrap" />
						<Route path="/arbitrum/wrap">
							<ArbitrumContainer>
								<AllowanceProvider>
									<WrappableProvider>
										<Wrap
											devBalance={devBalance ?? BigNumber.from(0)}
											currentChain={currentChain}
											refreshBalances={getDEVBalance}
											dest="arbitrum"
										/>
									</WrappableProvider>
								</AllowanceProvider>
							</ArbitrumContainer>
						</Route>
						<Route path="/arbitrum/unwrap">
							<ArbitrumContainer>
								<WrappableProvider>
									<Unwrap
										wDevBalance={wDevBalance ?? BigNumber.from(0)}
										currentChain={currentChain}
										refreshBalances={getDEVBalance}
										from="arbitrum"
									/>
								</WrappableProvider>
							</ArbitrumContainer>
						</Route>
						<Route path="/arbitrum/bridge">
							<AllowanceProvider>
								<ArbitrumContainer>
									<DepositForm currentChain={currentChain} wDevBalance={wDevBalance} dest="arbitrum" />
								</ArbitrumContainer>
								<TransactionsTable />
							</AllowanceProvider>
						</Route>
					</Switch>
				</ArbitrumBridgeContext>
			</Route>
			<Route path="/polygon">
				<Switch>
					<Redirect exact from="/polygon" to="/polygon/wrap" />
					<Route path="/polygon/wrap">
						<PolygonContainer>
							<AllowanceProvider>
								<WrappableProvider>
									<Wrap
										devBalance={devBalance ?? BigNumber.from(0)}
										currentChain={currentChain}
										refreshBalances={getDEVBalance}
										dest="polygon"
									/>
								</WrappableProvider>
							</AllowanceProvider>
						</PolygonContainer>
					</Route>
					<Route path="/polygon/unwrap">
						<PolygonContainer>
							<WrappableProvider>
								<Unwrap
									wDevBalance={wDevBalance ?? BigNumber.from(0)}
									currentChain={currentChain}
									refreshBalances={getDEVBalance}
									from="polygon"
								/>
							</WrappableProvider>
						</PolygonContainer>
					</Route>
					<Route path="/polygon/bridge">
						<PolygonContainer>
							<WrappableProvider>
								<Bridge />
							</WrappableProvider>
						</PolygonContainer>
					</Route>
				</Switch>
			</Route>
		</>
	);
};

export default NetworkContainer;
