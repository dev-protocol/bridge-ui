import { UndefinedOr } from '@devprotocol/util-ts';
import { utils } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConvertDirection, IPendingItem } from '../../context/arbitrumBridgeContext';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { useInterval } from '../../hooks/useInterval';
import { getAvailableNetworkByChainId, getExplorerUrlByChainId } from '../../utils/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

interface PendingTableItemParams {
	item: IPendingItem;
	layer: 1 | 2;
}

const PendingTableItem: React.FC<PendingTableItemParams> = ({ item, layer }) => {
	const [now, setNow] = useState(new Date());
	const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(new Date());
	const [link, setLink] = useState<UndefinedOr<string>>();
	const web3Context = useWeb3Provider();

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

	useEffect(() => {
		const setPendingLink = async () => {
			const currentProvider = web3Context?.web3Provider;

			if (!currentProvider) {
				return;
			}
			const network = getAvailableNetworkByChainId(await (await currentProvider.getNetwork()).chainId);

			// L1 Deposit (Mainnet or Rinkeby) - Etherscan
			if (
				item.direction === ConvertDirection.DEPOSIT &&
				layer == 1 &&
				(network?.chainId === 1 || network?.chainId === 4)
			) {
				const base = getExplorerUrlByChainId(network?.chainId);
				setLink(`${base}/tx/${item.hash}`);
			}

			// L2 Deposit Mainnet
			if (
				item.direction === ConvertDirection.DEPOSIT &&
				layer == 2 &&
				(network?.chainId === 42161 || network?.chainId === 1)
			) {
				const base = getExplorerUrlByChainId(42161);
				setLink(`${base}/tx/${item.hash}`);
			}

			// L2 Deposit Rinkeby
			if (
				item.direction === ConvertDirection.DEPOSIT &&
				layer == 2 &&
				(network?.chainId === 421611 || network?.chainId === 4)
			) {
				const base = getExplorerUrlByChainId(421611);
				setLink(`${base}/tx/${item.hash}`);
			}

			// L2 Withdraw Mainnet
			if (item.direction === ConvertDirection.WITHDRAW && (network?.chainId === 42161 || network?.chainId === 1)) {
				const base = getExplorerUrlByChainId(42161);
				setLink(`${base}/tx/${item.hash}`);
			}

			// L2 Withdraw Rinkeby
			if (item.direction === ConvertDirection.WITHDRAW && (network?.chainId === 421611 || network?.chainId === 4)) {
				const base = getExplorerUrlByChainId(421611);
				setLink(`${base}/tx/${item.hash}`);
			}
		};

		setPendingLink();
	}, [item, layer, web3Context?.web3Provider]);

	return (
		<tr>
			<td>
				{`L${layer}`} {item.direction}
			</td>
			<td>Pending</td>
			{item.direction === ConvertDirection.DEPOSIT && (
				<td>
					{estimatedArrivalTime.getMinutes() - now.getMinutes() > 0
						? estimatedArrivalTime.getMinutes() - now.getMinutes()
						: '< 1'}{' '}
					Minutes
				</td>
			)}
			{item.direction === ConvertDirection.WITHDRAW && <td>{estimatedArrivalTime.toLocaleDateString('en-US')}</td>}
			<td>
				<a href={link} target="_blank" rel="noreferrer" className="text-blue-500">
					<span className="mr-1">
						{item.hash.substr(0, 6)}
						...
						{item.hash.substr(item.hash.length - 4, item.hash.length)}
					</span>
					<FontAwesomeIcon icon={faExternalLinkAlt} />
				</a>
			</td>
			<td>{utils.formatEther(item.value)}</td>
		</tr>
	);
};

export default PendingTableItem;
