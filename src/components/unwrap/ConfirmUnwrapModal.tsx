import React, { useContext } from 'react';
import { utils } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { WrappableContext } from '../../context/wrappableContext';
import { useWeb3Provider } from '../../context/web3ProviderContext';

type ConfirmUnwrapModalParams = {
	amount: BigNumber;
	setDisplayModal: React.Dispatch<React.SetStateAction<boolean>>;
	tokenAddress: string;
	txSuccess(): void;
};

const ConfirmUnwrapModal: React.FC<ConfirmUnwrapModalParams> = ({
	amount,
	tokenAddress,
	setDisplayModal,
	txSuccess
}) => {
	const { unwrap, loading, setLoading } = useContext(WrappableContext);
	const web3Context = useWeb3Provider();

	const submitUnwrap = async (e: React.FormEvent) => {
		e.preventDefault();
		const currentProvider = web3Context?.web3Provider;
		if (currentProvider) {
			try {
				const success = await unwrap({
					amount,
					tokenAddress,
					provider: currentProvider,
					txSuccess
				});
				if (success) {
					setDisplayModal(false);
				} else {
					setLoading(false);
				}
			} catch (error: any) {
				setLoading(false);
			}
		}
	};

	return (
		<div>
			<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
				<div className="relative w-auto my-6 mx-auto max-w-sm">
					<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
						<div>
							<div className="relative p-6 flex-auto font-semibold">
								Converting <span className="text-bold">{amount ? utils.formatEther(amount) : 0} Wrapped DEV</span>
								<div>
									<FontAwesomeIcon icon={faArrowDown} />
								</div>
								<div>Native DEV</div>
							</div>

							<div className="flex flex-col p-6 pt-4 border-t border-solid border-blueGray-200 rounded-b">
								<div className="text-sm mb-4">
									<span className="font-normal">
										<b>Unwrapping</b> to DEV converts the Arbitrum compatible wrapped WDEV token to the native DEV
										token. You wrap again to use with Arbitrum anytime.
									</span>
								</div>
								<div className="flex items-center justify-end">
									<button
										className="text-gray-400 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
										type="button"
										onClick={() => setDisplayModal(false)}>
										Cancel
									</button>

									<button
										className="bg-blue-600 text-white active:bg-blue-700 font-bold text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-28 flex justify-center"
										type="button"
										onClick={submitUnwrap}>
										{loading && (
											<div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
										)}

										{!loading && <span>Convert</span>}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="opacity-25 fixed inset-0 z-40 bg-black" />
		</div>
	);
};

export default ConfirmUnwrapModal;
