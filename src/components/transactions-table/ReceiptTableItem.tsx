import { UndefinedOr } from '@devprotocol/util-ts';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConvertDirection, IReceiptItem } from '../../context/bridgeContext';
import { useWeb3Provider } from '../../context/web3ProviderContext';
import { getAvailableNetworkByChainId, getExplorerUrlByChainId } from '../../utils/utils';

interface ReceiptTableItemParams {
	item: IReceiptItem;
}

const ReceiptTableItem: React.FC<ReceiptTableItemParams> = ({ item }) => {
	const [link, setLink] = useState<UndefinedOr<string>>();
	const getWithdrawSuccessDate = (): string => {
		const date = new Date();
		date.setDate(date.getDate() + 10);
		return date.toLocaleDateString('en-US');
	};
	const web3Context = useWeb3Provider();

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
				item.layer == 1 &&
				(network?.chainId === 1 || network?.chainId === 4)
			) {
				const base = getExplorerUrlByChainId(network?.chainId);
				setLink(`${base}/tx/${item.receipt.transactionHash}`);
			}

			// L2 Deposit Mainnet
			if (
				item.direction === ConvertDirection.DEPOSIT &&
				item.layer == 2 &&
				(network?.chainId === 42161 || network?.chainId === 1)
			) {
				const base = getExplorerUrlByChainId(42161);
				setLink(`${base}/tx/${item.receipt.transactionHash}`);
			}

			// L2 Deposit Rinkeby
			if (
				item.direction === ConvertDirection.DEPOSIT &&
				item.layer == 2 &&
				(network?.chainId === 421611 || network?.chainId === 4)
			) {
				const base = getExplorerUrlByChainId(421611);
				setLink(`${base}/tx/${item.receipt.transactionHash}`);
			}

			// L2 Withdraw Mainnet
			if (item.direction === ConvertDirection.WITHDRAW && (network?.chainId === 42161 || network?.chainId === 1)) {
				const base = getExplorerUrlByChainId(42161);
				setLink(`${base}/tx/${item.receipt.transactionHash}`);
			}

			// L2 Withdraw Rinkeby
			if (item.direction === ConvertDirection.WITHDRAW && (network?.chainId === 421611 || network?.chainId === 4)) {
				const base = getExplorerUrlByChainId(421611);
				setLink(`${base}/tx/${item.receipt.transactionHash}`);
			}
		};

		setPendingLink();
	}, [item, web3Context?.web3Provider]);

	return (
		<tr>
			<td>
				{`L${item.layer}`} {item.direction}
			</td>
			<td>Success</td>
			{item.direction === ConvertDirection.DEPOSIT && <td>Block: {item.receipt.blockNumber}</td>}
			{item.direction === ConvertDirection.WITHDRAW && <td>{getWithdrawSuccessDate()}</td>}
			<td>
				<a href={link} target="_blank" rel="noreferrer" className="text-blue-500">
					<span className="mr-1">
						{item.receipt.transactionHash.substr(0, 6)}
						...
						{item.receipt.transactionHash.substr(
							item.receipt.transactionHash.length - 4,
							item.receipt.transactionHash.length
						)}
					</span>
					<FontAwesomeIcon icon={faExternalLinkAlt} />
				</a>
			</td>
			<td>{ethers.utils.formatUnits(item.value.toString(), 18).toString()}</td>
		</tr>
	);
};

export default ReceiptTableItem;
