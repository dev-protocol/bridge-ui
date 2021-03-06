import React, { useContext, useState } from 'react';
import { UndefinedOr } from '@devprotocol/util-ts';
import { ethers } from 'ethers';
// import { getAvailableNetworkByChainId, getGatewayAddressByChainId } from '../../utils/utils';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { AllowanceContext } from '../../context/allowanceContext';

type ApprovalParams = {
	allowanceUpdated(): void;
	sourceNetwork: UndefinedOr<ethers.providers.Network>;
	onError(message: string): void;
	tokenAddress: string;
	spenderAddress: string;
};

const Approval: React.FC<ApprovalParams> = ({
	// sourceNetwork,
	onError,
	allowanceUpdated,
	tokenAddress,
	spenderAddress
}) => {
	const [modalLaunched, setModalLaunched] = useState(false);
	const web3Context = useWeb3Provider();
	const { approve, setLoading, loading } = useContext(AllowanceContext);

	const onApprove = async (e: React.FormEvent) => {
		e.preventDefault();
		const currentProvider = web3Context?.web3Provider;
		if (currentProvider) {
			try {
				const success = await approve({
					spenderAddress,
					tokenAddress,
					provider: currentProvider
				});
				if (success) {
					allowanceUpdated();
					setModalLaunched(false);
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

	// useEffect(() => {
	// 	if (sourceNetwork) {
	// 		setGatewayAddress(getGatewayAddressByChainId(sourceNetwork.chainId));
	// 		const validSourceNetwork = getAvailableNetworkByChainId(sourceNetwork.chainId);
	// 		if (validSourceNetwork) {
	// 			setSourceTokenAddress(validSourceNetwork.tokenAddress);
	// 		}
	// 	}
	// }, [sourceNetwork]);

	const launchModal = (e: React.FormEvent) => {
		e.preventDefault();
		setModalLaunched(true);
	};

	return (
		<div>
			<button
				disabled={loading}
				onClick={launchModal}
				className={`text-center w-full text-white py-3 rounded shadow border font-semibold flex justify-center h-14 items-center ${
					!loading ? 'bg-blue-600' : 'bg-blue-400 cursor-not-allowed'
				}`}>
				{loading && <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>}

				{!loading && <span>Approve</span>}
			</button>
			{modalLaunched && (
				<div>
					<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
						<div className="relative w-auto my-6 mx-auto max-w-sm">
							<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
								<div className="p-6">
									<div className="relative flex-auto font-semibold">Approval Required</div>

									<div>To use this gateway, you first must approve the contract for usage.</div>
								</div>
								<div className="flex flex-col p-6 border-t border-solid border-blueGray-200 rounded-b">
									<div className="flex">
										<button
											className="text-gray-400 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
											type="button"
											onClick={() => setModalLaunched(false)}>
											Cancel
										</button>
										<button
											onClick={onApprove}
											className={`flex justify-center items-center text-white active:bg-blue-700 font-bold text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-32 h-12 ${
												loading ? 'bg-blue-400' : 'bg-blue-600'
											}`}>
											{loading && (
												<div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
											)}

											{!loading && <span>Approve</span>}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="opacity-25 fixed inset-0 z-40 bg-black" />
				</div>
			)}
		</div>
	);
};

export default Approval;
