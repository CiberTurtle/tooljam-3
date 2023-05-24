<script lang="ts">
	import { view } from '$lib/app'

	// Reset CSS
	import '@unocss/reset/tailwind-compat.css'
	import '@unocss/reset/sanitize/reduce-motion.css'
	// Atomic CSS
	import 'uno.css'
	// Custom CSS
	import '$lib/styles.css'

	import { load_session, save_session } from '$lib/utils'
	import { onMount } from 'svelte'

	onMount(() => {
		load_session()
		view.subscribe(save_session)
	})
</script>

<slot />

<div
	class="absolute top-0 left-0 bottom-0 right-0 p-4 bg-fg color-bg grid place-content-center gap-8 text-lg sm:text-2xl md:hidden text-center"
>
	<div class="px-6 py-2 bg-bg color-fg font-bold">The viewport is too small</div>
	Please make the window bigger or zoom out.
</div>

<style lang="postcss">
	:global(:root) {
		@apply font-sans;
		--hue: 60;

		--fg: hsl(var(--hue), 7%, 6%);
		--bg: hsl(var(--hue), 100%, 95%);
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			--fg: hsl(var(--hue), 100%, 95%);
			--bg: hsl(var(--hue), 7%, 6%);
		}
	}
</style>
