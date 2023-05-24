<script lang="ts">
	import { view } from '$lib/app'
	import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui'
	import Export from './Export.svelte'

	let export_open = false

	function save() {
		localStorage.setItem('flowgrid', JSON.stringify($view.grid))
	}

	function load() {
		const json = localStorage.getItem('flowgrid')
		if (!json) {
			alert('No save data')
			return
		}

		$view.grid = JSON.parse(json)
		$view.width = $view.grid.length
		$view.height = $view.grid[0].length
		view.regenerate()
		view.render()
	}

	function clear() {
		//if (!confirm('Are you sure you want to clear?')) return
		view.clear()
		view.regenerate()
		view.render()
	}

	function center() {
		$view.xscroll = 0
		$view.yscroll = 0
		$view.zoom = 1
		view.render()
	}
</script>

<!-- Top Left -->
<div class="contents">
	<div
		class="absolute top-8 left-8 min-h-8 flex flex-row items-center gap-2 items-center mix-blend-difference color-bg dark:color-fg"
	>
		<div class="i-pixelarticons-image min-w-6 min-h-6" />
		<h1>Flowgrid</h1>
	</div>

	<!-- Top right -->
	<div
		class="absolute top-8 right-8 min-h-8 flex flex-row items-center gap-2 items-center color-fg"
	>
		<div class="flex flex-row items-stretch self-stretch">
			<button on:click={save}>Save</button>
			<button on:click={load}>Load</button>
			<button on:click={clear}>Clear</button>

			<div class="relative flex flex-row items-stretch">
				<button on:click={() => (export_open = true)}>Export</button>

				<div class="absolute -right-4 -top-4">
					<Export bind:open={export_open} />
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom right -->
	<div class="absolute bottom-8 right-8 min-h-8 flex flex-row items-center gap-2 items-center">
		<div class="flex flex-row items-stretch self-stretch">
			{#if $view.xscroll != 0 || $view.yscroll != 0 || $view.zoom != 1}
				<button on:click={center}>Center</button>
			{/if}
		</div>
	</div>
</div>
