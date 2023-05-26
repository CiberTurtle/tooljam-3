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
		--hue: 60;
		--contrast: 10%;

		--dark: hsl(var(--hue), 5%, var(--contrast));
		--light: hsl(var(--hue), 100%, calc(100% - var(--contrast)));

		--bg: var(--light);
		--fg: var(--dark);

		@apply font-sans;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: var(--dark);
			--fg: var(--light);
		}
	}

	:global(body) {
		@apply bg-bg color-fg;
	}
</style>
