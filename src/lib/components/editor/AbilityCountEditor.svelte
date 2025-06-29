<script lang="ts">
	import type { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import { AbilityCountData } from '$lib/parser-logic/parser/models/AbilityCountData';
	import CollapsibleSection from '$lib/components/shared/CollapsibleSection.svelte';

	export let checkpoint: Checkpoint;
	export let onUpdate: () => void;

	function updateAbilityCount() {
		if (checkpoint.AbilityCount instanceof AbilityCountData) {
			onUpdate();
		}
	}

	function isAbilityCountEnabled(): boolean {
		return checkpoint.AbilityCount instanceof AbilityCountData;
	}

	function toggleAbilityCount() {
		if (checkpoint.AbilityCount instanceof AbilityCountData) {
			// Disable ability count
			checkpoint.AbilityCount = false;
		} else {
			// Enable ability count
			checkpoint.AbilityCount = new AbilityCountData(0, 0, 0);
		}
		onUpdate();
	}

	$: hasAbilityCount = checkpoint.AbilityCount instanceof AbilityCountData;
	$: abilityCount = hasAbilityCount ? checkpoint.AbilityCount as AbilityCountData : null;
</script>

<div class="ability-count-editor">
	<CollapsibleSection title="Ability Count Settings" expanded={true}>
		<div class="ability-count-content">
			<div class="edit-section">
				<button 
					class="toggle-pill"
					class:active={hasAbilityCount}
					on:click={toggleAbilityCount}
				>
					{hasAbilityCount ? 'Enabled' : 'Disabled'}
				</button>
			</div>

			{#if hasAbilityCount && abilityCount}
				<div class="ability-states">
					<div class="edit-section">
						<label for="ability1-state">Rocket Punch Count:</label>
						<input 
							id="ability1-state"
							type="number" 
							min="0"
							step="1"
							bind:value={abilityCount.Ability1State} 
							on:input={updateAbilityCount}
						/>
					</div>

					<div class="edit-section">
						<label for="ability2-state">Rising Uppercut Count:</label>
						<input 
							id="ability2-state"
							type="number" 
							min="0"
							step="1"
							bind:value={abilityCount.Ability2State} 
							on:input={updateAbilityCount}
						/>
					</div>

					<div class="edit-section">
						<label for="ability3-state">Seismic Slam Count:</label>
						<input 
							id="ability3-state"
							type="number" 
							min="0"
							step="1"
							bind:value={abilityCount.Ability3State} 
							on:input={updateAbilityCount}
						/>
					</div>
				</div>
			{/if}
		</div>
	</CollapsibleSection>
</div>

<style>
	.ability-count-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.ability-count-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.edit-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.edit-section label {
		font-weight: 600;
		color: var(--text);
		font-size: 0.95rem;
	}
	.edit-section input[type="number"] {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: var(--bg);
		color: var(--text);
		font-size: 0.95rem;
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
	.ability-states {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}
	.help-text {
		display: block;
		font-size: 0.875rem;
		color: var(--text-muted);
		font-style: italic;
	}
</style> 