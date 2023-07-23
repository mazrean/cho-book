<script>
	import { page } from '$app/stores';
	import github from '$lib/images/github.svg';
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
				<a href="https://github.com/sveltejs/kit">
					<img src={github} alt="GitHub" />
				</a>
			</div>
		</nav>
	</header>
</div>
