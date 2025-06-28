<script lang="ts">
	import '../app.css';
</script>

<slot />

<style>
	/* We use the :global() modifier to make the following styles apply to the whole page,
     even though they are inside a component's scoped style tag. */
	:global(:root) {
		/* These are our CSS variables for the default (light) theme */
		--bg: #f8f9fa;
		--text: #212529;
		--card-bg: #ffffff;
		--border-color: #dee2e6;
		--primary: #007bff;
		--primary-text: #ffffff;
		--ghost-bg: #d1e7fd;
	}

	:global(.dark) {
		/* When the .dark class is present, these variables override the default ones */
		--bg: #121212;
		--text: #e0e0e0;
		--card-bg: #1e1e1e;
		--border-color: #444444;
		--primary: #0d6efd;
		--primary-text: #ffffff;
		--ghost-bg: #0d2a4c;
	}

	:global(body) {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background-color: var(--bg);
		color: var(--text);
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
</style>
