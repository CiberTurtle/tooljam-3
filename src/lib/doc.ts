export interface Doc {
	name: String
	width: number
	height: number
	layers: DocLayer[]
}

export interface DocLayer {
	name?: String
	color?: String

	data: DocLayerData
}

export type DocLayerData = [boolean[]]
