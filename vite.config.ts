import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'/@': path.resolve(__dirname, 'src')
		}
	},
	plugins: [sveltekit()]
});
