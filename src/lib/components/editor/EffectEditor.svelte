<script lang="ts">
	import type { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import { EffectInstanceData } from '$lib/parser-logic/parser/models/EffectInstanceData';
	import { Vector3D } from '$lib/parser-logic/parser/models/Vector3D';
	import { EffectBounceData } from '$lib/parser-logic/parser/models/EffectBounceData';
	import { decodeEffect } from '$lib/parser-logic/core/effectDecoder';
	import Icon from '$lib/components/shared/Icon.svelte';
	import VectorInput from '$lib/components/shared/VectorInput.svelte';
	import CollapsibleSection from '$lib/components/shared/CollapsibleSection.svelte';
	import ActionMenu from '$lib/components/shared/ActionMenu.svelte';
	import { chevronUpIcon, chevronDownIcon, trashIcon } from '$lib/icons';

	export let checkpoint: Checkpoint;
	export let onUpdate: () => void;

	const EFFECT_TYPES = [
		{ status: 0, name: 'Time Effect' },
		{ status: 1, name: 'Death Effect' },
		{ status: 2, name: 'Ability Effect' },
		{ status: 3, name: 'Permeation Effect' },
		{ status: 4, name: 'Checkpoint Effect' },
		{ status: 'portal', name: 'Portal (Entry + Exit)', isPaired: true },
		{ status: 7, name: 'Blackhole Effect' },
		{ status: 'zipline', name: 'Zipline (Start + End)', isPaired: true },
		{ status: 10, name: 'Shootable Orb Effect' },
		{ status: 11, name: 'Bounce Effect' }
	];

	// Prime attributes for effects that support them
	const PRIME_ATTRIBUTES: { [key: number]: string } = {
		2: 'Punch Disabled',
		3: 'Uppercut Disabled', 
		5: 'Slam Disabled',
		7: 'Force Stall',
		11: 'No Change to Abilities',
		29: 'Empowered Punch',
		31: 'Collision not changed'
	};

	// Bounce effect types
	const BOUNCE_TYPES = [
		{ type: 'bounce', name: 'Normal Bounce', power: 1.0 },
		{ type: 'stall', name: 'Stall Effect', power: 0.016 },
		{ type: 'stop', name: 'Stop Effect', power: 0.0 }
	];

	let selectedEffectType = '';

	function addEffect(statusString: string) {
		if (!checkpoint) return;

		if (statusString === 'zipline') {
			addZiplinePair();
		} else if (statusString === 'portal') {
			addPortalPair();
		} else {
			const status = Number(statusString);
			let value = 1;
			if (status === 1) value = 1; // Death effect
			else if (status === 11) { // Bounce effect
				const bounceData = new EffectBounceData(new Vector3D(0, 1, 0), 1.0);
				value = bounceData as any; // Type assertion for now
			}

			const newEffect = new EffectInstanceData(
				new Vector3D(0, 0, 0),
				2,
				status,
				value
			);

			if (!checkpoint.Effects) {
				checkpoint.Effects = [];
			}
			
			checkpoint.Effects.push(newEffect);
			checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
			onUpdate();
		}
		selectedEffectType = '';
	}

	function addZiplinePair() {
		if (!checkpoint) return;

		if (!checkpoint.Effects) {
			checkpoint.Effects = [];
		}

		// Create zipline start (status 8, radius 0)
		const ziplineStart = new EffectInstanceData(
			new Vector3D(0, 0, 0),
			0, // radius 0 for start
			8, // status 8 for zipline start
			0  // value doesn't matter
		);

		// Create zipline end (status 9, radius 1)
		const ziplineEnd = new EffectInstanceData(
			new Vector3D(5, 0, 0), // Default offset for end point
			1, // radius 1 for end
			9, // status 9 for zipline end
			0  // value doesn't matter
		);

		checkpoint.Effects.push(ziplineStart, ziplineEnd);
		checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
		onUpdate();
	}

	function addPortalPair() {
		if (!checkpoint) return;

		if (!checkpoint.Effects) {
			checkpoint.Effects = [];
		}

		// Create portal entry (status 5)
		const portalEntry = new EffectInstanceData(
			new Vector3D(0, 0, 0),
			2, // default radius
			5, // status 5 for entry portal
			1  // default prime value (must be 1, not 0)
		);

		// Create portal exit (status 6)
		const portalExit = new EffectInstanceData(
			new Vector3D(10, 0, 0), // Default offset for exit
			2, // default radius
			6, // status 6 for exit portal
			1  // default prime value (must be 1, not 0)
		);

		checkpoint.Effects.push(portalEntry, portalExit);
		checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
		onUpdate();
	}

	function removePairedEffects(startIndex: number) {
		if (!checkpoint.Effects) return;

		// For ziplines: remove start (8) and end (9) pairs
		if (checkpoint.Effects[startIndex].Status === 8 && 
			startIndex + 1 < checkpoint.Effects.length && 
			checkpoint.Effects[startIndex + 1].Status === 9) {
			checkpoint.Effects.splice(startIndex, 2);
		}
		// For portals: remove entry (5) and exit (6) pairs
		else if (checkpoint.Effects[startIndex].Status === 5 && 
				 startIndex + 1 < checkpoint.Effects.length && 
				 checkpoint.Effects[startIndex + 1].Status === 6) {
			checkpoint.Effects.splice(startIndex, 2);
		}
		// For single effects or mismatched pairs, just remove the one
		else {
			checkpoint.Effects.splice(startIndex, 1);
		}

		checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
		onUpdate();
	}

	function movePairedEffects(fromIndex: number, toIndex: number) {
		if (!checkpoint.Effects) return;

		let itemsToMove: EffectInstanceData[] = [];
		let moveCount = 1;

		// Check if this is part of a paired effect
		if (checkpoint.Effects[fromIndex].Status === 8 && 
			fromIndex + 1 < checkpoint.Effects.length && 
			checkpoint.Effects[fromIndex + 1].Status === 9) {
			// Zipline pair
			itemsToMove = checkpoint.Effects.splice(fromIndex, 2);
			moveCount = 2;
		} else if (checkpoint.Effects[fromIndex].Status === 5 && 
				   fromIndex + 1 < checkpoint.Effects.length && 
				   checkpoint.Effects[fromIndex + 1].Status === 6) {
			// Portal pair
			itemsToMove = checkpoint.Effects.splice(fromIndex, 2);
			moveCount = 2;
		} else {
			// Single effect
			itemsToMove = checkpoint.Effects.splice(fromIndex, 1);
		}

		// Adjust target index if we're moving multiple items
		let adjustedToIndex = toIndex;
		if (fromIndex < toIndex && moveCount > 1) {
			adjustedToIndex -= moveCount - 1;
		}

		checkpoint.Effects.splice(adjustedToIndex, 0, ...itemsToMove);
		checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
		onUpdate();
	}

	function isPairedEffectStart(effect: EffectInstanceData, index: number): boolean {
		return (effect.Status === 8 && 
				index + 1 < checkpoint.Effects.length && 
				checkpoint.Effects[index + 1].Status === 9) ||
			   (effect.Status === 5 && 
				index + 1 < checkpoint.Effects.length && 
				checkpoint.Effects[index + 1].Status === 6);
	}

	function isPairedEffectEnd(effect: EffectInstanceData, index: number): boolean {
		return (effect.Status === 9 && 
				index > 0 && 
				checkpoint.Effects[index - 1].Status === 8) ||
			   (effect.Status === 6 && 
				index > 0 && 
				checkpoint.Effects[index - 1].Status === 5);
	}

	function getPairedEffectName(effect: EffectInstanceData, index: number): string {
		if (effect.Status === 8) return 'Zipline (Start + End)';
		if (effect.Status === 5) return 'Portal (Entry + Exit)';
		return decodeEffect(effect).name;
	}

	function removeEffect(index: number) {
		if (checkpoint.Effects) {
			checkpoint.Effects.splice(index, 1);
			checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
			onUpdate();
		}
	}

	function moveEffect(fromIndex: number, toIndex: number) {
		if (checkpoint.Effects) {
			const itemToMove = checkpoint.Effects.splice(fromIndex, 1)[0];
			checkpoint.Effects.splice(toIndex, 0, itemToMove);
			checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
			onUpdate();
		}
	}

	function updateEffect() {
		if (checkpoint.Effects) {
			checkpoint.Effects = checkpoint.Effects; // Trigger reactivity
			onUpdate();
		}
	}

	function togglePrime(prime: number, effect: EffectInstanceData) {
		let currentPrime = Math.abs(effect.Value);
		
		if (currentPrime % prime === 0) {
			currentPrime /= prime;
		} else {
			currentPrime *= prime;
		}
		
		// Handle mutual exclusivity between ability disable primes and "No Change to Abilities"
		if (prime === 11 && currentPrime % 11 === 0) {
			// Remove ability disable primes (2, 3, 5)
			currentPrime = currentPrime / (currentPrime % 2 === 0 ? 2 : 1) / (currentPrime % 3 === 0 ? 3 : 1) / (currentPrime % 5 === 0 ? 5 : 1);
		} else if ([2, 3, 5].includes(prime) && currentPrime % prime === 0) {
			// Remove "No Change to Abilities" if any ability disable prime is selected
			if (currentPrime % 11 === 0) currentPrime /= 11;
		}
		
		effect.Value = effect.Value < 0 ? -currentPrime : currentPrime;
		updateEffect();
	}

	function toggleLightShaft(effect: EffectInstanceData) {
		// For bounce effects, check if it's a stop effect (power = 0)
		if (effect.Status === 11 && (effect.Value instanceof EffectBounceData || (effect.Value && typeof effect.Value === 'object' && 'Power' in effect.Value))) {
			if (effect.Value.Power === 0) {
				// Can't make stop effects into lightshafts
				return;
			}
		}
		
		effect.Radius = effect.Radius < 0 ? Math.abs(effect.Radius) : -Math.abs(effect.Radius);
		updateEffect();
	}

	function toggleShootable(effect: EffectInstanceData) {
		effect.Radius = effect.Radius < 0 ? Math.abs(effect.Radius) : -Math.abs(effect.Radius);
		updateEffect();
	}

	function supportsLightShaft(status: number): boolean {
		return [1, 2, 3, 11].includes(status);
	}

	function supportsShootable(status: number): boolean {
		return status === 0; // Only Time Effect
	}

	function supportsTimeValue(status: number): boolean {
		return status === 0;
	}

	function supportsPrimeAttributes(status: number): boolean {
		return [2, 3, 4, 5, 6, 10].includes(status);
	}

	function isPortalEffect(status: number): boolean {
		return status === 5 || status === 6;
	}

	function isZiplineEffect(status: number): boolean {
		return status === 8 || status === 9;
	}

	function isBounceEffect(status: number): boolean {
		return status === 11;
	}

	function getPrimeAttributesForEffect(status: number): number[] {
		const basePrimes = [2, 3, 5, 11, 29];
		if (status === 3) return [...basePrimes, 31]; // Permeation effect
		if (status === 4) return [...basePrimes, 7]; // Checkpoint effect
		return basePrimes;
	}

	function isPrimeActive(prime: number, effect: EffectInstanceData): boolean {
		return Math.abs(effect.Value) % prime === 0;
	}

	function getDisplayRadius(effect: EffectInstanceData): number {
		return Math.abs(effect.Radius);
	}

	function setDisplayRadius(effect: EffectInstanceData, value: number) {
		const sign = effect.Radius < 0 ? -1 : 1;
		effect.Radius = sign * value;
		updateEffect();
	}

	function getBounceType(effect: EffectInstanceData): string {
		// Handle both EffectBounceData instances and plain objects
		if (effect.Value instanceof EffectBounceData || (effect.Value && typeof effect.Value === 'object' && 'Power' in effect.Value)) {
			const power = effect.Value.Power;
			if (power === 0) return 'stop';
			if (power === 0.016) return 'stall';
			// Any other power value (including between 0 and 0.016) is normal bounce
			return 'bounce';
		}
		return 'bounce';
	}

	function handlePowerInput(effect: EffectInstanceData, newPower: number) {
		if (effect.Value instanceof EffectBounceData || (effect.Value && typeof effect.Value === 'object' && 'Power' in effect.Value)) {
			// For normal bounce, only allow values >= 1
			if (newPower < 0.017) {
				effect.Value.Power = 0.017;
			} else {
				effect.Value.Power = newPower;
			}
			
			// Force reactivity
			effect.Value = {
				Direction: effect.Value.Direction,
				Power: effect.Value.Power
			};
			updateEffect();
		}
	}
</script>

<div class="effect-editor">
	<div class="active-effects-list">
		{#if checkpoint.Effects && checkpoint.Effects.length > 0}
			{#each checkpoint.Effects as effect, i (effect)}
				{@const decoded = decodeEffect(effect)}
				{@const effectId = `effect-${i}`}
				{@const isPairedStart = isPairedEffectStart(effect, i)}
				{@const isPairedEnd = isPairedEffectEnd(effect, i)}
				
				{#if !isPairedEnd}
					<CollapsibleSection title={getPairedEffectName(effect, i)} expanded={false}>
						<div slot="actions" class="effect-actions">
							<ActionMenu>
								<button 
									on:click={() => movePairedEffects(i, i - 1)} 
									disabled={i === 0} 
									title="Move Effect Up"
									class="menu-action-button"
								>
									<Icon path={chevronUpIcon} size={16} />
									<span>Move Up</span>
								</button>
								<button
									on:click={() => movePairedEffects(i, i + 1)}
									disabled={i >= checkpoint.Effects.length - (isPairedStart ? 2 : 1)}
									title="Move Effect Down"
									class="menu-action-button"
								>
									<Icon path={chevronDownIcon} size={16} />
									<span>Move Down</span>
								</button>
								<button 
									on:click={() => removePairedEffects(i)} 
									title="Remove Effect"
									class="menu-action-button"
								>
									<Icon path={trashIcon} size={16} />
									<span>Delete</span>
								</button>
							</ActionMenu>
						</div>

						<div class="effect-edit-panel">
							{#if isPairedStart}
								<!-- Paired Effect UI -->
								{#if effect.Status === 8}
									<!-- Zipline Pair -->
									<div class="paired-effect-section">
										<div class="paired-points">
											<div class="point-section">
												<h5>Start Point</h5>
												<VectorInput 
													label="Position (X, Y, Z)" 
													bind:vector={effect.Position} 
													onInput={updateEffect} 
												/>
											</div>
											<div class="point-section">
												<h5>End Point</h5>
												<VectorInput 
													label="Position (X, Y, Z)" 
													bind:vector={checkpoint.Effects[i + 1].Position} 
													onInput={updateEffect} 
												/>
											</div>
										</div>
									</div>
								{:else if effect.Status === 5}
									<!-- Portal Pair -->
									<div class="paired-effect-section">
										<div class="paired-points">
											<div class="point-section">
												<h5>Entry Portal</h5>
												<VectorInput 
													label="Position (X, Y, Z)" 
													bind:vector={effect.Position} 
													onInput={updateEffect} 
												/>
												{#if supportsPrimeAttributes(effect.Status)}
													<div class="edit-section">
														<label>Prime Attributes:</label>
														<div class="prime-attributes">
															{#each getPrimeAttributesForEffect(effect.Status) as prime}
																{@const isActive = isPrimeActive(prime, effect)}
																<button 
																	class="toggle-pill"
																	class:active={isActive}
																	on:click={() => togglePrime(prime, effect)}
																>
																	{PRIME_ATTRIBUTES[prime]}
																</button>
															{/each}
														</div>
													</div>
												{/if}
											</div>
											<div class="point-section">
												<h5>Exit Portal</h5>
												<VectorInput 
													label="Position (X, Y, Z)" 
													bind:vector={checkpoint.Effects[i + 1].Position} 
													onInput={updateEffect} 
												/>
												{#if supportsPrimeAttributes(checkpoint.Effects[i + 1].Status)}
													<div class="edit-section">
														<label>Prime Attributes:</label>
														<div class="prime-attributes">
															{#each getPrimeAttributesForEffect(checkpoint.Effects[i + 1].Status) as prime}
																{@const isActive = isPrimeActive(prime, checkpoint.Effects[i + 1])}
																<button 
																	class="toggle-pill"
																	class:active={isActive}
																	on:click={() => togglePrime(prime, checkpoint.Effects[i + 1])}
																>
																	{PRIME_ATTRIBUTES[prime]}
																</button>
															{/each}
														</div>
													</div>
												{/if}
											</div>
										</div>
									</div>
								{/if}
							{:else}
								<!-- Single Effect UI (existing code) -->
								<div class="edit-section">
									<VectorInput 
										label="Position (X, Y, Z)" 
										bind:vector={effect.Position} 
										onInput={updateEffect} 
									/>
								</div>

								{#if !isPortalEffect(effect.Status) && !isZiplineEffect(effect.Status)}
									<div class="edit-section">
										<label for="{effectId}-radius">Radius:</label>
										<input 
											id="{effectId}-radius"
											type="number" 
											step="0.1" 
											value={getDisplayRadius(effect)}
											on:input={(e) => {
												const target = e.target as HTMLInputElement;
												setDisplayRadius(effect, Number(target.value));
											}}
										/>
									</div>
								{/if}

								{#if supportsLightShaft(effect.Status)}
									{@const isStopEffect = effect.Status === 11 && effect.Value instanceof EffectBounceData && effect.Value.Power === 0}
									<div class="edit-section">
										<button 
											class="toggle-pill"
											class:active={effect.Radius < 0}
											class:disabled={isStopEffect}
											on:click={() => toggleLightShaft(effect)}
											disabled={isStopEffect}
										>
											Light Shaft
										</button>
									</div>
								{/if}

								{#if supportsShootable(effect.Status)}
									<div class="edit-section">
										<button 
											class="toggle-pill"
											class:active={effect.Radius < 0}
											on:click={() => toggleShootable(effect)}
										>
											Shootable
										</button>
									</div>
								{/if}

								{#if supportsTimeValue(effect.Status)}
									<div class="edit-section">
										<label for="{effectId}-time">Time Value:</label>
										<input 
											id="{effectId}-time"
											type="number" 
											step="0.1" 
											bind:value={effect.Value} 
											on:input={updateEffect}
										/>
									</div>
								{/if}

								{#if supportsPrimeAttributes(effect.Status)}
									<div class="edit-section">
										<label>Prime Attributes:</label>
										<div class="prime-attributes">
											{#each getPrimeAttributesForEffect(effect.Status) as prime}
												{@const isActive = isPrimeActive(prime, effect)}
												<button 
													class="toggle-pill"
													class:active={isActive}
													on:click={() => togglePrime(prime, effect)}
												>
													{PRIME_ATTRIBUTES[prime]}
												</button>
											{/each}
										</div>
									</div>
								{/if}

								{#if isBounceEffect(effect.Status)}
									<div class="edit-section">
										<label>Bounce Type:</label>
										<div class="bounce-types">
											{#each BOUNCE_TYPES as bounceType}
												<button 
													class="toggle-pill"
													class:active={getBounceType(effect) === bounceType.type}
													on:click={() => {
														console.log('Clicked bounce type:', bounceType.type);
														console.log('Effect value type:', typeof effect.Value, effect.Value);
														console.log('Is EffectBounceData:', effect.Value instanceof EffectBounceData);
														// Update the bounce data - handle both instances and plain objects
														if (effect.Value instanceof EffectBounceData || (effect.Value && typeof effect.Value === 'object' && 'Power' in effect.Value)) {
															console.log('Setting power to:', bounceType.power);
															effect.Value.Power = bounceType.power;
															// Set direction to (0,1,0) for stall and stop effects
															if (bounceType.type === 'stall' || bounceType.type === 'stop') {
																effect.Value.Direction = new Vector3D(0, 1, 0);
															}
															// For normal bounce, keep current direction or set default
															if (bounceType.type === 'bounce') {
																// If current direction is (0,1,0) (from stall/stop), set a default direction
																if (effect.Value.Direction.X === 0 && effect.Value.Direction.Y === 1 && effect.Value.Direction.Z === 0) {
																	effect.Value.Direction = new Vector3D(0, 1, 0);
																}
															}
															// If switching to stop effect, disable lightshaft
															if (bounceType.type === 'stop' && effect.Radius < 0) {
																effect.Radius = Math.abs(effect.Radius);
															}
															// Force reactivity by creating a new object
															effect.Value = {
																Direction: effect.Value.Direction,
																Power: effect.Value.Power
															};
															console.log('Updated effect value:', effect.Value);
														} else {
															console.log('Effect value is not a bounce effect!');
														}
														updateEffect();
													}}
												>
													{bounceType.name}
												</button>
											{/each}
										</div>
									</div>

									{#if effect.Value instanceof EffectBounceData || (effect.Value && typeof effect.Value === 'object' && 'Power' in effect.Value)}
										{#if getBounceType(effect) === 'bounce'}
											<div class="edit-section">
												<VectorInput 
													vector={effect.Value.Direction}
													label="Direction"
													onInput={updateEffect}
												/>
											</div>

											<div class="edit-section">
												<label for="{effectId}-power">Power:</label>
												<input 
													id="{effectId}-power"
													type="number" 
													step="0.001" 
													min="0.017"
													bind:value={effect.Value.Power} 
													on:input={(e) => {
														const target = e.target as HTMLInputElement;
														handlePowerInput(effect, Number(target.value));
													}}
												/>
											</div>
										{/if}
									{/if}
								{/if}
							{/if}
						</div>
					</CollapsibleSection>
				{/if}
			{/each}
		{:else}
			<p class="no-effects">No effects on this checkpoint.</p>
		{/if}
	</div>

	<div class="add-effect">
		<select
			bind:value={selectedEffectType}
			on:change={() => addEffect(selectedEffectType)}
		>
			<option value="" disabled>-- Add an effect --</option>
			{#each EFFECT_TYPES as effectType}
				<option value={effectType.status}>{effectType.name}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.effect-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.active-effects-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.effect-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.effect-edit-panel {
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
	.edit-section input[type="number"]:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
	.toggle-pill:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.toggle-pill:disabled:hover {
		transform: none;
		border-color: var(--border-color);
	}
	.prime-attributes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.bounce-types {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.help-text {
		display: block;
		font-size: 0.875rem;
		color: var(--text-muted);
		font-style: italic;
	}
	.add-effect select {
		width: 100%;
		padding: 0.75rem;
		font-size: 0.95rem;
		background: var(--bg);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: border-color 0.2s;
	}
	.add-effect select:focus {
		outline: none;
		border-color: var(--primary);
	}
	.add-effect select option {
		background: var(--bg);
		color: var(--text);
	}
	.no-effects {
		font-style: italic;
		opacity: 0.7;
		padding: 0.5rem;
		text-align: center;
	}
	.paired-effect-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.paired-effect-section h4 {
		margin: 0;
		color: var(--text);
		font-size: 1.1rem;
		font-weight: 600;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.5rem;
	}
	.paired-points {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	.point-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: var(--bg-secondary);
	}
	.point-section h5 {
		margin: 0;
		color: var(--text);
		font-size: 1rem;
		font-weight: 600;
		text-align: center;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	@media (max-width: 768px) {
		.paired-points {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
