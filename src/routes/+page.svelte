<script lang="ts">
	import { version } from '$app/environment'
	import { view } from '$lib/app'
	import { Editor, Overlay } from '$lib/shared/components'
</script>

<div class="relative h-screen max-h-screen grid">
	<Editor />
	<Overlay />
</div>
