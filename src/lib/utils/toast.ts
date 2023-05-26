import { get, writable } from 'svelte/store'

export const send = (text: string) => {
	console.log('TOAST: ' + text)

	let toast = {
		text,
		id: next_toast_id++,
	} as Toast

	toasts.update((value) => {
		value.push(toast)
		if (value.length > 3)
			value.shift()
		return value
	})

	setTimeout(() => {
		toasts.update((value) => {
			const index = value.indexOf(toast)
			if (index > -1)
				value.splice(index, 1)
			return value
		})
	}, 3000)
}

export interface Toast {
	text: string
	id: number
}
export let next_toast_id = 1
export const toasts = writable<Toast[]>([])
