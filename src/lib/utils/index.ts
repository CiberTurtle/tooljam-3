import type { Grid } from '$lib/types'

export * from './download'
export * from './generator'
export * from './export'
export * from './session'
export * as toast from './toast'

export function generate_grid(width: number, height: number): Grid {
	let grid = new Array(width) as Grid
	for (let index = 0; index < width; index++) {
		grid[index] = new Array(height).fill(false)
	}
	return grid
}
