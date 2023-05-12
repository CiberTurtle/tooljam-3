<script lang="ts">
	import { smart_canvas } from '$lib/directives/canvas'
	import { onMount } from 'svelte'

	type Grid = [boolean[]]

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D

	let width = 16
	let height = 16
	let xstep = 0
	let ystep = 0

	let grid: Grid = gen_grid(width, height)

	function gen_grid(width: number, height: number): Grid {
		let cols = new Array(width) as Grid

		for (let index = 0; index < height; index++) {
			let row = new Array(height)
			row.fill(false)
			cols[index] = row
		}

		return cols
	}

	function pointerdown(event: PointerEvent) {
		const bounds = canvas.getBoundingClientRect()
		const mx = event.clientX - bounds.left
		const my = event.clientY - bounds.top
		const cx = mx / (canvas.width / width)
		const cy = my / (canvas.height / height)
		// console.log({ mx, my, cx, cy })

		// console.log(grid)
		grid[Math.floor(cx)][Math.floor(cy)] = !grid[Math.floor(cx)][Math.floor(cy)]
		render()
	}

	onMount(() => {
		if (!canvas) return
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D
		render()
	})

	function resized() {
		xstep = canvas.width / width
		ystep = canvas.height / height

		render()
	}

	function render() {
		if (!ctx) return
		ctx.imageSmoothingEnabled = false
		ctx.imageSmoothingQuality = 'low'
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		ctx.save()
		ctx.fillStyle = 'red'
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const cell = grid[x][y]

				// ctx.fillRect(x * xstep, y * ystep, xstep, ystep)
				if (cell == true) {
					ctx.fillRect(x * xstep, y * ystep, xstep, ystep)
				}
			}
		}
		ctx.restore()

		ctx.save()
		ctx.strokeStyle = 'hsl(0deg 0% 75% / 1)'
		for (let index = 1; index < width; index++) {
			ctx.moveTo(index * xstep, 0)
			ctx.lineTo(index * xstep, canvas.height)
		}
		for (let index = 1; index < height; index++) {
			ctx.moveTo(0, index * ystep)
			ctx.lineTo(canvas.width, index * ystep)
		}
		ctx.stroke()
		ctx.restore()
	}
</script>

<div class="flex flex-col bg-white">
	<!-- Header -->
	<div class="flex flex-row items-center gap-2 p-2">
		<div class="i-pixelarticons-image" />
		<h1>Flowgrid</h1>
	</div>

	<div class="relative w-full h-full">
		<canvas
			bind:this={canvas}
			class="absolute w-full h-full bg-white image-render-pixel"
			use:smart_canvas={resized}
			on:pointerdown={pointerdown}
		/>
	</div>
</div>
