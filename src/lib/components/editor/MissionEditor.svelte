<script lang="ts">
	import type { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import { CheckpointMissionData } from '$lib/parser-logic/parser/models/CheckpointMissionData';
	import { ALL_MISSIONS, type MissionDefinition } from '$lib/parser-logic/core/missionData';

	// This component receives the checkpoint object from its parent.
	// We use `bind:checkpoint` so that changes we make here update the parent.
	export let checkpoint: Checkpoint;
	export let onUpdate: () => void;

	// This represents a mission being edited in the UI
	interface EditableMission {
		definition: MissionDefinition;
		value: number; // For time missions, this is the time. For lock, it's 9930.
	}

	let activeMissions: EditableMission[] = [];
	let selectedMissionToAdd = '';

	$: if (checkpoint) {
		const newMissions: EditableMission[] = [];
		const missionData = checkpoint.Mission;
		if (missionData && typeof missionData !== 'boolean') {
			const primeProduct = missionData.MissionPrimeProduct;
			const activeDefinitions = ALL_MISSIONS.filter((m) => primeProduct % m.prime === 0);
			activeDefinitions.sort((a, b) => a.prime - b.prime);

			activeDefinitions.forEach((def, index) => {
				newMissions.push({
					definition: def,
					value: missionData.MissionValues[index]
				});
			});
		}
		activeMissions = newMissions;
	}

	function encodeMissions() {
		if (!checkpoint) return;

		if (activeMissions.length === 0) {
			checkpoint.Mission = null;
		} else {
			activeMissions.sort((a, b) => a.definition.prime - b.definition.prime);
			const newMissionData = new CheckpointMissionData();
			newMissionData.MissionPrimeProduct = activeMissions.reduce(
				(acc, m) => acc * m.definition.prime,
				1
			);
			newMissionData.MissionValues = activeMissions.map((m) => m.value);
			checkpoint.Mission = newMissionData;
		}
		onUpdate();
	}

	function addMission(primeString: string) {
		const prime = Number(primeString);

		// FIX #2: Add a guard clause to enforce the 4-mission limit
		if (activeMissions.length >= 4) {
			alert('A checkpoint can have a maximum of 4 missions.');
			return;
		}

		const missionDef = ALL_MISSIONS.find((m) => m.prime === prime);
		if (missionDef && !activeMissions.some((m) => m.definition.prime === prime)) {
			const newMission: EditableMission = {
				definition: missionDef,
				value: 0.1 // Start with 0.1 instead of 0.016
			};
			activeMissions = [...activeMissions, newMission];
			encodeMissions();

			// FIX #1: After adding, reset the bound variable to update the dropdown display
			selectedMissionToAdd = '';
		}
	}

	function removeMission(prime: number) {
		activeMissions = activeMissions.filter((m) => m.definition.prime !== prime);
		encodeMissions();
	}

	function toggleMissionType(missionToToggle: EditableMission) {
		const isCurrentlyLock = missionToToggle.value === 9930;
		if (isCurrentlyLock) {
			missionToToggle.value = 0.1; // Set to 0.1 instead of 0.016
		} else {
			missionToToggle.value = 9930;
		}
		encodeMissions();
	}

	function handleTimeInputChange(event: Event, mission: EditableMission) {
		const input = event.target as HTMLInputElement;
		const value = parseFloat(input.value);
		
		// Allow empty input for better UX
		if (input.value === '' || isNaN(value)) {
			return;
		}
		
		// Allow any value during typing, including 0
		mission.value = value;
		encodeMissions();
	}

	function handleTimeInputBlur(event: Event, mission: EditableMission) {
		const input = event.target as HTMLInputElement;
		const value = parseFloat(input.value);
		
		// Only validate 0 values when input is finalized (on blur)
		if (value === 0) {
			mission.value = 0.1;
			input.value = '0.1';
			encodeMissions();
		}
	}
</script>

<div class="mission-editor">
	<div class="active-missions-list">
		{#if activeMissions.length > 0}
			{#each activeMissions as mission (mission.definition.prime)}
				{@const isLock = mission.value === 9930}
				<div class="mission-item">
					<span class="mission-name">{mission.definition.name}</span>
					<div class="mission-controls">
						{#if !isLock}
							<input
								type="number"
								class="time-input"
								step="0.1"
								bind:value={mission.value}
								on:change={(event) => handleTimeInputChange(event, mission)}
								on:blur={(event) => handleTimeInputBlur(event, mission)}
							/>
						{/if}
						<button class="type-toggle" on:click={() => toggleMissionType(mission)}>
							{isLock ? 'Lock' : 'Time'}
						</button>
					</div>
					<button class="remove-btn" on:click={() => removeMission(mission.definition.prime)}>
						X
					</button>
				</div>
			{/each}
		{:else}
			<p>No missions on this checkpoint.</p>
		{/if}
	</div>

	<div class="add-mission">
		<select
			bind:value={selectedMissionToAdd}
			on:change={() => addMission(selectedMissionToAdd)}
			disabled={activeMissions.length >= 4}
		>
			<option value="" disabled>-- Add a mission --</option>
			{#each ALL_MISSIONS as missionDef}
				{#if !activeMissions.some((m) => m.definition.prime === missionDef.prime)}
					<option value={missionDef.prime}>{missionDef.name}</option>
				{/if}
			{/each}
		</select>
		{#if activeMissions.length >= 4}
			<p class="limit-reached">Maximum missions (4) reached.</p>
		{/if}
	</div>
</div>

<style>
	p {
		font-style: italic;
		opacity: 0.7;
		padding: 0.5rem;
		text-align: center;
	}
	.mission-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.active-missions-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.mission-item {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 0.75rem;
		background-color: var(--bg);
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
	}
	.mission-name {
		font-family: monospace;
		font-size: 0.9rem;
	}
	.mission-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: 5px;
	}
	.time-input {
		width: 70px;
		text-align: center;
		border: none;
		background: transparent;
		padding: 0.25rem;
		color: var(--text);
		font-size: 1rem;
		font-family: monospace;
	}
	.type-toggle {
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		background-color: var(--border-color);
		border: none;
		color: var(--text);
		border-left: 1px solid var(--border-color);
	}
	.remove-btn {
		background: none;
		border: none;
		color: var(--text);
		opacity: 0.5;
		font-weight: bold;
		cursor: pointer;
		padding: 0.25rem;
	}
	.remove-btn:hover {
		color: #dc3545;
		opacity: 1;
	}
	.add-mission select {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
		background-color: var(--bg);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 4px;
	}
	.add-mission select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.limit-reached {
		text-align: center;
		font-size: 0.8rem;
		padding-top: 0.5rem;
	}
</style>
