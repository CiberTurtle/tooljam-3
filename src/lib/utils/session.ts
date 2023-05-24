import { version } from '$app/environment'
import { view } from '$lib/app'
import type { View } from '$lib/models/interfaces'
import { get } from 'svelte/store'

export type Session = {
	version: String
	is_loading: boolean
	view: View
}

export const SESSION_KEY = 'flowgrid_session'

export function save_session() {
	let session = {
		version: version,
		is_loading: false,
		view: get(view),
	} as Session
	let session_json = JSON.stringify(session)
	localStorage.setItem(SESSION_KEY, session_json)

	// console.log('Saving session')
}

export function load_session() {
	let session_json = localStorage.getItem(SESSION_KEY)
	if (!session_json) {
		console.log('No session data exists')
		return
	}

	let session = JSON.parse(session_json) as Session
	if (!session) {
		console.error('Session data is null')
		return
	}

	if (session.version != version) {
		console.log('Incompatible session version')
		return
	}

	if (session.is_loading) {
		console.error('Last session crashed before during load, ignoring session')
		return
	}

	if (false && import.meta.env.DEV) {
		console.log('Ignoring session')
		return
	}

	session.is_loading = true
	session_json = JSON.stringify(session)
	localStorage.setItem(SESSION_KEY, session_json)

	view.set({ ...get(view), ...session.view })
	view.regenerate()
	view.render()

	console.log('Loaded previous session')

}
