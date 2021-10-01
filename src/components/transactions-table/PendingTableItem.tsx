import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConvertDirection, IPendingItem } from '../../context/bridgeContext';
import { useInterval } from '../../hooks/useInterval';

interface PendingTableItemParams {
	item: IPendingItem;
	layer: 1 | 2;
}

const PendingTableItem: React.FC<PendingTableItemParams> = ({ item, layer }) => {
	const [now, setNow] = useState(new Date());
	const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(new Date());

	useInterval(() => {
		setNow(new Date());
	}, 60000);

	useEffect(() => {
		const date = new Date();
		item.direction === ConvertDirection.DEPOSIT
			? date.setMinutes(date.getMinutes() + 10)
			: date.setDate(date.getDate() + 10);

		setEstimatedArrivalTime(date);
	}, [item.direction]);

	return (
		<tr>
			<td>
				{`L${layer}`} {item.direction}
			</td>
			<td>Pending</td>
			<td>
				{estimatedArrivalTime.getMinutes() - now.getMinutes() > 0
					? estimatedArrivalTime.getMinutes() - now.getMinutes()
					: '< 1'}{' '}
				{item.direction === ConvertDirection.DEPOSIT ? 'Minutes' : 'Days'}
			</td>
			<td>
				<a>
					{item.hash.substr(0, 6)}
					...
					{item.hash.substr(item.hash.length - 4, item.hash.length)}
				</a>
			</td>
			<td>{ethers.utils.formatUnits(item.value.toString(), 18).toString()}</td>
		</tr>
	);
};

export default PendingTableItem;
