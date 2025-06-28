<script lang="ts">
	import type { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import { onMount } from 'svelte';
	import { RadiusVAGoBackData } from '$lib/parser-logic/parser/models/RadiusVAGoBackData';
	import { Vector3D } from '$lib/parser-logic/parser/models/Vector3D';

	// Import our new, specialized editor components
	import VectorInput from '$lib/components/shared/VectorInput.svelte';
	import PrimeAttributeEditor from './PrimeAttributeEditor.svelte';
	import MissionEditor from './MissionEditor.svelte';
	import EffectEditor from './EffectEditor.svelte';
	import CollapsibleSection from '$lib/components/shared/CollapsibleSection.svelte';

	export let checkpoint: Checkpoint;
	export let onUpdate: () => void;

	// This logic remains here as it applies to the whole checkpoint
	onMount(() => {
		if (!checkpoint.Position) {
			checkpoint.Position = new Vector3D(0, 0, 0);
		}
		if (!checkpoint.RadiusVAGoBack) {
			checkpoint.RadiusVAGoBack = new RadiusVAGoBackData(2, 0, checkpoint.Index - 1);
		}
	});
</script>

<div class="inspector-container">
	<div class="inspector-header">
		<h2>Editing Checkpoint {checkpoint.Index}</h2>
	</div>

	<CollapsibleSection title="Location & Size">
		<div class="property-grid">
			{#if checkpoint.Position}
				<VectorInput
					label="Position (X, Y, Z)"
					bind:vector={checkpoint.Position}
					onInput={onUpdate}
				/>
			{/if}
			{#if checkpoint.RadiusVAGoBack}
				<label
					><span>Radius</span><input
						type="number"
						step="0.1"
						bind:value={checkpoint.RadiusVAGoBack.Radius}
						on:input={onUpdate}
					/></label
				>
			{/if}
		</div>
	</CollapsibleSection>

	{#if (checkpoint.Teleport && checkpoint.Teleport instanceof Vector3D) || (checkpoint.HiddenCpTt && typeof checkpoint.HiddenCpTt === 'object')}
		<CollapsibleSection title="Teleport Properties">
			<div class="property-grid">
				{#if checkpoint.Teleport instanceof Vector3D}
					<VectorInput
						label="TP Destination (X, Y, Z)"
						bind:vector={checkpoint.Teleport}
						onInput={onUpdate}
					/>
				{/if}
				{#if checkpoint.HiddenCpTt && typeof checkpoint.HiddenCpTt === 'object'}
					{@const hiddenCpData = checkpoint.HiddenCpTt}
					<label
						><span>TP Radius</span><input
							type="number"
							step="0.1"
							bind:value={hiddenCpData.TeleportRadius}
							on:input={onUpdate}
						/></label
					>
				{/if}
			</div>
		</CollapsibleSection>
	{/if}

	<CollapsibleSection title="Prime Attributes">
		<PrimeAttributeEditor {checkpoint} {onUpdate} />
	</CollapsibleSection>
	<CollapsibleSection title="Missions">
		<MissionEditor {checkpoint} {onUpdate} />
	</CollapsibleSection>
	<CollapsibleSection title="Effects">
		<EffectEditor {checkpoint} {onUpdate} />
	</CollapsibleSection>
</div>

<style>
	.inspector-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.inspector-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1.8rem;
		border-bottom: 1px solid var(--border-color);
	}
	h2 {
		margin: 0;
	}
	.property-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: monospace;
		font-size: 0.9rem;
	}
	input[type='number'] {
		font-size: 1rem;
		font-family: monospace;
		padding: 0.5rem;
		background-color: var(--bg);
		border: 1px solid var(--border-color);
		color: var(--text);
		border-radius: 4px;
		width: 100%;
	}
</style>
