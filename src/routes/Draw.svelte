<script lang="ts">
	import { smart_canvas } from '$lib/directives/canvas'
	import { onMount } from 'svelte'
	import { generate } from './generator'

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
	let xscroll = 0
	let yscroll = 0

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
		const px = (event.clientX - bounds.left) * (canvas.width / bounds.width) + xscroll
		const py = (event.clientY - bounds.top) * (canvas.height / bounds.height) + yscroll
		const cx = px / scale
		const cy = py / scale

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

		const json = localStorage.getItem('flowgrid')
		if (json) {
			grid = JSON.parse(json)
		}

		render()
	})

	let scale = 1
	function resized() {
		xstep = canvas.width / width
		ystep = canvas.height / height
		scale = Math.min(xstep, ystep)
		xscroll = canvas.width - width * scale
		xscroll = -xscroll / 2
		console.log(xscroll)

		render()
	}

	function render() {
		if (!ctx) return
		frame_count++

		const styles = getComputedStyle(canvas)
		const fg = styles.color
		const bg = styles.getPropertyValue('--bg')

		ctx.imageSmoothingEnabled = true
		ctx.imageSmoothingQuality = 'high'

		ctx.resetTransform()

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		ctx.translate(-xscroll, -yscroll)

		ctx.fillStyle = fg
		ctx.scale(scale, scale)
		generate(ctx, grid)

		ctx.resetTransform()
		ctx.translate(-xscroll, -yscroll)
		ctx.beginPath()
		ctx.fillStyle = fg
		ctx.globalCompositeOperation = 'difference'
		for (let y = 0; y < height + 1; y++) {
			for (let x = 0; x < width + 1; x++) {
				ctx.moveTo(x * scale, y * scale)
				ctx.ellipse(x * scale, y * scale, 1, 1, 0, 0, Math.PI * 2)
			}
		}
		ctx.fill()
		ctx.globalCompositeOperation = 'source-over'

		ctx.save()
		ctx.resetTransform()
		ctx.translate(32, 32)

		ctx.fillStyle = bg
		ctx.strokeStyle = fg
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
		xscroll += event.deltaX
		yscroll += event.deltaY
		render()
	}

	function save() {
		localStorage.setItem('flowgrid', JSON.stringify(grid))
	}

	function load() {
		const json = localStorage.getItem('flowgrid')
		if (!json) {
			alert('No save data')
			return
		}

		grid = JSON.parse(json)
		render()
	}

	function clear() {
		if (!confirm('Are you sure you want to clear?')) return
		grid = gen_grid(width, height)
		render()
	}
</script>

<div class="flex flex-col">
	<!-- Header -->
	<div class="flex flex-row items-center gap-2 p-8 items-center">
		<div class="i-pixelarticons-image" />
		<h1>Flowgrid</h1>
		<span>(work in progress post-jam version)</span>
		<div class="flex-grow-1" />
		<div class="flex flex-row items-stretch h-full">
			<button on:click={clear}>Clear</button>
			<button on:click={save}>Save</button>
			<button on:click={load}>Load</button>
		</div>
	</div>

	<div class="relative w-full h-full">
		<canvas
			bind:this={canvas}
			class="absolute w-full h-full"
			use:smart_canvas={resized}
			on:pointerdown={pointerdown}
			on:pointermove={pointermove}
			on:wheel={wheel}
		/>
	</div>
</div>
