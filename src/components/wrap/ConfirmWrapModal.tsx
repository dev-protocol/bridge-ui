import React, { useContext } from 'react';
import { utils } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { AllowanceContext } from '../../context/allowanceContext';
import { WrappableContext } from '../../context/wrappableContext';
import { useWeb3Provider } from '../../context/web3ProviderContext';

type ConfirmWrapModalParams = {
	amount: BigNumber;
	setDisplayModal: React.Dispatch<React.SetStateAction<boolean>>;
	tokenAddress: string;
	onError(message: string): void;
	txSuccess(): void;
};

const ConfirmWrapModal: React.FC<ConfirmWrapModalParams> = ({
	amount,
	tokenAddress,
	setDisplayModal,
	onError,
	txSuccess
}) => {
	const { allowance } = useContext(AllowanceContext);
	const { wrap, loading, setLoading } = useContext(WrappableContext);
	const web3Context = useWeb3Provider();

	const submitWrap = async (e: React.FormEvent) => {
		e.preventDefault();
		const currentProvider = web3Context?.web3Provider;
		const _amount = utils.parseEther(amount.toString());
		if (currentProvider) {
			try {
				const success = await wrap({
					amount: _amount,
					tokenAddress,
					provider: currentProvider,
					txSuccess
				});
				if (success) {
					setDisplayModal(false);
				} else {
					onError('An error occurred.');
					setLoading(false);
				}
			} catch (error: any) {
				setLoading(false);
				onError(error.message);
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
								Converting <span className="text-bold">{amount ? amount.toString() : 0} DEV</span>
								<div>
									<FontAwesomeIcon icon={faArrowDown} />
								</div>
								<div>Arbitrum Compatible Wrapped DEV</div>
							</div>

							<div className="flex flex-col p-6 pt-4 border-t border-solid border-blueGray-200 rounded-b">
								<div className="text-sm mb-4">
									<span className="font-normal">
										<b>Wrapping</b> to WDEV creates a Arbitrum compatible token that can be bridged to Arbitrum Layer 2.
										You can unwrap to native DEV any time.
									</span>
								</div>
								<div className="flex items-center justify-end">
									<button
										className="text-gray-400 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
										type="button"
										onClick={() => setDisplayModal(false)}>
										Cancel
									</button>

									{allowance.gt(0) && (
										<button
											className="bg-blue-600 text-white active:bg-blue-700 font-bold text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-28 flex justify-center"
											type="button"
											onClick={submitWrap}>
											{loading && (
												<div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
											)}

											{!loading && <span>Convert</span>}
										</button>
									)}
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

export default ConfirmWrapModal;
