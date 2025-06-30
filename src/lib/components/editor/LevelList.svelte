<script lang="ts">
	import type { Map } from '$lib/parser-logic/core/models/Map';
	import type { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import { AbilityCountData } from '$lib/parser-logic/parser/models/AbilityCountData';
	import CollapsibleSection from '$lib/components/shared/CollapsibleSection.svelte';
	import ActionMenu from '$lib/components/shared/ActionMenu.svelte';
	import Icon from '$lib/components/shared/Icon.svelte';
	import { chevronUpIcon, chevronDownIcon, trashIcon } from '$lib/icons';
	import { Vector3D } from '$lib/parser-logic/parser/models/Vector3D';

	export let finalMap: Map;
	export let selectedCheckpoint: Checkpoint | null;

	let expandedLevels: { [key: number]: boolean } = {};

	// Initialize levels as collapsed when map loads (only if not already set)
	$: if (finalMap && finalMap.Levels) {
		finalMap.Levels.forEach(level => {
			if (!(level.id in expandedLevels)) {
				expandedLevels[level.id] = false;
			}
		});
		expandedLevels = expandedLevels; // Trigger reactivity
	}

	function toggleLevelExpansion(levelId: number) {
		expandedLevels[levelId] = !expandedLevels[levelId];
		expandedLevels = expandedLevels;
	}

	function reIndexEntireMap() {
		if (!finalMap) return;
		let allCheckpointsInNewOrder: Checkpoint[] = [finalMap.Spawn];
		allCheckpointsInNewOrder.push(...finalMap.Levels.flatMap((level) => level.Checkpoints));

		for (let i = 0; i < allCheckpointsInNewOrder.length; i++) {
			allCheckpointsInNewOrder[i].Index = i;
		}
		finalMap = finalMap;
	}

	function moveLevel(fromIndex: number, toIndex: number) {
		const levels = finalMap.Levels;
		const itemToMove = levels.splice(fromIndex, 1)[0];
		levels.splice(toIndex, 0, itemToMove);
		reIndexEntireMap();
	}

	function deleteLevel(index: number) {
		const levelToDelete = finalMap.Levels[index];
		// Remove the level
		finalMap.Levels.splice(index, 1);
		reIndexEntireMap();
		// If the selected checkpoint is in the deleted level, clear selection
		if (selectedCheckpoint && levelToDelete.Checkpoints.some(cp => selectedCheckpoint && cp.Index === selectedCheckpoint.Index)) {
			selectedCheckpoint = null;
		}
		finalMap = finalMap; // Trigger reactivity
	}
</script>

<ul>
	<div class="level-container">
		<div class="level-item">
			<div class="level-header">
				<span>
					<strong>Spawn Point</strong>
				</span>
			</div>
		</div>
		<div class="checkpoint-details">
			<ul>
				<button
					class="checkpoint-item"
					on:click={() => (selectedCheckpoint = finalMap.Spawn)}
					class:selected={selectedCheckpoint?.Index === finalMap.Spawn.Index}
				>
					<strong>CP {finalMap.Spawn.Index}</strong>
					<div class="cp-attributes">
						{#if finalMap.Spawn.Mission && typeof finalMap.Spawn.Mission !== 'boolean' && finalMap.Spawn.Mission.MissionValues.length > 0}
							<span class="attribute-tag" title="Spawnpoint has missions."
								>Missions: {finalMap.Spawn.Mission.MissionValues.length}</span
							>
						{/if}
						{#if finalMap.Spawn.Effects && finalMap.Spawn.Effects.length > 0}
							<span class="attribute-tag" title="Spawnpoint has effects."
								>Effects: {finalMap.Spawn.Effects.length}</span
							>
						{/if}
						{#if typeof finalMap.Spawn.Prime === 'number' && finalMap.Spawn.Prime % 17 === 0}
							<span class="attribute-tag" title="Spawnpoint is effect-locked.">Effect Lock</span>
						{/if}
						{#if finalMap.Spawn.AbilityCount instanceof AbilityCountData}
							<span class="attribute-tag" title="Spawnpoint has ability count tracking.">Ability Count</span>
						{/if}
					</div>
				</button>
			</ul>
		</div>
	</div>

	{#each finalMap.Levels as level, i (level.id)}
		<CollapsibleSection
			title="Level {level.id} (CP: {level.Checkpoints[0].Index})"
			bind:expanded={expandedLevels[level.id]}
		>
			<div slot="actions">
				<ActionMenu>
					<button
						class="menu-action-button"
						on:click={() => moveLevel(i, i - 1)}
						disabled={i === 0}
					>
						<Icon path={chevronUpIcon} size={16} />
						<span>Move Up</span>
					</button>
					<button
						class="menu-action-button"
						on:click={() => moveLevel(i, i + 1)}
						disabled={i === finalMap.Levels.length - 1}
					>
						<Icon path={chevronDownIcon} size={16} />
						<span>Move Down</span>
					</button>
					<button
						class="menu-action-button delete-action"
						on:click={() => deleteLevel(i)}
					>
						<Icon path={trashIcon} size={16} />
						<span>Delete Level</span>
					</button>
				</ActionMenu>
			</div>
			<div class="checkpoint-details">
				<ul>
					{#each level.Checkpoints as checkpoint (checkpoint.Index)}
						<button
							class="checkpoint-item"
							on:click={() => (selectedCheckpoint = checkpoint)}
							class:selected={selectedCheckpoint?.Index === checkpoint.Index}
						>
							<strong>CP {checkpoint.Index}</strong>
							<div class="cp-attributes">
								{#if checkpoint.Mission && typeof checkpoint.Mission !== 'boolean' && checkpoint.Mission.MissionValues.length > 0}
									<span class="attribute-tag" title="This checkpoint has missions."
										>Missions: {checkpoint.Mission.MissionValues.length}</span
									>
								{/if}
								{#if checkpoint.Effects && checkpoint.Effects.length > 0}
									<span class="attribute-tag" title="This checkpoint has effects."
										>Effects: {checkpoint.Effects.length}</span
									>
								{/if}
								{#if typeof checkpoint.Prime === 'number' && checkpoint.Prime % 17 === 0}
									<span class="attribute-tag" title="This checkpoint is effect-locked."
										>Effect Lock</span
									>
								{/if}
								{#if checkpoint.AbilityCount instanceof AbilityCountData}
									<span class="attribute-tag" title="This checkpoint has ability count tracking.">Ability Count</span>
								{/if}
								{#if checkpoint.Teleport && checkpoint.Teleport instanceof Vector3D}
								<span class="attribute-tag" title="This checkpoint has a teleport destination."
									>TP</span
								>
								{/if}
							</div>
						</button>
					{/each}
				</ul>
			</div>
		</CollapsibleSection>
	{/each}
</ul>

<style>
	h3 {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}
	ul {
		list-style: none;
		padding: 0 0.5rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.level-container {
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		border-radius: 8px;
		background-color: var(--card-bg);
		border: 1px solid var(--border-color);
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}
	.level-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		user-select: none;
	}
	.level-header {
		flex-grow: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: none;
		border: none;
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
	}
	.level-header strong {
		font-family: monospace;
		font-size: 1rem; /* Increased font size for better readability */
	}
	.level-header .chevron {
		transition: transform 0.2s ease-in-out;
	}
	.level-header .chevron.expanded {
		transform: rotate(180deg);
	}
	.checkpoint-details {
		padding: 0.25rem;
	}
	/* UPDATED CHECKPOINT ITEM STYLES */
	.checkpoint-item {
		width: 100%;
		font-family: monospace;
		font-size: 0.9rem;
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--bg);
		border-radius: 3px;
		margin-top: 0.25rem;
		border: 1px solid transparent; /* Start with a transparent border */
		cursor: pointer;
		transition: all 0.2s;
		color: var(--text);
	}
	.checkpoint-item:hover {
		border-color: var(--primary); /* Show border on hover */
	}
	/* Add a style for the currently selected checkpoint */
	.checkpoint-item.selected {
		background-color: var(--primary);
		color: var(--primary-text);
		border-color: var(--primary);
	}
	.cp-attributes {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		justify-content: flex-start;
		margin-left: 1rem;
	}
	.attribute-tag {
		background-color: var(--card-bg);
		color: var(--text);
		padding: 0.1rem 0.3rem;
		border-radius: 6px;
		font-size: 0.7rem;
		border: 1px solid var(--border-color);
	}
	.checkpoint-item.selected .attribute-tag {
		background-color: var(--bg);
		color: var(--text);
	}
	:global(.menu-action-button) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		background: none;
		border: none;
		color: var(--text);
		text-align: left;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}
	:global(.menu-action-button:hover:not(:disabled)) {
		background-color: var(--primary);
		color: var(--primary-text);
	}
	:global(.menu-action-button:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}
	:global(.menu-action-button.delete-action) {
		color: var(--danger, #dc3545);
	}
	:global(.menu-action-button.delete-action:hover:not(:disabled)) {
		background-color: rgba(220, 53, 69, 0.12); /* light red */
		color: var(--danger, #dc3545);
	}
</style>
