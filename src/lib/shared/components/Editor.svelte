<script lang="ts">
	import { smart_canvas } from '$lib/directives'
	import { onMount } from 'svelte'
	import { PathDriver, generate } from '$lib/utils'
	import { generator, view } from '$lib/app'

	type PointInfo = {
		px: number
		py: number
		cx: number
		cy: number
		ix: number
		iy: number
	}

	let cursor = 'default'

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let path_driver = new PathDriver()
	let padding = 96

	let xoffset = 0
	let yoffset = 0

	function get_scale(): number {
		return base_scale * $view.zoom
	}
	let base_scale = 1

	let frame_count = 0

	let fill_value = true
	let pointer_down = false
	let drag_xorigin = 0
	let drag_yorigin = 0
	let drag_xscroll = 0
	let drag_yscroll = 0
	function pointerdown(event: PointerEvent) {
		event.preventDefault()
		if (document.activeElement) (document.activeElement as HTMLElement).blur()

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
		console.log(event.buttons)

		if (event.buttons == 1) {
			if (point.ix < 0 || point.iy < 0 || point.ix >= $view.width || point.iy >= $view.height)
				return

			fill_value = !$view.grid[point.ix][point.iy]
			$view.grid[point.ix][point.iy] = fill_value

			regenerate()
			render()
		} else {
			drag_xorigin = event.clientX
			drag_yorigin = event.clientY
			drag_xscroll = $view.xscroll
			drag_yscroll = $view.yscroll
		}
	}

	function pointermove(event: PointerEvent) {
		event.preventDefault()
		const point = transform_point(event)

		cursor = 'default'
		if (point.cx > $view.width) cursor = 'ew-resize'

		if (!pointer_down) return

		console.log(event.buttons)
		if (event.buttons == 1) {
			if (point.ix < 0 || point.iy < 0 || point.ix >= $view.width || point.iy >= $view.height)
				return

			const value = $view.grid[point.ix][point.iy]
			if (value == fill_value) return
			$view.grid[point.ix][point.iy] = fill_value

			regenerate()
			render()
		} else {
			$view.xscroll = drag_xorigin - event.clientX + drag_xscroll
			$view.yscroll = drag_yorigin - event.clientY + drag_yscroll
			render()
		}
	}

	function transform_point(event: { clientX: number; clientY: number }): PointInfo {
		const bounds = canvas.getBoundingClientRect()
		let px = (event.clientX - bounds.left) * (canvas.width / bounds.width)
		let py = (event.clientY - bounds.top) * (canvas.height / bounds.height)
		px -= xoffset
		py -= yoffset
		px += $view.xscroll
		py += $view.yscroll
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

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render)

		regenerate()
		render()

		view.regenerate = regenerate
		view.render = render
	})

	function resized() {
		const pad = padding * window.devicePixelRatio

		base_scale = Math.min(
			(canvas.width - pad * 2) / $view.width,
			(canvas.height - pad * 2) / $view.height
		)

		xoffset = (canvas.width - pad * 2 - $view.width * get_scale()) / 2 + pad
		yoffset = (canvas.height - pad * 2 - $view.height * get_scale()) / 2 + pad

		render()
	}

	function regenerate() {
		path_driver.path = new Path2D()
		$generator.driver = path_driver
		generate($generator, $view)
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

		ctx.translate(xoffset - $view.xscroll, yoffset - $view.yscroll)

		ctx.fillStyle = fg
		ctx.scale(get_scale(), get_scale())
		ctx.fill(path_driver.path)

		ctx.resetTransform()
		ctx.translate(xoffset - $view.xscroll, yoffset - $view.yscroll)
		ctx.beginPath()
		ctx.fillStyle = fg
		// ctx.strokeStyle = fg
		ctx.strokeStyle = 'hsl(60deg, 100%, 75%)'
		ctx.lineWidth = 2
		// ctx.globalCompositeOperation = 'difference'
		const dot_size = lerp(0.0, 2, smoothstep(0.5, 1, $view.zoom))
		for (let y = 1; y < $view.height; y++) {
			for (let x = 1; x < $view.width; x++) {
				ctx.moveTo(x * get_scale(), y * get_scale())
				ctx.ellipse(x * get_scale(), y * get_scale(), dot_size, dot_size, 0, 0, Math.PI * 2)
			}
		}
		ctx.strokeRect(0, 0, $view.width * get_scale(), $view.height * get_scale())
		ctx.fill()
		// ctx.globalCompositeOperation = 'source-over'
		return

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
			const old_zoom = $view.zoom

			$view.zoom *= event.deltaY > 0 ? 0.975 : 1.025
			$view.zoom = Math.min(Math.max($view.zoom, 0.5), 2)
			const zoom_delta = $view.zoom - old_zoom
			if (zoom_delta == 0) return

			const new_point = transform_point(event)

			// TODO: Make this work properly
			$view.xscroll -= (new_point.cx - old_point.cx) * get_scale()
			$view.yscroll -= (new_point.cy - old_point.cy) * get_scale()
			render()
			return
		}

		$view.xscroll += event.deltaX
		$view.yscroll += event.deltaY

		render()
	}
</script>

<canvas
	bind:this={canvas}
	class="absolute w-full h-full cursor-crosshair"
	use:smart_canvas={resized}
	on:pointerdown={pointerdown}
	on:pointermove={pointermove}
	on:wheel={wheel}
	on:contextmenu|preventDefault
	style="cursor: {cursor};"
/>
