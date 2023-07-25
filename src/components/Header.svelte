<script lang="ts">

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
			</div>
			<div class="uk-navbar-right">
				{#if user?.image}
					<img src={user.image} alt={user?.name}>
				{/if}
			</div>
		</nav>
	</header>
</div>

<style>
	img {
		height: 50%;
		border-radius:50%;
	}
</style>
