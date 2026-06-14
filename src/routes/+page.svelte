<script>
	import { onMount } from 'svelte';
	let files = $state([]);
	let uploading = $state(false);
	let uploadError = $state('');
	let uploadSuccess = $state(false);
	let selectedFileCount = $state(0);
	let { data = { phoneUrls: [] } } = $props();
	const phoneUrl = data.phoneUrls?.[0];

	async function fetchFiles() {
		const res = await fetch('/api/files');
		const data = await res.json();
		files = data.files;
	}

	onMount(fetchFiles);

	let fileInput;

	function updateSelectedFiles() {
		selectedFileCount = fileInput?.files?.length ?? 0;
		uploadError = '';
		uploadSuccess = false;
	}

	async function uploadFile(event) {
		event?.preventDefault();
		uploadError = '';
		uploadSuccess = false;
		if (!fileInput?.files?.length) {
			uploadError = 'Choose at least one file first.';
			return;
		}
		const formData = new FormData();
		for (const file of fileInput.files) {
			// Send both file and its relative path
			formData.append('files', file, file.webkitRelativePath || file.name);
		}
		uploading = true;
		const res = await fetch('/api/files', {
			method: 'POST',
			body: formData
		});
		uploading = false;
		if (res.ok) {
			uploadSuccess = true;
			fileInput.value = '';
			selectedFileCount = 0;
			await fetchFiles();
		} else {
			const err = await res.json();
			uploadError = err.error || 'Upload failed';
		}
	}

	async function deleteFile(name) {
		if (!confirm(`Delete ${name}?`)) return;
		const res = await fetch(`/api/files?name=${encodeURIComponent(name)}`, {
			method: 'DELETE'
		});
		if (res.ok) {
			await fetchFiles();
		} else {
			alert('Delete failed');
		}
	}
</script>

