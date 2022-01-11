import React from 'react';
import MainContent from '../main-content/MainContent';
import NavLinkItem from '../NavLinkItem';

type ArbitrumContainerParams = {
	children: React.ReactNode;
};

const ArbitrumContainer: React.FC<ArbitrumContainerParams> = ({ children }) => {
	return (
		<MainContent>
			<nav className="pb-8">
				<ul className="flex">
					<NavLinkItem route="/arbitrum/wrap" routeName="Wrap" />
					<NavLinkItem route="/arbitrum/unwrap" routeName="Unwrap" />
					<NavLinkItem route="/arbitrum/bridge" routeName="L2 Bridge" />
				</ul>
			</nav>
			{children}
		</MainContent>
	);
};

export default ArbitrumContainer;
