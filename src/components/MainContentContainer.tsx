import React from 'react';
import NavLinkItem from './NavLinkItem';

type MainContentContainerParams = {
	children: React.ReactNode;
};

const MainContentContainer: React.FC<MainContentContainerParams> = ({ children }) => {
	return (
		<div className="max-w-sm bg-white mx-auto my-12 p-8 pt-2 rounded">
			<div className="pt-4">
				<nav className="pb-8">
					<ul className="flex">
						<NavLinkItem route="/wrap" routeName="Wrap" />
						<NavLinkItem route="/unwrap" routeName="Unwrap" />
						<NavLinkItem route="/bridge" routeName="L2 Bridge" />
					</ul>
				</nav>
				{children}
			</div>
		</div>
	);
};

export default MainContentContainer;
