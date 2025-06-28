<script lang="ts">
	import type { Checkpoint } from '$lib/parser-logic/core/models/Checkpoint';
	import { primeSwitchMap } from '$lib/parser-logic/core/primeDecoder';

	export let checkpoint: Checkpoint;
	export let onUpdate: () => void;

	const editablePrimes = Object.entries(primeSwitchMap).map(([p, d]) => ({
		prime: Number(p),
		description: d
	}));

	// This function is now simplified, as the button itself passes the prime and its current state
	function togglePrime(prime: number, isCurrentlyChecked: boolean) {
		let currentPrimeProduct = typeof checkpoint.Prime === 'number' ? checkpoint.Prime : 1;

		// If the attribute is being turned ON (it was not checked before)
		if (!isCurrentlyChecked) {
			if (currentPrimeProduct % prime !== 0) currentPrimeProduct *= prime;
		}
		// If the attribute is being turned OFF (it was checked before)
		else {
			if (currentPrimeProduct % prime === 0) currentPrimeProduct /= prime;
		}
		checkpoint.Prime = currentPrimeProduct;
		onUpdate();
	}
</script>

<div class="tag-list">
	{#each editablePrimes as { prime, description }}
		{@const isLocked = prime === 11 || prime === 13}
		{@const isChecked = typeof checkpoint.Prime === 'number' && checkpoint.Prime % prime === 0}

		<button
			class="attribute-tag"
			class:active={isChecked}
			class:locked={isLocked}
			disabled={isLocked}
			on:click={() => togglePrime(prime, isChecked)}
			title={isLocked ? 'This attribute is locked' : description}
		>
			{description}
		</button>
	{/each}
</div>

<style>
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.attribute-tag {
		padding: 0.5rem 1rem;
		border-radius: 999px; /* This creates the pill shape */
		font-size: 0.9rem;
		font-family: monospace;
		cursor: pointer;
		transition: all 0.2s;

		/* --- UPDATED STYLES FOR THE DEFAULT/INACTIVE STATE --- */
		/* It now has a subtle background and a stronger border to look more interactive */
		background-color: var(--bg);
		border: 1px solid var(--border-color);
		color: var(--text);
	}

	.attribute-tag:hover:not(:disabled):not(.active) {
		border-color: var(--primary);
		color: var(--primary);
	}

	/* Active/Selected state is unchanged */
	.attribute-tag.active {
		background-color: var(--primary);
		color: var(--primary-text);
		border-color: var(--primary);
		opacity: 1; /* Ensure active tags are fully opaque */
	}

	/* The locked style now just has reduced opacity, making it distinct */
	.attribute-tag.locked {
		cursor: not-allowed;
		opacity: 0.4;
	}
</style>
