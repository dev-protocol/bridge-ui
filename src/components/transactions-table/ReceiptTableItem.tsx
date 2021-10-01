import { ethers } from 'ethers';
import React from 'react';
import { IReceiptItem } from '../../context/bridgeContext';

interface ReceiptTableItemParams {
	item: IReceiptItem;
}

const ReceiptTableItem: React.FC<ReceiptTableItemParams> = ({ item }) => {
	return (
		<tr>
			<td>
				{`L${item.layer}`} {item.direction}
			</td>
			<td>Success</td>
			<td>Block: {item.receipt.blockNumber}</td>
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
