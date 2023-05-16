<script lang="ts">
	import { setContext } from 'svelte'
	import Draw from './Draw.svelte'
	import type { Doc } from '$lib/doc'
</script>

<div class="h-screen max-h-screen grid">
	<Draw />
</div>
