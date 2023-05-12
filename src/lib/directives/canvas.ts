export function smart_canvas(canvas: HTMLCanvasElement, resized: () => void): any {
	const parent = canvas.parentElement
	if (!parent)
		throw new Error('Cannot be smart canvas. This canvas has no parent.')

	const resize_observer = new ResizeObserver(
		(entries, observer) => {
			_smart_canvas_on_resize(canvas, entries[0])
			resized()
		}
	)
	try {
		resize_observer.observe(parent, { box: 'device-pixel-content-box' })
	}
	catch {
		resize_observer.observe(parent, { box: 'content-box' })
	}

	return {
		destroy() {
			resize_observer.disconnect()
		}
	}
}

// based from: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
function _smart_canvas_on_resize(canvas: HTMLCanvasElement, entry: ResizeObserverEntry): void {
	if (entry.devicePixelContentBoxSize) {
		// rounding just in case
		canvas.width = Math.round(entry.devicePixelContentBoxSize[0].inlineSize)
		canvas.height = Math.round(entry.devicePixelContentBoxSize[0].blockSize)

		return
	}

	let dpr = window.devicePixelRatio

	if (entry.contentBoxSize) {
		if (entry.contentBoxSize[0]) {
			canvas.width = Math.round(entry.contentBoxSize[0].inlineSize * dpr)
			canvas.height = Math.round(entry.contentBoxSize[0].blockSize * dpr)
			return
		}
		// legacy (ignore the errors)
		canvas.width = Math.round(entry.contentBoxSize.inlineSize * dpr)
		canvas.height = Math.round(entry.contentBoxSize.blockSize * dpr)
		return
	}
	// super legacy
	canvas.width = Math.round(entry.contentRect.width * dpr)
	canvas.height = Math.round(entry.contentRect.height * dpr)
}
