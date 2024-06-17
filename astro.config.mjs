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
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', link: '/guides/example/' },
					],
				},
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
