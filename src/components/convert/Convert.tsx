import { UndefinedOr } from '@devprotocol/util-ts';
import { networks } from 'arb-ts';
import { ethers } from 'ethers';
import React, { useContext, useState } from 'react';
import { BridgeContext } from '../../context/bridgeContext';
import { AvailableNetwork } from '../../types/types';
import DepositConfirmationModal from './ConvertConfirmationModal';

interface ConvertParams {
	formValid: boolean;
	amount: UndefinedOr<ethers.BigNumber>;
	network: ethers.providers.Network;
	selectedTargetChain: AvailableNetwork;
}

const Convert: React.FC<ConvertParams> = ({ formValid, amount, network, selectedTargetChain }) => {
	const [displayModal, setDisplayModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const bridgeContext = useContext(BridgeContext);

	const launchModal = (e: React.FormEvent): void => {
		e.preventDefault();
		setDisplayModal(true);
	};

	const submitTransaction = async (): Promise<void> => {
		setLoading(true);
		const validNetwork = networks[network.chainId];
		if (!validNetwork) {
			setLoading(false);
			return;
		}

		if (!amount || amount?.isZero()) {
			setLoading(false);
			return;
		}

		try {
			if (validNetwork.isArbitrum) {
				// Withdraw
				await bridgeContext.withdraw(amount);
			} else {
				// Deposit
				await bridgeContext.deposit(amount);
			}
		} catch (error) {
			setLoading(false);
		}

		setLoading(false);
		setDisplayModal(false);
	};

	return (
		<div>
			<div>
				<button
					className={`text-center w-full text-white py-3 rounded shadow border font-semibold h-14 flex justify-center items-center ${
						formValid ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
					}`}
					onClick={launchModal}
					disabled={!formValid}>
					{loading && (
						<div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>
					)}

					{!loading && <span>Convert</span>}
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
						loading={loading}
					/>
				</div>
			)}
		</div>
	);
};

export default Convert;
