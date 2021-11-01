import React from 'react';
import { NavLink } from 'react-router-dom';

type NavLinkItemParams = {
	route: string;
	routeName: string;
};

const NavLinkItem: React.FC<NavLinkItemParams> = ({ route, routeName }) => {
	return (
		<li className="w-1/2 text-center text-gray-300 font-medium">
			<NavLink to={route} activeClassName="text-gray-500">
				{routeName}
			</NavLink>
		</li>
	);
};

export default NavLinkItem;
