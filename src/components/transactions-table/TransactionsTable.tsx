import React, { useContext } from 'react';
import { BridgeContext } from '../../context/bridgeContext';
import PendingTableItem from './PendingTableItem';
import ReceiptTableItem from './ReceiptTableItem';

interface TransactionsTableParams {}

const TransactionsTable: React.FC<TransactionsTableParams> = () => {
	const { l1PendingTxs, l2PendingTxs, txReceipts } = useContext(BridgeContext);

	return (
		<div className="bg-white w-full my-12 p-8 rounded">
			<div className="pt-4">
				{(l1PendingTxs.length > 0 || l2PendingTxs.length > 0 || txReceipts.length > 0) && (
					<table className="w-full">
						<thead>
							<tr>
								<th>Action</th>
								<th>Status</th>
								<th>Est. Arrival Time</th>
								<th>TXID</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							{l1PendingTxs.map((item, i) => (
								<PendingTableItem item={item} layer={1} key={`l1Pending-${i}`} />
							))}
							{l2PendingTxs.map((item, i) => (
								<PendingTableItem item={item} layer={2} key={`l2Pending-${i}`} />
							))}
							{txReceipts.map((item, i) => (
								<ReceiptTableItem item={item} key={`receipt-${i}`} />
							))}
						</tbody>
					</table>
				)}

				{l1PendingTxs.length <= 0 && l2PendingTxs.length <= 0 && txReceipts.length <= 0 && (
					<div className="flex justify-center">
						<span className="font-bold text-gray-500">No Pending Txs Found</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default TransactionsTable;
