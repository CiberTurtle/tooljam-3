import { get, writable } from 'svelte/store'
import { type View, EditorState } from '$lib/models/interfaces'
import { CircleGeneratorDriver, generate_grid } from '$lib/utils'

export function create_view(width: number, height: number) {
	let store = writable<View>({
		state: EditorState.Edit,

		name: 'Unnamed',
		width: width,
		height: height,
		grid: generate_grid(width, height),

		xscroll: 0,
		yscroll: 0,
		zoom: 1,
	})

	return {
		...store,
		regenerate: () => { },
		render: () => { },
		clear: () => {
			store.update((self) => {
				self.grid = generate_grid(self.width, self.height)
				return self
			})
		},
	}
}

export const view = create_view(32, 16)
export const generator = writable(new CircleGeneratorDriver())
