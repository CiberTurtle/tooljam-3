import type { Grid } from '../../types'

export interface View {
	state: EditorState

	name: string
	width: number
	height: number
	grid: Grid

	xscroll: number
	yscroll: number
	zoom: number
}

export enum EditorState {
	Edit = 'edit',
	ExportRegion = 'export_region',
}
