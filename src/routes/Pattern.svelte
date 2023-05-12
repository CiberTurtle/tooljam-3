<script lang="ts">
	import { onMount } from 'svelte'

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D

	let canvas_width = 100
	let canvas_height = 100

	$: if (canvas_width || canvas_height) {
		render(ctx)
	}

	onMount(() => {
		if (!canvas) return
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D

		render(ctx)
	})

	function render(ctx: CanvasRenderingContext2D) {
		if (!ctx) return
		console.log('render')
		requestAnimationFrame(() => {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.fillStyle = 'white'
			ctx.font = '32px Nippo'
			ctx.fillText('Hello world', 0, 32)
			ctx.fillText('bottom', 0, canvas_height)
			ctx.stroke()
		})
	}

	function scroll(event: Event) {
		console.log(event)
	}

	function wheel(event: MouseEvent) {
		console.log(event)
	}
</script>

<div class="flex flex-col bg-[hsl(60,100%,95%)]">
	<!-- Header -->
	<div class="flex flex-row items-center gap-2 pl-4 h-16">
		<div class="i-pixelarticons-music" />
		<h1>Pattern Editor</h1>
	</div>

	<div class="w-full h-full p-2">
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
	</div>
</div>
