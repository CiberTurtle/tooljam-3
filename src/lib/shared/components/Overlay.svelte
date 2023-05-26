<script lang="ts">
	import { view } from '$lib/app'
	import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui'
	import Export from './Export.svelte'
	import { toast } from '$lib/utils'
	import { toasts } from '$lib/utils/toast'
	import { fade } from 'svelte/transition'

	let export_open = false

	function save() {
		localStorage.setItem('flowgrid', JSON.stringify($view.grid))
		toast.send('Saved')
	}

	function load() {
		const json = localStorage.getItem('flowgrid')
		if (!json) {
			alert('No save data found')
			return
		}

		$view.grid = JSON.parse(json)
		$view.width = $view.grid.length
		$view.height = $view.grid[0].length
		view.regenerate()
		view.render()

		toast.send('Loaded save data')
	}

	function clear() {
		//if (!confirm('Are you sure you want to clear?')) return
		toast.send('Cleared canvas')
		view.clear()
		view.regenerate()
		view.render()
	}

	function center() {
		$view.xscroll = 0
		$view.yscroll = 0
		$view.zoom = 1
		view.render()
		toast.send('Centered view')
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

	<div
		class="absolute bottom-8 left-0 right-0 pointer-events-none flex flex-col items-center gap-2 color-fg"
	>
		{#each $toasts as toast (toast.id)}
			<div
				class="bg-fg color-bg px-2 py-0.5"
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 1000 }}
			>
				{toast.text}
			</div>
		{/each}
	</div>
</div>
