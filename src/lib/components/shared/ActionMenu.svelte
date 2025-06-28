<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Icon from './Icon.svelte';
	import { moreVerticalIcon } from '$lib/icons';

	let isOpen = false;
	let menuButtonElement: HTMLButtonElement;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	// This function closes the menu if the user clicks anywhere that isn't the menu button.
	function handleClickOutside(event: MouseEvent) {
		if (isOpen && !menuButtonElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	onMount(() => {
		window.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		window.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="action-menu-container">
	<button
		bind:this={menuButtonElement}
		class="menu-button"
		on:click|stopPropagation={toggleMenu}
		title="Actions"
		aria-label="Level Actions Menu"
	>
		<Icon path={moreVerticalIcon} />
	</button>

	{#if isOpen}
		<div class="menu-dropdown">
			<slot />
		</div>
	{/if}
</div>

<style>
	/* All styles are unchanged */
	.action-menu-container {
		position: relative;
	}
	.menu-button {
		background: transparent;
		border: 1px solid transparent;
		color: var(--text);
		opacity: 0.6;
		cursor: pointer;
		border-radius: 6px;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		min-width: 32px;
		min-height: 32px;
	}
	.menu-button:hover {
		opacity: 1;
		background-color: var(--bg-secondary);
		border-color: var(--border-color);
	}
	.menu-button:active {
		background-color: var(--primary);
		color: var(--primary-text);
	}
	.menu-dropdown {
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 0.5rem;
		background-color: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 10;
		min-width: 150px;
	}
</style>
