<script>
	import { page } from '$app/stores';
	import Header from '/@/components/organs/Header.svelte';
	import '$lib/styles.scss';
	import 'uikit/dist/js/uikit.min.js';
	import 'uikit/dist/js/uikit-icons.min.js';
</script>

<div class="app vsc-initialized">
	<Header user={$page.data.session?.user ?? null} />

	<main class="uk-align-center">
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
