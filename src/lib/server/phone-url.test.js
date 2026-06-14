import assert from 'node:assert/strict';
import test from 'node:test';
import { getPhoneUrls } from './phone-url.js';

test('getPhoneUrls returns non-internal IPv4 URLs for the current app port', () => {
	const interfaces = {
		'Wi-Fi': [
			{
				address: '192.168.1.42',
				family: 'IPv4',
				internal: false
			}
		],
		Loopback: [
			{
				address: '127.0.0.1',
				family: 'IPv4',
				internal: true
			}
		]
	};

	const urls = getPhoneUrls(new URL('http://localhost:3000/'), interfaces);

	assert.deepEqual(urls, ['http://192.168.1.42:3000']);
});

test('getPhoneUrls excludes Docker-style private bridge addresses when a LAN address exists', () => {
	const interfaces = {
		Ethernet: [
			{
				address: '172.18.0.2',
				family: 'IPv4',
				internal: false
			},
			{
				address: '10.0.0.8',
				family: 'IPv4',
				internal: false
			}
		]
	};

	const urls = getPhoneUrls(new URL('http://localhost:5173/'), interfaces);

	assert.deepEqual(urls, ['http://10.0.0.8:5173']);
});

test('getPhoneUrls prefers common Wi-Fi LAN addresses first', () => {
	const interfaces = {
		VPN: [
			{
				address: '10.14.0.2',
				family: 'IPv4',
				internal: false
			}
		],
		'Wi-Fi': [
			{
				address: '192.168.1.145',
				family: 'IPv4',
				internal: false
			}
		]
	};

	const urls = getPhoneUrls(new URL('http://localhost:5173/'), interfaces);

	assert.deepEqual(urls, ['http://192.168.1.145:5173', 'http://10.14.0.2:5173']);
});
