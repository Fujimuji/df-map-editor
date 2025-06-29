<script lang="ts">
	import { slide } from 'svelte/transition';
	import Icon from '$lib/components/shared/Icon.svelte';
	import { downArrowIcon } from '$lib/icons';

	export let title: string;
	export let expanded: boolean = true;
</script>

<div class="collapsible-section">
	<div class="section-header-container">
		<button class="section-header" on:click={() => (expanded = !expanded)}>
			<h4>{title}</h4>
			<span class="chevron" class:expanded>
				<Icon path={downArrowIcon} size={16} />
			</span>
		</button>
		<div class="actions">
			<slot name="actions" />
		</div>
	</div>

	{#if expanded}
		<div class="section-content" transition:slide={{ duration: 200 }}>
			<slot />
		</div>
	{/if}
</div>

<style>
	.collapsible-section {
		border: 1px solid var(--border-color);
		background-color: var(--card-bg);
		border-radius: 8px;
	}
	.section-header-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 0.5rem; /* Space for the actions menu */
	}
	.section-header-container:hover {
		background-color: var(--bg-hover);
	}
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-grow: 1;
		width: 100%;
		background: none;
		border: none;
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
		padding: 1rem 1.5rem;
	}
	.section-header h4 {
		margin: 0;
	}
	.chevron {
		transition: transform 0.2s ease-in-out;
	}
	.chevron.expanded {
		transform: rotate(180deg);
	}
	.section-content {
		padding: 1.5rem;
		border-top: 1px solid var(--border-color);
		margin-top: -1px; /* Aligns content border with header bottom border */
	}
	.actions {
		flex-shrink: 0; /* Prevents the action menu from shrinking */
	}
</style>
