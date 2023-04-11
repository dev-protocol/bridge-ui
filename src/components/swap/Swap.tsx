import React, { useEffect, useState } from 'react';
import { SwapWidget } from '@uniswap/widgets';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { UndefinedOr } from '@devprotocol/util-ts';
import { providers } from 'ethers';

const SwapComponent: React.FC = () => {
	const web3Context = useWeb3Provider();
	const [currentProvider, setCurrentProvider] = useState<UndefinedOr<providers.Provider>>();

	useEffect(() => {
		if (web3Context?.web3Provider) {
			setCurrentProvider(web3Context?.web3Provider);
		}
	}, [web3Context?.web3Provider]);

	return (
		<div className="flex flex-col items-center justify-center w-full h-full">
			<SwapWidget provider={currentProvider ?? undefined} jsonRpcUrlMap={[]} />
		</div>
	);
};

export default SwapComponent;
