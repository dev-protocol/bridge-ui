import React from 'react';

const Bridge: React.FC = () => {
	return (
		<article className="max-w-sm bg-white mx-auto my-12 p-8 rounded">
			<p className="pb-3">
				Bridge <strong>WDEV</strong> with Polygon Bridge
			</p>
			<p className="text-center">
				<a
					href="https://wallet.polygon.technology/bridge/"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-block text-center text-white px-3 py-2 rounded shadow border font-semibold bg-blue-600">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4 inline"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>{' '}
					Polygon Bridge
				</a>
			</p>
		</article>
	);
};

export default Bridge;
