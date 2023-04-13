import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

const classNamesForNavItem = (current: boolean) =>
	`relative text-center px-4 py-2 rounded-md ${
		current
			? 'shadow bg-blue-600 text-white font-bold focus:outline-none focus:border-indigo-500'
			: 'opacity-50 hover:bg-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
	}`;

const SwitchNetworks: React.FC = () => {
	const { network } = useParams<{ network?: string }>();

	return (
		<nav className="max-w-sm bg-white mx-auto my-12 p-4 rounded z-0 grid grid-cols-3 gap-1 shadow-sm rounded-md">
			<NavLink to="/polygon" className={classNamesForNavItem(network === 'polygon')}>
				Polygon
			</NavLink>
			<NavLink to="/arbitrum" className={classNamesForNavItem(network === 'arbitrum')}>
				Arbitrum
			</NavLink>
			<NavLink to="/mainnet" className={classNamesForNavItem(network === 'mainnet')}>
				Mainnet
			</NavLink>
		</nav>
	);
};

export default SwitchNetworks;
