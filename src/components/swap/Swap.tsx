import React from 'react';
// import { SwapWidget } from '@uniswap/widgets';
// import '@uniswap/widgets/fonts.css';

import { SwapWidget } from '@uniswap/widgets/dist/index.js';
import '@uniswap/widgets/dist/fonts.css';

const SwapComponent: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center w-full h-full">
			<div className="Uniswap">
				<SwapWidget />
			</div>
		</div>
	);
};

export default SwapComponent;