<main class="app-shell">
	<header class="page-header">
		<div>
			<p class="kicker">Local transfer</p>
			<h1>WIFI File Sharing</h1>
		</div>
		<span class="network-pill">Trusted Wi-Fi only</span>
	</header>

	<section class="guide-panel" aria-labelledby="how-to-use">
		<div class="guide-copy">
			<h2 id="how-to-use">How to use this</h2>
			<ol>
				<li>Connect your computer and phone to the same Wi-Fi network.</li>
				<li>Open this site on the device that has the files you want to share.</li>
				<li>Choose one or more files, then select Upload.</li>
				<li>Open this same site on another device and select Download next to the file.</li>
			</ol>
			<p class="risk-note">
				Anyone who can open this page on your network can upload, download, or delete shared files.
			</p>
		</div>

		<div class="phone-panel">
			<h3>Phone users</h3>
			<p>Open your phone browser and go to:</p>
			<p class="phone-url">
				{#if phoneUrl}
					{phoneUrl}
				{:else}
					http://your-computer-ip:3000
				{/if}
			</p>
			<p class="phone-help">
				The files you can download appear under <strong>Shared Files</strong>.
			</p>
			{#if !phoneUrl}
				<p class="fallback-help">
					If this shows a placeholder, find your computer IPv4 address and use port 3000.
				</p>
			{/if}
		</div>
	</section>

	<section class="transfer-panel" aria-labelledby="upload-heading">
		<div class="section-heading">
			<div>
				<p class="kicker">Upload</p>
				<h2 id="upload-heading">Share from this device</h2>
			</div>
			<p>Choose files here, then download them from another device on the same network.</p>
		</div>

		<form class="upload-form" onsubmit={uploadFile}>
			<label for="files">Choose files to share</label>
			<input id="files" type="file" bind:this={fileInput} onchange={updateSelectedFiles} multiple />
			<p class="selection-status" aria-live="polite">
				{selectedFileCount
					? `${selectedFileCount} ${selectedFileCount === 1 ? 'file' : 'files'} selected`
					: 'No files selected'}
			</p>
			<button type="submit" disabled={uploading}>
				{uploading ? 'Uploading...' : 'Upload'}
			</button>
			{#if uploadError}
				<div class="feedback error">{uploadError}</div>
			{/if}
			{#if uploadSuccess}
				<div class="feedback success">Upload successful.</div>
			{/if}
		</form>
	</section>

	<section class="files-panel" aria-labelledby="files-heading">
		<div class="section-heading files-heading">
			<div>
				<p class="kicker">Available now</p>
				<h2 id="files-heading">Shared Files</h2>
			</div>
			<span class="file-count">{files.length} {files.length === 1 ? 'item' : 'items'}</span>
		</div>

		<ul class="file-list">
			{#each files as file (file.name)}
				<li class="file-row">
					<div class="file-meta">
						<span class="file-icon" aria-hidden="true">File</span>
						<div>
							<span class="file-name">{file.name}</span>
							<span class="file-size">{file.size} bytes</span>
						</div>
					</div>
					<div class="file-actions">
						<a href={`/api/files?download=${encodeURIComponent(file.name)}`} download>Download</a>
						<button type="button" onclick={() => deleteFile(file.name)}>Delete</button>
					</div>
				</li>
			{:else}
				<li class="empty-state">No files yet. Choose files above, then select Upload.</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		background:
			radial-gradient(circle at top left, oklch(0.96 0.035 110 / 0.68), transparent 34rem),
			linear-gradient(180deg, oklch(1 0 0), oklch(0.975 0.006 118));
		color: oklch(0.2 0.035 125);
	}

	:global(*:focus-visible) {
		outline: 3px solid oklch(0.68 0.13 235);
		outline-offset: 3px;
	}

	main {
		--bg: oklch(1 0 0);
		--surface: oklch(0.985 0.006 112);
		--surface-strong: oklch(0.955 0.018 112);
		--ink: oklch(0.2 0.035 125);
		--muted: oklch(0.44 0.026 126);
		--primary: oklch(0.5 0.105 112);
		--primary-hover: oklch(0.44 0.105 112);
		--accent: oklch(0.5 0.13 235);
		--line: oklch(0.86 0.018 112);
		--danger: oklch(0.52 0.17 28);
		--success: oklch(0.43 0.11 148);
		min-height: 100vh;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	.app-shell {
		width: min(100% - 2rem, 58rem);
		margin: 0 auto;
		padding: 2rem 0 3rem;
	}

	.page-header,
	.section-heading,
	.file-row,
	.file-actions,
	.file-meta {
		display: flex;
		align-items: center;
	}

	.page-header {
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.kicker {
		margin: 0 0 0.35rem;
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0;
	}

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	h1 {
		color: var(--ink);
		font-size: 2rem;
		font-weight: 760;
		line-height: 1.08;
		text-wrap: balance;
	}

	h2 {
		color: var(--ink);
		font-size: 1.2rem;
		font-weight: 740;
		line-height: 1.2;
		text-wrap: balance;
	}

	h3 {
		color: var(--ink);
		font-size: 1rem;
		font-weight: 720;
	}

	.network-pill,
	.file-count {
		border: 1px solid var(--line);
		border-radius: 999px;
		background: oklch(1 0 0 / 0.78);
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 700;
		padding: 0.45rem 0.75rem;
		white-space: nowrap;
	}

	.guide-panel,
	.transfer-panel,
	.files-panel {
		border: 1px solid var(--line);
		border-radius: 12px;
		background: oklch(1 0 0 / 0.92);
	}

	.guide-panel {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(17rem, 0.8fr);
		gap: 1rem;
		margin-bottom: 1rem;
		padding: 1rem;
	}

	.guide-copy,
	.phone-panel,
	.transfer-panel,
	.files-panel {
		padding: 1.1rem;
	}

	.guide-copy ol {
		margin: 0.85rem 0 0;
		padding-left: 1.35rem;
		color: var(--ink);
	}

	.guide-copy li + li {
		margin-top: 0.45rem;
	}

	.risk-note,
	.phone-help,
	.fallback-help,
	.section-heading p,
	.selection-status,
	.file-size,
	.empty-state {
		color: var(--muted);
	}

	.risk-note {
		max-width: 68ch;
		margin-top: 0.95rem;
		font-size: 0.9rem;
	}

	.phone-panel {
		border-radius: 10px;
		background: var(--surface);
	}

	.phone-panel p {
		margin-top: 0.55rem;
	}

	.phone-url {
		overflow-wrap: anywhere;
		border: 1px solid oklch(0.79 0.06 235);
		border-radius: 8px;
		background: oklch(0.95 0.028 235);
		color: oklch(0.27 0.09 235);
		font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;
		font-size: 0.93rem;
		font-weight: 720;
		line-height: 1.35;
		padding: 0.75rem;
	}

	.phone-help,
	.fallback-help {
		font-size: 0.86rem;
	}

	.transfer-panel,
	.files-panel {
		margin-top: 1rem;
	}

	.section-heading {
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.section-heading p {
		max-width: 31rem;
		font-size: 0.9rem;
		text-align: right;
		text-wrap: pretty;
	}

	.upload-form {
		display: grid;
		gap: 0.8rem;
	}

	.upload-form label {
		color: var(--ink);
		font-size: 0.92rem;
		font-weight: 720;
	}

	input[type='file'] {
		width: 100%;
		border: 1px dashed oklch(0.73 0.055 112);
		border-radius: 10px;
		background: var(--surface);
		color: var(--muted);
		font-size: 0.95rem;
		padding: 0.85rem;
	}

	input[type='file']::file-selector-button {
		min-height: 2.75rem;
		border: 0;
		border-radius: 8px;
		background: oklch(0.9 0.045 112);
		color: oklch(0.29 0.07 112);
		font-weight: 760;
		margin-right: 0.9rem;
		padding: 0 1rem;
	}

	.selection-status {
		font-size: 0.86rem;
	}

	button,
	a {
		transition:
			background-color 180ms ease,
			border-color 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.upload-form button {
		min-height: 3.15rem;
		width: 100%;
		border: 0;
		border-radius: 10px;
		background: var(--primary);
		color: oklch(1 0 0);
		cursor: pointer;
		font-weight: 780;
		padding: 0 1.15rem;
	}

	.upload-form button:hover {
		background: var(--primary-hover);
	}

	.upload-form button:active,
	.file-actions a:active,
	.file-actions button:active {
		transform: translateY(1px);
	}

	.upload-form button:disabled {
		cursor: not-allowed;
		opacity: 0.68;
	}

	.feedback {
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 700;
		padding: 0.75rem;
	}

	.feedback.error {
		background: oklch(0.96 0.035 28);
		color: var(--danger);
	}

	.feedback.success {
		background: oklch(0.95 0.04 148);
		color: var(--success);
	}

	.files-heading {
		margin-bottom: 0.75rem;
	}

	.file-list {
		display: grid;
		gap: 0.6rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.file-row {
		justify-content: space-between;
		gap: 1rem;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--bg);
		padding: 0.8rem;
	}

	.file-meta {
		min-width: 0;
		gap: 0.75rem;
	}

	.file-icon {
		display: inline-grid;
		min-width: 2.4rem;
		min-height: 2.4rem;
		place-items: center;
		border-radius: 8px;
		background: var(--surface-strong);
		color: oklch(0.32 0.07 112);
		font-size: 0.72rem;
		font-weight: 800;
	}

	.file-name,
	.file-size {
		display: block;
	}

	.file-name {
		overflow-wrap: anywhere;
		color: var(--ink);
		font-weight: 730;
	}

	.file-size {
		margin-top: 0.15rem;
		font-size: 0.82rem;
	}

	.file-actions {
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.45rem;
	}

	.file-actions a,
	.file-actions button {
		min-height: 2.5rem;
		border-radius: 8px;
		font-size: 0.88rem;
		font-weight: 760;
		padding: 0.62rem 0.8rem;
		text-decoration: none;
	}

	.file-actions a {
		border: 1px solid oklch(0.74 0.07 235);
		background: oklch(0.96 0.024 235);
		color: oklch(0.3 0.1 235);
	}

	.file-actions button {
		border: 1px solid oklch(0.82 0.07 28);
		background: oklch(1 0 0);
		color: var(--danger);
		cursor: pointer;
	}

	.file-actions a:hover,
	.file-actions button:hover {
		border-color: currentColor;
	}

	.empty-state {
		border: 1px dashed var(--line);
		border-radius: 10px;
		background: var(--surface);
		padding: 1rem;
	}

	@media (min-width: 42rem) {
		.upload-form {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}

		.upload-form label,
		.upload-form input,
		.selection-status,
		.feedback {
			grid-column: 1;
		}

		.upload-form button {
			grid-column: 2;
			grid-row: 2 / 4;
			width: auto;
			min-width: 9rem;
		}
	}

	@media (max-width: 46rem) {
		.app-shell {
			width: min(100% - 1rem, 58rem);
			padding-top: 1rem;
		}

		.page-header,
		.section-heading,
		.file-row {
			align-items: stretch;
			flex-direction: column;
		}

		.network-pill,
		.file-count {
			width: fit-content;
		}

		.guide-panel {
			grid-template-columns: 1fr;
			padding: 0.75rem;
		}

		.guide-copy,
		.phone-panel,
		.transfer-panel,
		.files-panel {
			padding: 1rem;
		}

		.section-heading p {
			text-align: left;
		}

		.file-actions {
			display: grid;
			grid-template-columns: 1fr 1fr;
			width: 100%;
		}

		.file-actions a,
		.file-actions button {
			text-align: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		button,
		a {
			transition: none;
		}
	}
</style>
