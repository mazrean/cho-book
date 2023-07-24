<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	export let user: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
	}|null;
</script>

<div class="uk-navbar-container tm-navbar-container uk-sticky uk-active uk-sticky-below uk-sticky-fixed">
	<header class="uk-container uk-container-expand">
		<nav class="uk-navbar">
			<div class="uk-navbar-left">
				<a href="/" class="uk-navbar-item uk-logo">重Book</a>
					<ul class="uk-navbar-nav">
						<li class={$page.url.pathname === '/' ? 'uk-active' : undefined}>
							<a href="/">Home</a>
						</li>
						<li class={$page.url.pathname === '/about' ? 'uk-active' : undefined}>
							<a href="/about">About</a>
						</li>
						<li class={$page.url.pathname.startsWith('/sverdle') ? 'uk-active' : undefined}>
							<a href="/sverdle">Sverdle</a>
						</li>
					</ul>
			</div>
			<div class="uk-navbar-right">
				{#if user?.image}
					<img src={user.image} alt={user?.name}>
				{:else}
					<button on:click={() => signIn('github')}>Sign In with Google</button>
				{/if}
			</div>
		</nav>
	</header>
</div>

<style>
	img {
		height: 80%;
		border-radius:50%;
	}
</style>
