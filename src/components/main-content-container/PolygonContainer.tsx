import React from 'react';
import MainContent from '../main-content/MainContent';
import NavLinkItem from '../NavLinkItem';

type PolygonContainerParams = {
	children: React.ReactNode;
};

const PolygonContainer: React.FC<PolygonContainerParams> = ({ children }) => {
	return (
		<MainContent>
			<nav className="pb-8">
				<ul className="flex">
					<NavLinkItem route="/polygon/wrap" routeName="Wrap" />
					<NavLinkItem route="/polygon/unwrap" routeName="Unwrap" />
					<NavLinkItem route="/polygon/bridge" routeName="Bridge" />
				</ul>
			</nav>
			{children}
		</MainContent>
	);
};

export default PolygonContainer;
