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
					autogenerate: { directory: 'k8s' },
				},
				{
					label: 'Terraform',
					autogenerate: { directory: 'terraform' },
				},
				{
					label: 'Devops',
					autogenerate: { directory: 'devops' },
				},
			],
		}),
	],
});
