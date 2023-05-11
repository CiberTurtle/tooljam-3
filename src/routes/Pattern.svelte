<script lang="ts">
	import { onMount } from 'svelte'

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D

	let container_width = 16
	let container_height = 16

	onMount(() => {
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D
	})

	function scroll(event: Event) {
		console.log(event)
	}

	function wheel(event: MouseEvent) {
		console.log(event)
	}
</script>

<div class="flex flex-col bg-white">
	<!-- Header -->
	<div class="flex flex-row items-center gap-2 p-2">
		<div class="i-pixelarticons-music" />
		<h1>Pattern Editor</h1>
	</div>

	<div class="w-full h-full overflow-hidden p-2">
		<div
			class="w-full h-full"
			bind:clientWidth={container_width}
			bind:clientHeight={container_height}
		>
			<canvas
				class="w-full h-full bg-black"
				bind:this={canvas}
				on:wheel={wheel}
				on:scroll={scroll}
				width={container_width}
				height={container_height}
			/>
		</div>
	</div>
</div>
