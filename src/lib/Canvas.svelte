<script lang="ts">
	let canvas_width = 100
	let canvas_height = 100

	let canvas: HTMLCanvasElement
</script>

<div
	class="relative w-full h-full"
	bind:clientWidth={canvas_width}
	bind:clientHeight={canvas_height}
>
	<canvas
		class="absolute bg-black"
		bind:this={canvas}
		width={canvas_width}
		height={canvas_height}
	/>
</div>
