<script>
  import { onMount } from 'svelte';
  let files = [];
  let uploading = false;
  let uploadError = '';
  let uploadSuccess = false;

  async function fetchFiles() {
    const res = await fetch('/api/files');
    const data = await res.json();
    files = data.files;
  }

  onMount(fetchFiles);

  let fileInput;

  async function uploadFile() {
    uploadError = '';
    uploadSuccess = false;
    if (!fileInput.files.length) return;
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

<main class="max-w-xl mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">WIFI File Sharing</h1>

  <div class="mb-6">
    <input type="file" bind:this={fileInput} class="mr-2" multiple />
    <button on:click={uploadFile} disabled={uploading} class="bg-blue-500 text-white px-4 py-2 rounded">
      {uploading ? 'Uploading...' : 'Upload'}
    </button>
    {#if uploadError}
      <div class="text-red-500 mt-2">{uploadError}</div>
    {/if}
    {#if uploadSuccess}
      <div class="text-green-600 mt-2">Upload successful!</div>
    {/if}
  </div>

  <h2 class="text-xl font-semibold mb-2">Shared Files</h2>
  <ul class="border rounded p-2 bg-white">
    {#each files as file}
      <li class="flex justify-between items-center py-1 border-b last:border-b-0">
        <span>{file.name}</span>
        <span class="text-gray-500 text-sm">{file.size} bytes</span>
        <a
          href={`/api/files?download=${encodeURIComponent(file.name)}`}
          class="ml-2 text-blue-600 underline"
          download
        >Download</a>
        <button
          class="ml-2 text-red-600 hover:underline"
          on:click={() => deleteFile(file.name)}
        >Delete</button>
      </li>
    {:else}
      <li>No files found.</li>
    {/each}
  </ul>
</main>

<style>
  main { font-family: system-ui, sans-serif; }
</style>
