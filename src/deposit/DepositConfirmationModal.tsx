import { UndefinedOr } from '@devprotocol/util-ts';
import { BigNumber } from '@ethersproject/bignumber';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { AvailableNetwork } from '../_types/types';

type DepositModalParams = {
	setDisplayModal: React.Dispatch<React.SetStateAction<boolean>>;
	confirmTransaction(): void;
	selectedNetwork: AvailableNetwork;
	amount: UndefinedOr<BigNumber>;
};

const DepositConfirmationModal: React.FC<DepositModalParams> = ({
	setDisplayModal,
	confirmTransaction,
	selectedNetwork,
	amount
}: DepositModalParams) => (
	<div>
		<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
			<div className="relative w-auto my-6 mx-auto max-w-sm">
				<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
					<div className="relative p-6 flex-auto font-semibold">
						Converting <span className="text-bold">{amount ? amount.toString() : 0} DEV</span>
						<div className="">
							<FontAwesomeIcon icon={faArrowDown} />
						</div>
						<div>{selectedNetwork.name}</div>
					</div>

					<div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
						<button
							className="text-gray-400 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
							type="button"
							onClick={() => setDisplayModal(false)}>
							Cancel
						</button>
						<button
							className="bg-blue-600 text-white active:bg-blue-700 font-bold text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
							type="button"
							onClick={() => confirmTransaction()}>
							Convert DEV
						</button>
					</div>
				</div>
			</div>
		</div>
		<div className="opacity-25 fixed inset-0 z-40 bg-black" />
	</div>
);

export default DepositConfirmationModal;
