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
		--fg: #ffffe3;
		--bg: #10100e;
	}
</style>
