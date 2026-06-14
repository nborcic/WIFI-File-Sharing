const DOCKER_BRIDGE_PREFIXES = ['172.17.', '172.18.', '172.19.'];

function isUsablePhoneAddress(networkAddress) {
	return (
		networkAddress &&
		networkAddress.family === 'IPv4' &&
		!networkAddress.internal &&
		!DOCKER_BRIDGE_PREFIXES.some((prefix) => networkAddress.address.startsWith(prefix))
	);
}

function addressPriority(networkAddress) {
	if (networkAddress.address.startsWith('192.168.')) return 0;
	if (networkAddress.address.startsWith('10.')) return 1;
	if (/^172\.(1[6-9]|2\d|3[01])\./.test(networkAddress.address)) return 2;
	return 3;
}

export function getPhoneUrls(url, interfaces) {
	const port = url.port ? `:${url.port}` : '';
	const protocol = url.protocol || 'http:';

	return Object.values(interfaces)
		.flat()
		.filter(isUsablePhoneAddress)
		.sort((left, right) => addressPriority(left) - addressPriority(right))
		.map((networkAddress) => `${protocol}//${networkAddress.address}${port}`);
}
