import { UndefinedOr } from '@devprotocol/util-ts';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { AvailableNetwork } from '../../types/types';
import DepositConfirmationModal from '../DepositConfirmationModal';

interface ConvertParams {
	formValid: boolean;
	amount: UndefinedOr<ethers.BigNumber>;
	network: ethers.providers.Network;
	selectedTargetChain: AvailableNetwork;
}

const Convert: React.FC<ConvertParams> = ({ formValid, amount, network, selectedTargetChain }) => {
	const [displayModal, setDisplayModal] = useState(false);

	const launchModal = (e: React.FormEvent): void => {
		e.preventDefault();
		setDisplayModal(true);
	};

	const submitTransaction = (): void => {
		setDisplayModal(false);
	};

	return (
		<div>
			<div>
				<button
					className={`text-center w-full text-white py-3 rounded shadow border font-semibold h-14 ${
						formValid ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
					}`}
					onClick={launchModal}
					disabled={!formValid}>
					Convert
				</button>
			</div>
			{displayModal && (
				<div>
					<DepositConfirmationModal
						setDisplayModal={setDisplayModal}
						confirmTransaction={submitTransaction}
						sourceNetwork={network}
						targetNetwork={selectedTargetChain}
						amount={amount}
					/>
				</div>
			)}
		</div>
	);
};

export default Convert;
