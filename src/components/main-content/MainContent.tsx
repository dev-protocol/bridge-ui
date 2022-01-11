import React from 'react';

type MainContentParams = {
	children: React.ReactNode;
};
const MainContent: React.FC<MainContentParams> = ({ children }) => {
	return <div className="max-w-sm bg-white mx-auto my-12 p-8 rounded">{children}</div>;
};

export default MainContent;
