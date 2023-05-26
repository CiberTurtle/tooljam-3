<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	let check = false
	let events = createEventDispatcher<{ click: { event: MouseEvent } }>()

	let timeout: number
	function click(event: MouseEvent) {
		check = true

		clearTimeout(timeout)
		timeout = setTimeout(() => {
			check = false
		}, 1000)

		events('click', { event })
	}
</script>

<button on:click={click} {...$$restProps}>
	{#if check}
		<div class="i-pixelarticons-check min-w-6 min-h-6" />
	{:else}
		<div class="i-pixelarticons-copy min-w-6 min-h-6" />
	{/if}
</button>
