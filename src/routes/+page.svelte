<script lang="ts">
	import { MapParserService } from '$lib/parser-logic/parser/MapParserService';
	import { MapComposer } from '$lib/parser-logic/parser/MapComposer';
	import { MapExporterService } from '$lib/parser-logic/parser/MapExporterService';
	import { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import LevelList from '$lib/components/editor/LevelList.svelte';
	import InspectorPanel from '$lib/components/editor/InspectorPanel.svelte';
	import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
	import mapStore from '$lib/mapStore';

	let isLoading = false;
	let selectedCheckpoint: Checkpoint | null = null;
	let exportButtonText = 'Copy to Clipboard';

	// NEW: This function reads text directly from the user's clipboard
	async function handlePaste() {
		// The Clipboard API requires a secure context (HTTPS or localhost)
		// and must be triggered by a user action (like a click).
		try {
			const text = await navigator.clipboard.readText();
			if (!text) {
				alert('Your clipboard is empty or you did not grant permission.');
				return;
			}
			isLoading = true;
			mapStore.set(null); // Clear any old map

			// The rest of the logic is the same as before
			const parser = new MapParserService();
			const composer = new MapComposer();
			const rawData = parser.parse(text);
			const newMap = composer.compose(rawData);
			mapStore.set(newMap); // Set the store, which automatically saves to localStorage
		} catch (err) {
			console.error('Failed to read clipboard contents:', err);
			alert(
				'Could not read from clipboard. You may need to grant permission in your browser when prompted.'
			);
		} finally {
			isLoading = false;
		}
	}

	// This function now writes the exported string to the clipboard
	async function handleExport() {
		if (!$mapStore) return;

		// The export logic is the same
		const exporter = new MapExporterService();
		const mapString = exporter.exportToString($mapStore);

		try {
			// The output logic is now changed to use the clipboard
			await navigator.clipboard.writeText(mapString);

			// Give the user visual feedback that the copy worked
			exportButtonText = 'Copied!';
			setTimeout(() => {
				exportButtonText = 'Copy to Clipboard';
			}, 2000); // Reset the button text after 2 seconds
		} catch (err) {
			console.error('Failed to copy text:', err);
			alert('Could not copy text to clipboard.');
		}
	}

	function clearSession() {
		if (confirm('Are you sure you want to clear your current session and start over?')) {
			selectedCheckpoint = null;
			mapStore.set(null);
		}
	}
</script>

<div class="fixed-theme-toggle">
	<ThemeToggle />
</div>

{#if $mapStore}
	<div class="main-container">
		<div class="master-panel">
			<div class="session-header">
				<h2>Map Details</h2>
				<button on:click={clearSession} class="clear-btn">Clear & Start New</button>
			</div>
			<div class="results">
				<LevelList bind:finalMap={$mapStore} bind:selectedCheckpoint />
				<div class="export-container">
					<button class="btn" on:click={handleExport}>{exportButtonText}</button>
				</div>
			</div>
		</div>

		<div class="detail-panel">
			{#if selectedCheckpoint}
				<InspectorPanel checkpoint={selectedCheckpoint} onUpdate={() => mapStore.set($mapStore)} />
			{:else}
				<div class="placeholder">
					<p>Select a checkpoint from the list on the left to view and edit its details.</p>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="welcome-container">
		{#if isLoading}
			<p class="loading-text"><i>Loading and parsing map...</i></p>
		{:else}
			<div class="welcome-content">
				<h1>Doomfist Parkour Map Editor</h1>
				<p class="subtitle">
					Copy your map code from the Overwatch Workshop, then paste it here to begin.
				</p>
				<button class="btn" on:click={handlePaste}>Paste Map Data from Clipboard</button>
			</div>
			<footer>
				<p>Completely vibe coded by Dorian</p>
			</footer>
		{/if}
	</div>
{/if}

<style>
	.fixed-theme-toggle {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	.welcome-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		min-height: 100vh;
		padding: 2rem;
	}
	.welcome-content {
		max-width: 700px;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 800;
	}
	.subtitle {
		font-size: 1.1rem;
		max-width: 500px;
		margin: 1rem auto 2rem;
		line-height: 1.6;
		opacity: 0.8;
	}
	.loading-text {
		font-size: 1.5rem;
	}
	footer {
		position: absolute;
		bottom: 1rem;
		font-size: 0.9rem;
		opacity: 0.6;
	}

	/* Styles for the main editor view */
	.main-container {
		display: flex;
		height: 100vh;
	}
	.master-panel {
		width: 40%;
		max-width: 600px;
		min-width: 400px;
		padding: 1.5rem;
		border-right: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
	}
	.results {
		overflow-y: auto; /* Allow the level list to scroll */
		flex-grow: 1;
		padding-right: 0.75rem;
	}
	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	.detail-panel {
		flex-grow: 1;
		padding: 1.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}
	.placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: var(--text);
		opacity: 0.5;
		text-align: center;
	}

	.btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--border-color);
		background-color: var(--card-bg);
		color: var(--text);
		border-radius: 5px;
		cursor: pointer;
		font-weight: bold;
		transition:
			background-color 0.2s,
			color 0.2s,
			border-color 0.2s,
			transform 0.1s;
		text-align: center;
	}

	.btn:not(:disabled):hover {
		background-color: var(--primary);
		color: var(--primary-text);
		border-color: var(--primary);
	}

	.btn:not(:disabled):active {
		transform: scale(0.97);
	}

	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.clear-btn {
		font-size: 0.9rem;
		background: none;
		border: 1px solid var(--border-color);
		padding: 0.4rem 0.8rem;
		border-radius: 5px;
		cursor: pointer;
	}
	.clear-btn:hover {
		background-color: #dc3545;
		color: white;
		border-color: #dc3545;
	}

	.export-container {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
		text-align: right;
	}

	.export-container .btn {
		font-size: 1.1rem;
	}
</style>
