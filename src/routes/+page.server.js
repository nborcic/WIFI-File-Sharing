import os from 'node:os';
import { getPhoneUrls } from '$lib/server/phone-url.js';

export function load({ url }) {
	const configuredPhoneUrl = process.env.PHONE_URL?.trim();

	return {
		phoneUrls: configuredPhoneUrl ? [configuredPhoneUrl] : getPhoneUrls(url, os.networkInterfaces())
	};
}
