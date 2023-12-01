import { defineConfig } from 'vitest/config';
import { resolve, join } from 'path';
import { config } from 'dotenv';

config({ path: join(__dirname, '.env.local') });

const { TZ, ...envVars } = process.env as Record<string, string>;

export default defineConfig({
	root: '.',
	esbuild: {
		tsconfigRaw: '{}'
	},
	test: {
		clearMocks: true,
		globals: true,
		env: envVars,
		include: ['**/*/*.ts'],
		exclude: [
			'**/node_modules/**',
			'**/build/**',
			'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
			'**/.{idea,git,cache,output,temp}/**'
		],
		reporters: ['default'],
		ui: true,
		open: false,
		coverage: {
			enabled: true,
			provider: 'v8',
			reportOnFailure: true
		}
	},
	resolve: {
		alias: [{ find: '~', replacement: resolve(__dirname) }]
	}
});
