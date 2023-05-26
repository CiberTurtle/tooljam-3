import { version } from '$app/environment'
import { view } from '$lib/app'
import type { View } from '$lib/models/interfaces'
import { toast } from '$lib/utils'
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
		toast.send("Welcome to Flowgrid!")
		return
	}

	let session = JSON.parse(session_json) as Session
	if (!session) {
		toast.send("Not loading previous session because session is corrupt")
		return
	}

	if (session.version != version) {
		toast.send("Not loading previous session because session is from a different version")
		return
	}

	if (session.is_loading) {
		toast.send("Not loading previous session because previous session caused a crash")
		return
	}

	if (false && import.meta.env.DEV) {
		console.log('Ignoring session because we are in developer mode')
		return
	}

	session.is_loading = true
	session_json = JSON.stringify(session)
	localStorage.setItem(SESSION_KEY, session_json)

	view.set({ ...get(view), ...session.view })
	view.regenerate()
	view.render()

	toast.send('Restored session')
}
