import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'My Docs',
			social: {
				github: 'https://github.com/withastro/starlight',
			},
			sidebar: [
				{
					label: 'Kubernetes',
					autogenerate: { directory: 'Kubernetes' },
				},
				{
					label: 'Terraform',
					autogenerate: { directory: 'Terraform' },
				},
				{
					label: 'Devops',
					autogenerate: { directory: 'Devops' },
				},
				{
					label: 'Linux',
					autogenerate: { directory: 'Linux' },
				},
			],
		}),
	],
});
