import type { Grid } from '../../types'

export interface View {
	name: string
	width: number
	height: number
	grid: Grid

	xscroll: number
	yscroll: number
	zoom: number
}
