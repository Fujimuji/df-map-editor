<script lang="ts">
	import type { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import { Vector3D } from '$lib/parser-logic/parser/models/Vector3D';
	import { HiddenCpTtData } from '$lib/parser-logic/parser/models/HiddenCpTtData';
	import CollapsibleSection from '$lib/components/shared/CollapsibleSection.svelte';
	import VectorInput from '$lib/components/shared/VectorInput.svelte';

	export let checkpoint: Checkpoint;
	export let onUpdate: () => void;

	function updateTeleport() {
		onUpdate();
	}

	function toggleTeleport() {
		if (hasTeleport) {
			// Disable teleport
			checkpoint.Teleport = false as any;
			checkpoint.HiddenCpTt = null;
		} else {
			// Enable teleport with default values
			checkpoint.Teleport = new Vector3D(0, 0, 0);
			checkpoint.HiddenCpTt = new HiddenCpTtData(checkpoint.Index, 2.0, 0);
		}
		onUpdate();
	}

	$: hasTeleport = checkpoint && (checkpoint.Teleport instanceof Vector3D || 
		(checkpoint.HiddenCpTt !== null && 
		 (checkpoint.HiddenCpTt instanceof HiddenCpTtData || 
		  (typeof checkpoint.HiddenCpTt === 'object' && 'TeleportRadius' in checkpoint.HiddenCpTt))));
	$: teleportVector = hasTeleport && checkpoint.Teleport instanceof Vector3D ? checkpoint.Teleport : null;
	$: hiddenCpData = hasTeleport && checkpoint.HiddenCpTt !== null && 
		(checkpoint.HiddenCpTt instanceof HiddenCpTtData || 
		 (typeof checkpoint.HiddenCpTt === 'object' && 'TeleportRadius' in checkpoint.HiddenCpTt)) ? checkpoint.HiddenCpTt : null;
</script>

<div class="teleport-editor">
	<CollapsibleSection title="Teleport Settings" expanded={true}>
		<div class="teleport-content">
			<div class="edit-section">
				<button 
					class="toggle-pill"
					class:active={hasTeleport}
					on:click={toggleTeleport}
				>
					{hasTeleport ? 'Enabled' : 'Disabled'}
				</button>
			</div>

			{#if hasTeleport}
				<div class="teleport-properties">
					{#if teleportVector}
						<div class="edit-section">
							<VectorInput
								label="TP Destination (X, Y, Z)"
								bind:vector={teleportVector}
								onInput={updateTeleport}
							/>
						</div>
					{/if}
					
					{#if hiddenCpData}
						<div class="edit-section">
							<label for="teleport-radius">TP Radius:</label>
							<input 
								id="teleport-radius"
								type="number" 
								step="0.1"
								bind:value={hiddenCpData.TeleportRadius} 
								on:input={updateTeleport}
							/>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</CollapsibleSection>
</div>

<style>
	.teleport-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.teleport-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.edit-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.edit-section label {
		font-family: monospace;
		font-size: 0.9rem;
		color: var(--text);
	}
	.edit-section input[type="number"] {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg);
		color: var(--text);
		font-size: 1rem;
		font-family: monospace;
		transition: border-color 0.2s;
	}
	.edit-section input[type="number"]:focus {
		outline: none;
		border-color: var(--primary);
	}
	.toggle-pill {
		padding: 0.5rem 1rem;
		border-radius: 999px;
		font-size: 0.9rem;
		font-family: monospace;
		cursor: pointer;
		transition: all 0.2s;
		background-color: var(--bg);
		border: 1px solid var(--border-color);
		color: var(--text);
		margin: 0.25rem;
	}
	.toggle-pill:hover:not(:disabled) {
		border-color: var(--primary);
	}
	.toggle-pill.active {
		background-color: var(--primary);
		color: var(--primary-text);
		border-color: var(--primary);
	}
	.toggle-pill.active:hover {
		transform: scale(1.05);
	}
	.teleport-properties {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}
</style> 