import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';

const { handle: handle2 } = SvelteKitAuth({
	providers: [Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })],
	secret: AUTH_SECRET,
	trustHost: true,
	basePath: '/auth'
});

export const handle = (input) => {
	console.log('input', input);
	return handle2(input);
};
