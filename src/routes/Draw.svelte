<script lang="ts">
	import { smart_canvas } from '$lib/directives/canvas'
	import { onMount } from 'svelte'
	import { generate, inner_curve, outer_curve } from './generator'

	type Grid = [boolean[]]
	type PointInfo = {
		px: number
		py: number
		cx: number
		cy: number
		ix: number
		iy: number
	}

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let scrollX = 0
	let scrollY = 0

	let width = 16
	let height = 16
	let xstep = 0
	let ystep = 0

	let grid: Grid = gen_grid(width, height)

	let frame_count = 0

	function gen_grid(width: number, height: number): Grid {
		let cols = new Array(width) as Grid

		for (let index = 0; index < height; index++) {
			let row = new Array(height)
			row.fill(false)
			cols[index] = row
		}

		return cols
	}

	let fill_value = true
	let pointer_down = false
	function pointerdown(event: PointerEvent) {
		const point = transform_point(event)

		fill_value = !grid[point.ix][point.iy]
		grid[point.ix][point.iy] = fill_value

		pointer_down = true
		document.addEventListener(
			'pointerup',
			(ev) => {
				if (ev.pointerId != event.pointerId) return
				pointer_down = false
			},
			{ once: true }
		)

		render()
	}

	function pointermove(event: PointerEvent) {
		if (!pointer_down) return

		const point = transform_point(event)

		const value = grid[point.ix][point.iy]
		if (value == fill_value) return

		grid[point.ix][point.iy] = fill_value
		render()
	}

	function transform_point(event: PointerEvent): PointInfo {
		const bounds = canvas.getBoundingClientRect()
		const px = (event.clientX - bounds.left) * (canvas.width / bounds.width) + scrollX
		const py = (event.clientY - bounds.top) * (canvas.height / bounds.height) + scrollY
		const cx = px / (canvas.width / width)
		const cy = py / (canvas.height / height)

		return {
			px,
			py,
			cx,
			cy,
			ix: Math.floor(cx),
			iy: Math.floor(cy),
		}
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
		frame_count++

		ctx.imageSmoothingEnabled = true
		ctx.imageSmoothingQuality = 'medium'
		ctx.resetTransform()

		ctx.fillStyle = 'white'
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		ctx.translate(-scrollX, -scrollY)

		ctx.fillStyle = 'black'
		ctx.scale(xstep, ystep)
		generate(ctx, grid)

		// ctx.strokeStyle = 'hsl(0deg 0% 50% / .5)'
		// ctx.resetTransform()
		// ctx.translate(-scrollX, -scrollY)
		// ctx.beginPath()
		// for (let index = 1; index < width; index++) {
		// 	ctx.moveTo(index * xstep, 0)
		// 	ctx.lineTo(index * xstep, canvas.height)
		// }
		// for (let index = 1; index < height; index++) {
		// 	ctx.moveTo(0, index * ystep)
		// 	ctx.lineTo(canvas.width, index * ystep)
		// }
		// ctx.stroke()

		// ctx.resetTransform()
		// ctx.translate(-scrollX, -scrollY)
		// ctx.fillStyle = 'white'
		// ctx.globalCompositeOperation = 'difference'
		// for (let y = 0; y < height + 1; y++) {
		// 	for (let x = 0; x < width + 1; x++) {
		// 		ctx.fillRect(x * xstep - 1, y * ystep - 1, 3, 3)
		// 	}
		// }
		// ctx.globalCompositeOperation = 'source-over'

		ctx.save()
		ctx.resetTransform()
		ctx.translate(24, 24)

		ctx.fillStyle = 'white'
		ctx.strokeStyle = 'black'
		ctx.lineCap = 'round'
		ctx.lineWidth = 2

		ctx.beginPath()
		ctx.ellipse(0, 0, 20, 20, 0, 0, Math.PI * 2)
		ctx.fill()

		ctx.beginPath()
		ctx.ellipse(0, 0, 16, 16, 0, 0, Math.PI * 2)
		ctx.stroke()

		ctx.rotate((frame_count / 12) * Math.PI * 2)

		ctx.beginPath()
		ctx.moveTo(0, 0)
		ctx.lineTo(10, 0)
		ctx.stroke()

		ctx.restore()
	}

	function wheel(event: WheelEvent) {
		return
		scrollX += event.deltaX
		scrollY += event.deltaY
		render()
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
			class="absolute w-full h-full bg-white"
			use:smart_canvas={resized}
			on:pointerdown={pointerdown}
			on:pointermove={pointermove}
			on:wheel={wheel}
		/>
	</div>
</div>
