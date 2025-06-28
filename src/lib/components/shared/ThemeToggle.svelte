<script lang="ts">
	import theme from '$lib/themeStore';
	import Icon from './Icon.svelte';
	import { sunIcon, moonIcon } from '$lib/icons';

	function setTheme(newTheme: 'light' | 'dark') {
		theme.set(newTheme);
	}
</script>

<div class="flex space-x-2 rounded-full bg-gray-200 p-1.5 dark:bg-zinc-900">
	<button
		class="flex items-center justify-center rounded-full p-2 transition-all duration-200
           {$theme === 'light'
			? 'bg-white shadow-md text-zinc-800' /* Shadow is stronger ('shadow-md') */
			: 'text-gray-500 hover:text-zinc-800 dark:text-gray-400 dark:hover:text-white'}"
		on:click={() => setTheme('light')}
		title="Light Mode"
	>
		<Icon path={sunIcon} size={22} />
	</button>

	<button
		class="flex items-center justify-center rounded-full p-2 transition-all duration-200
           {$theme === 'dark'
			? 'bg-zinc-700 shadow-md text-white' /* Shadow is stronger ('shadow-md') */
			: 'text-gray-500 hover:text-zinc-800 dark:text-gray-400 dark:hover:text-white'}"
		on:click={() => setTheme('dark')}
		title="Dark Mode"
	>
		<Icon path={moonIcon} size={22} />
	</button>
</div>
