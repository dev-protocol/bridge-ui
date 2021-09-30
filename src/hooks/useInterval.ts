import { useEffect, useRef } from 'react';

export const useInterval = (callback: Function, delay: number) => {
	const savedCallback = useRef<Function>();

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		async function tick() {
			if (savedCallback && typeof savedCallback.current === 'function') {
				await savedCallback.current();
			}
		}
		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
};
