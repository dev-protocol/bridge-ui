import { ethers } from 'ethers';
import React from 'react';
import { ConvertDirection, IReceiptItem } from '../../context/bridgeContext';

interface ReceiptTableItemParams {
	item: IReceiptItem;
}

const ReceiptTableItem: React.FC<ReceiptTableItemParams> = ({ item }) => {
	const getWithdrawSuccessDate = (): string => {
		const date = new Date();
		date.setDate(date.getDate() + 10);
		return date.toLocaleDateString('en-US');
	};

	return (
		<tr>
			<td>
				{`L${item.layer}`} {item.direction}
			</td>
			<td>Success</td>
			{item.direction === ConvertDirection.DEPOSIT && <td>Block: {item.receipt.blockNumber}</td>}
			{item.direction === ConvertDirection.WITHDRAW && <td>{getWithdrawSuccessDate()}</td>}
			<td>
				<a>
					{item.receipt.transactionHash.substr(0, 6)}
					...
					{item.receipt.transactionHash.substr(
						item.receipt.transactionHash.length - 4,
						item.receipt.transactionHash.length
					)}
				</a>
			</td>
			<td>{ethers.utils.formatUnits(item.value.toString(), 18).toString()}</td>
		</tr>
	);
};

export default ReceiptTableItem;
