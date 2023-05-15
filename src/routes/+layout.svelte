<script lang="ts">
	// Reset CSS
	import '@unocss/reset/tailwind.css'
	import '@unocss/reset/sanitize/reduce-motion.css'
	// Atomic CSS
	import 'uno.css'
	// Custom CSS
	import '$lib/styles.css'
</script>

<slot />

<style lang="postcss">
	:global(body) {
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
