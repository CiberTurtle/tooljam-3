<script lang="ts">
	import { smart_canvas } from '$lib/directives/canvas'
	import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui'
	import { onMount } from 'svelte'
	import { optimize } from 'svgo'
	import { CircleGeneratorDriver, PathDriver, SvgPathDriver, generate } from './generator'

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
	let canvas_generator = new CircleGeneratorDriver()
	let path_driver = new PathDriver()
	let svg_path_driver = new SvgPathDriver()
	let header_height = 96
	let footer_height = 96

	let xscroll = 0
	let yscroll = 0
	let xoffset = 0
	let yoffset = 0

	function get_scale(): number {
		return base_scale * zoom
	}
	let base_scale = 1
	let zoom = 1

	let width = 32
	let height = 16

	let grid: Grid = gen_grid(width, height)

	let frame_count = 0

	function gen_grid(width: number, height: number): Grid {
		let cols = new Array(width) as Grid

		for (let index = 0; index < width; index++) {
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

		regenerate()
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

		regenerate()
		render()
	}

	function transform_point(event: { clientX: number; clientY: number }): PointInfo {
		const bounds = canvas.getBoundingClientRect()
		let px = (event.clientX - bounds.left) * (canvas.width / bounds.width)
		let py = (event.clientY - bounds.top) * (canvas.height / bounds.height)
		px -= xoffset
		py -= yoffset
		px += xscroll
		py += yscroll
		let cx = px / get_scale()
		let cy = py / get_scale()

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

		regenerate()
		render()
	})

	function resized() {
		base_scale = (canvas.height - header_height - footer_height) / height

		xoffset = (canvas.width - width * get_scale()) / 2
		yoffset =
			(canvas.height - header_height - footer_height - height * get_scale()) / 2 + header_height

		render()
	}

	function regenerate() {
		path_driver.path = new Path2D()
		canvas_generator.driver = path_driver
		generate(canvas_generator, grid)
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
		ctx.scale(get_scale(), get_scale())
		ctx.fill(path_driver.path)

		ctx.resetTransform()
		ctx.translate(xoffset - xscroll, yoffset - yscroll)
		ctx.beginPath()
		ctx.fillStyle = fg
		ctx.strokeStyle = fg
		ctx.lineWidth = 4
		// ctx.globalCompositeOperation = 'difference'
		const dot_size = lerp(0.5, 2, smoothstep(0.5, 1, zoom))
		for (let y = 0; y <= height; y++) {
			for (let x = 0; x <= width; x++) {
				ctx.moveTo(x * get_scale(), y * get_scale())
				ctx.ellipse(x * get_scale(), y * get_scale(), dot_size, dot_size, 0, 0, Math.PI * 2)
			}
		}
		ctx.strokeRect(0, 0, width * get_scale(), height * get_scale())
		ctx.fill()
		// ctx.globalCompositeOperation = 'source-over'

		ctx.save()
		ctx.resetTransform()
		ctx.translate(64, canvas.height - 64)

		ctx.fillStyle = bg
		ctx.strokeStyle = fg
		ctx.lineCap = 'round'
		ctx.lineWidth = 4

		ctx.beginPath()
		ctx.ellipse(0, 0, 24, 24, 0, 0, Math.PI * 2)
		ctx.fill()

		ctx.beginPath()
		ctx.ellipse(0, 0, 20, 20, 0, 0, Math.PI * 2)
		ctx.stroke()

		ctx.rotate((frame_count / 12) * Math.PI * 2)

		ctx.beginPath()
		ctx.moveTo(0, 0)
		ctx.lineTo(10, 0)
		ctx.stroke()

		ctx.restore()
	}

	function lerp(a: number, b: number, t: number): number {
		return a * (1 - t) + b * t
	}

	function smoothstep(min: number, max: number, value: number) {
		var x = Math.max(0, Math.min(1, (value - min) / (max - min)))
		return x * x * (3 - 2 * x)
	}

	function wheel(event: WheelEvent) {
		event.preventDefault()

		if (event.ctrlKey) {
			const old_point = transform_point(event)
			const old_zoom = zoom

			zoom *= event.deltaY > 0 ? 0.975 : 1.025
			zoom = Math.min(Math.max(zoom, 0.5), 2)

			const new_point = transform_point(event)
			const zoom_delta = zoom - old_zoom

			// TODO: Make this work properly
			xscroll -= (new_point.cx - old_point.cx) * get_scale()
			yscroll -= (new_point.cy - old_point.cy) * get_scale()
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
		width = grid.length
		height = grid[0].length
		regenerate()
		render()
	}

	function clear() {
		//if (!confirm('Are you sure you want to clear?')) return
		grid = gen_grid(width, height)
		regenerate()
		render()
	}

	function export_svg() {
		svg_path_driver.str = ''
		canvas_generator.driver = svg_path_driver
		generate(canvas_generator, grid)
		let svg = `<svg version="1.1" width="${width * 20}" height="${
			height * 20
		}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" stroke="none" d="${
			svg_path_driver.str
		}" /></svg>`

		svg = optimize(svg, { multipass: true }).data

		save_file('unnamed.svg', svg, 'image/svg+xml')
	}

	function save_file(filename: string, content: any, type = 'image/svg+xml') {
		// Create element with <a> tag
		const link = document.createElement('a')

		// Create a blog object with the file content which you want to add to the file
		const file = new Blob([content], { type })

		// Add file content in the object URL
		link.href = URL.createObjectURL(file)

		// Add file name
		link.download = filename

		// Add click event to <a> tag to save file.
		link.click()
		URL.revokeObjectURL(link.href)
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

	<!-- Floating -->
	<div class="color-bg dark:color-fg mix-blend-difference">
		<!-- Top Left -->
		<div class="absolute top-8 left-8 min-h-8 flex flex-row items-center gap-2 items-center">
			<div class="i-pixelarticons-image min-w-6 min-h-6" />
			<h1>Flowgrid</h1>
			<span>(work in progress post-jam version)</span>
		</div>

		<!-- Top right -->
		<div class="absolute top-8 right-8 min-h-8 flex flex-row items-center gap-2 items-center">
			<div class="flex flex-row items-stretch self-stretch">
				<button on:click={save}>Save</button>
				<button on:click={load}>Load</button>
				<button on:click={clear}>Clear</button>
				<Popover class="relative">
					<PopoverButton>Solutions</PopoverButton>

					<PopoverPanel class="absolute z-10 w-96 bg-fg color-bg isolate">
						Hello world
						<button on:click={export_svg}>Export</button>
					</PopoverPanel>
				</Popover>
			</div>
		</div>

		<!-- Bottom right -->
		<div class="absolute bottom-8 right-8 min-h-8 flex flex-row items-center gap-2 items-center">
			<div class="flex flex-row items-stretch self-stretch">
				{#if xscroll != 0 || yscroll != 0 || zoom != 1}
					<button
						on:click={() => {
							xscroll = 0
							yscroll = 0
							zoom = 1
							render()
						}}>Center</button
					>
				{/if}
			</div>
		</div>
	</div>
</div>
