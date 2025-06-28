<script lang="ts">
	import type { Vector3D } from '$lib/parser-logic/parser/models/Vector3D';

	// The component receives the vector object to bind to, and a label to display.
	export let vector: Vector3D;
	export let label: string;
	export let onInput: (value: Vector3D) => void = () => {};

	// This local variable holds the string representation (e.g., "10.1, 20.2, 30.3")
	let stringValue: string = '';

	// This is a Svelte "reactive statement". It runs whenever the 'vector' prop changes.
	// It formats the X, Y, Z numbers into the string for the input box.
	$: if (vector) {
		stringValue = `${vector.X}, ${vector.Y}, ${vector.Z}`;
	}

	// This function runs every time the user types in the input box.
	function handleInput(event: Event) {
		const inputElement = event.target as HTMLInputElement;
		const parts = inputElement.value.split(',');

		// Only update the data if the string is a valid set of 3 numbers
		if (parts.length === 3) {
			const numX = parseFloat(parts[0]);
			const numY = parseFloat(parts[1]);
			const numZ = parseFloat(parts[2]);

			if (!isNaN(numX) && !isNaN(numY) && !isNaN(numZ)) {
				// Update the original vector object's properties.
				// Because of the 'bind:vector' we'll use later, Svelte updates the parent.
				vector.X = numX;
				vector.Y = numY;
				vector.Z = numZ;
				onInput(vector);
			}
		}
	}
</script>

<label>
	<span>{label}</span>
	<input type="text" bind:value={stringValue} on:input={handleInput} />
</label>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: monospace;
		font-size: 0.9rem;
	}
	input {
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
