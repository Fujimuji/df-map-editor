<script lang="ts">
	export let path: string;
	export let size: number = 20;
	export let ariaLabel: string = '';
</script>

<svg 
	width={size} 
	height={size} 
	viewBox="0 0 24 24" 
	fill="currentColor"
	role={ariaLabel ? 'img' : 'presentation'}
	aria-label={ariaLabel || undefined}
	aria-hidden={!ariaLabel}
>
	<path d={path} />
</svg>
