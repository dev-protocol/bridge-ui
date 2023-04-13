import React from 'react';
import MainContent from '../main-content/MainContent';
import NavLinkItem from '../NavLinkItem';

type MainnetContainerParams = {
	children: React.ReactNode;
};

const MainnetContainer: React.FC<MainnetContainerParams> = ({ children }) => {
	return (
		<MainContent>
			<nav className="pb-8">
				<ul className="flex">
					<NavLinkItem route="/mainnet/swap" routeName="Swap" />
				</ul>
			</nav>
			{children}
		</MainContent>
	);
};

export default MainnetContainer;
