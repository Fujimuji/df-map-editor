// src/lib/themeStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// The type now only allows 'light' or 'dark'
type Theme = 'light' | 'dark';

// The new, simpler logic: check local storage, otherwise default to 'light'.
const initialValue: Theme = browser
	? ((window.localStorage.getItem('theme') as Theme) ?? 'light')
	: 'light';

const theme = writable<Theme>(initialValue);

theme.subscribe((value) => {
	if (browser) {
		// Save the preference to local storage
		window.localStorage.setItem('theme', value);

		// The logic is now much simpler: if the theme is 'dark', add the class.
		if (value === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
});

export default theme;
