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
	let header_height = 0
	let footer_height = 64

	let xscroll = 0
	let yscroll = 0
	let xoffset = 0
	let yoffset = 0

	let zoom = 1
	let cell_scale = 1

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
		event.preventDefault()

		pointer_down = true
		document.addEventListener(
			'pointerup',
			(ev) => {
				if (ev.pointerId != event.pointerId) return
				pointer_down = false
			},
			{ once: true }
		)

		const point = transform_point(event)
		if (point.ix < 0 || point.iy < 0 || point.ix >= width || point.iy >= height) return

		fill_value = !grid[point.ix][point.iy]
		grid[point.ix][point.iy] = fill_value

		render()
	}

	function pointermove(event: PointerEvent) {
		event.preventDefault()

		if (!pointer_down) return

		const point = transform_point(event)

		if (point.ix < 0 || point.iy < 0 || point.ix >= width || point.iy >= height) return

		const value = grid[point.ix][point.iy]
		if (value == fill_value) return
		grid[point.ix][point.iy] = fill_value

		render()
	}

	function transform_point(event: PointerEvent): PointInfo {
		const bounds = canvas.getBoundingClientRect()
		let px = (event.clientX - bounds.left) * (canvas.width / bounds.width)
		let py = (event.clientY - bounds.top) * (canvas.height / bounds.height)
		px -= xoffset
		py -= yoffset
		px += xscroll
		py += yscroll
		let cx = px / cell_scale
		let cy = py / cell_scale

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

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
			render()
		})

		render()
	})

	function resized() {
		cell_scale = (canvas.height - header_height - footer_height) / height

		xoffset = (canvas.width - width * cell_scale) / 2
		yoffset =
			(canvas.height - header_height - footer_height - height * cell_scale) / 2 + header_height

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

		ctx.translate(xoffset - xscroll, yoffset - yscroll)

		ctx.fillStyle = fg
		ctx.scale(cell_scale * zoom, cell_scale * zoom)
		generate(ctx, grid)

		ctx.resetTransform()
		ctx.translate(xoffset - xscroll, yoffset - yscroll)
		ctx.beginPath()
		ctx.fillStyle = fg
		ctx.globalCompositeOperation = 'difference'
		for (let y = 0; y < height + 1; y++) {
			for (let x = 0; x < width + 1; x++) {
				ctx.moveTo(x * cell_scale * zoom, y * cell_scale * zoom)
				ctx.ellipse(x * cell_scale * zoom, y * cell_scale * zoom, 1, 1, 0, 0, Math.PI * 2)
			}
		}
		ctx.fill()
		ctx.globalCompositeOperation = 'source-over'

		ctx.save()
		ctx.resetTransform()
		ctx.translate(64, canvas.height - 64)

		ctx.fillStyle = bg
		ctx.strokeStyle = fg
		ctx.lineCap = 'round'
		ctx.lineWidth = 2

		ctx.beginPath()
		ctx.ellipse(0, 0, 24, 24, 0, 0, Math.PI * 2)
		ctx.fill()

		ctx.beginPath()
		ctx.ellipse(0, 0, 20, 20, 0, 0, Math.PI * 2)
		ctx.stroke()

		ctx.rotate((frame_count / 12) * Math.PI * 2)

		ctx.beginPath()
		ctx.moveTo(0, 0)
		ctx.lineTo(12, 0)
		ctx.stroke()

		ctx.restore()
	}

	function wheel(event: WheelEvent) {
		event.preventDefault()

		if (event.ctrlKey) {
			zoom -= (event.deltaY / window.screen.height) * 10
			zoom = Math.min(Math.max(zoom, 1), 4)
			render()
			return
		}

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
		//if (!confirm('Are you sure you want to clear?')) return
		grid = gen_grid(width, height)
		render()
	}
</script>

<div class="relative flex flex-col">
	<canvas
		bind:this={canvas}
		class="absolute w-full h-full"
		use:smart_canvas={resized}
		on:pointerdown={pointerdown}
		on:pointermove={pointermove}
		on:wheel={wheel}
	/>

	<!-- Header -->
	<div class="flex flex-row items-center gap-2 p-8 items-center" bind:clientHeight={header_height}>
		<div class="i-pixelarticons-image min-w-6 min-h-6" />
		<h1>Flowgrid</h1>
		<!-- <span>(work in progress post-jam version)</span> -->
		<div class="flex-grow-1" />
		<div class="flex flex-row items-stretch h-full">
			<button on:click={save}>Save</button>
			<div class="bg-fg h-full" />
			<button on:click={load}>Load</button>
			<button on:click={clear}>Clear</button>
		</div>
	</div>
</div>
