import { UndefinedOr } from '@devprotocol/util-ts';
import { BigNumber } from '@ethersproject/bignumber';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers, utils } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { AllowanceContext } from '../../context/allowanceContext';
import { AvailableNetwork } from '../../types/types';
import { getAvailableNetworkByChainId } from '../../utils/utils';

type ConvertConfirmationModalParams = {
	setDisplayModal: React.Dispatch<React.SetStateAction<boolean>>;
	confirmTransaction(): void;
	sourceNetwork: UndefinedOr<ethers.providers.Network>; // user can have incorrect network loaded on metamask
	targetNetwork: AvailableNetwork; // but only valid networks selectable for target
	amount: UndefinedOr<BigNumber>;
	loading: boolean;
};

const ConvertConfirmationModal: React.FC<ConvertConfirmationModalParams> = ({
	setDisplayModal,
	confirmTransaction,
	sourceNetwork,
	targetNetwork,
	amount,
	loading
}: ConvertConfirmationModalParams) => {
	const [validSourceNetwork, setValidSourceNetwork] = useState<UndefinedOr<AvailableNetwork>>();
	const { allowance } = useContext(AllowanceContext);

	useEffect(() => {
		if (sourceNetwork) {
			const _validSourceNetwork = getAvailableNetworkByChainId(sourceNetwork.chainId);
			setValidSourceNetwork(_validSourceNetwork);
		}
	}, [sourceNetwork]);

	return (
		<div>
			<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
				<div className="relative w-auto my-6 mx-auto max-w-sm">
					<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
						{validSourceNetwork && (
							<div>
								<div className="relative p-6 flex-auto font-semibold">
									Converting <span className="text-bold">{amount ? utils.formatEther(amount) : 0} DEV</span>
									<div>
										<FontAwesomeIcon icon={faArrowDown} />
									</div>
									<div>
										L{targetNetwork.layer} {targetNetwork.name}
									</div>
								</div>

								<div className="flex flex-col p-6 pt-4 border-t border-solid border-blueGray-200 rounded-b">
									<div className="text-sm mb-4">
										<span className="font-normal">
											<b>Depositing</b> to Arbitrum takes an average of <b>10 minutes</b> after the transaction is
											confirmed on L1.
										</span>
										<br />
										<span className="text-red-600">
											<b>Withdrawing</b> from Arbitrum to Layer 1 Ethereum can take up to <b>10 days</b>
										</span>
									</div>
									<div className="flex items-center justify-end">
										<button
											className="text-gray-400 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
											type="button"
											onClick={() => setDisplayModal(false)}>
											Cancel
										</button>

										{((targetNetwork.layer == 2 && allowance.gt(0)) || targetNetwork.layer == 1) && (
											<button
												className="bg-blue-600 text-white active:bg-blue-700 font-bold text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 w-28 flex justify-center"
												type="button"
												onClick={() => confirmTransaction()}>
												{loading && (
													<div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
												)}

												{!loading && <span>Convert</span>}
											</button>
										)}
									</div>
								</div>
							</div>
						)}

						{/** this should be unreachable, since user cannot launch modal if source network is invalid */}
						{!validSourceNetwork && (
							<div>
								<div className="relative p-6 flex-auto font-semibold">
									Invalid Source Network: {sourceNetwork?.name}
								</div>
								<button
									className="text-gray-400 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
									type="button"
									onClick={() => setDisplayModal(false)}>
									Cancel
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="opacity-25 fixed inset-0 z-40 bg-black" />
		</div>
	);
};

export default ConvertConfirmationModal;
