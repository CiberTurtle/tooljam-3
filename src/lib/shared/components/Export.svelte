<script lang="ts">
	import { generator, view } from '$lib/app'
	import { create_svg, download } from '$lib/utils'

	export let open = false

	let scale_factor = 1

	function download_svg() {
		const svg = create_svg($view, $generator, { scale_factor })
		const filename = ($view.name || 'unnamed') + '.svg'
		const type = 'image/svg+xml'
		download(filename, svg, type)
	}

	function copy_data_url() {
		const svg = create_svg($view, $generator, { scale_factor })
		const svg_uri = encodeURIComponent(svg)
		const data_url = 'data:image/svg+xml,' + svg_uri
		navigator.clipboard.writeText(data_url)
	}
</script>

{#if open}
	<div class="flex flex-col p-6 border-4 border-fg bg-bg color-fg">
		<div class="flex flex-row mb-4">
			<h1 class="flex-grow">Export</h1>
			<button class="flat px-2" on:click={() => (open = false)}>
				<div class="i-pixelarticons-close min-w-6 min-h-6" />
			</button>
		</div>

		<label>
			<span> Scale factor </span>
			<input type="number" bind:value={scale_factor} min="1" />
		</label>

		<div class="flex flex-col gap-2 mt-4">
			<div class="flex flex-row gap-2">
				<button class="flex-grow" on:click={download_svg}>
					<div class="i-pixelarticons-download min-w-6 min-h-6" />
					Download SVG
				</button>

				<button class="px-2" on:click={copy_data_url} title="Copy Data URL">
					<div class="i-pixelarticons-copy min-w-6 min-h-6" />
				</button>
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	button:not(.flat) {
		@apply py-2 bg-fg color-bg;
	}

	label {
		@apply relative;
	}

	input {
		@apply appearance-none bg-transparent px-4 py-2 outline outline-2 outline-fg;
	}

	label > span {
		@apply select-none absolute left-2 -top-4 px-2 bg-bg;
	}
</style>
