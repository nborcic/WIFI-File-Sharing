import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should explain how to use file sharing', async () => {
		render(Page, {
			data: {
				phoneUrls: ['http://192.168.1.42:3000']
			}
		});

		const guideHeading = page.getByRole('heading', { name: 'How to use this', level: 2 });
		await expect.element(guideHeading).toBeInTheDocument();
		await expect
			.element(page.getByText('Connect your computer and phone to the same Wi-Fi network.'))
			.toBeInTheDocument();
		await expect.element(page.getByText('Phone users')).toBeInTheDocument();
		await expect.element(page.getByText('http://192.168.1.42:3000')).toBeInTheDocument();
	});

	it('should render touch-friendly upload controls', async () => {
		render(Page);

		await expect.element(page.getByLabelText('Choose files to share')).toBeInTheDocument();
		await expect.element(page.getByText('No files selected')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
	});
});
