// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import rehypeMermaid from 'rehype-mermaid';
import { readFileSync } from 'fs';

import cloudflare from '@astrojs/cloudflare';

// Load custom language grammars
const birdGrammar = JSON.parse(
    readFileSync('./src/grammars/bird.tmLanguage.json', 'utf-8')
);
const frrGrammar = JSON.parse(
    readFileSync('./src/grammars/frr.tmLanguage.json', 'utf-8')
);

// https://astro.build/config
export default defineConfig({
  site: 'https://anycast.guide',

  integrations: [
      sitemap(),
      starlight({
          title: 'anycast.guide',
          description: 'DIY anycast networking: learn BGP, health checks, and operations patterns.',
          editLink: {
              baseUrl: 'https://github.com/junepark678/anycast_guide/edit/main/',
          },
          social: [
              {
                  icon: 'github',
                  label: 'GitHub',
                  href: 'https://github.com/junepark678/anycast_guide',
              },
          ],
          customCss: ['./src/styles/custom.css'],
          expressiveCode: {
              shiki: {
                  langs: [
                      // Custom languages for network config
                      {
                          ...birdGrammar,
                          aliases: ['bird', 'bird2'],
                      },
                      {
                          ...frrGrammar,
                          aliases: ['frr', 'frrouting', 'cisco', 'conf', 'vtysh'],
                      },
                  ],

              },
          },
          sidebar: [
              {
                  label: 'Getting Started',
                  items: [
                      { label: 'What is Anycast?', slug: 'getting-started/what-is-anycast' },
                      { label: 'Prerequisites', slug: 'getting-started/prerequisites' },
                      { label: 'Architecture Patterns', slug: 'getting-started/architecture' },
                  ],
              },
              {
                  label: 'Resources & Registration',
                  items: [
                      { label: 'Acquiring IP Space', slug: 'resources/acquiring-ip-space' },
                      { label: 'Acquiring an ASN', slug: 'resources/acquiring-asn' },
                      { label: 'IRR & RPKI Setup', slug: 'resources/irr-rpki' },
                      { label: 'Provider Requirements', slug: 'resources/provider-requirements' },
                  ],
              },
              {
                  label: 'Guides',
                  items: [
                      { label: 'BIRD Setup', slug: 'guides/bird-setup' },
                      { label: 'FRRouting Setup', slug: 'guides/frr-setup' },
                      { label: 'Provider Setup', slug: 'guides/provider-setup' },
                      { label: 'DNS Anycast', slug: 'guides/dns-anycast' },
                      { label: 'Health Checks & Failover', slug: 'guides/health-checks' },
                  ],
              },
              {
                  label: 'Reference',
                  items: [
                      { label: 'BGP Attributes', slug: 'reference/bgp-attributes' },
                      { label: 'BIRD Configuration', slug: 'reference/bird-config' },
                      { label: 'FRR Configuration', slug: 'reference/frr-config' },
                      { label: 'Troubleshooting', slug: 'reference/troubleshooting' },
                  ],
              },
              // {
              // 	label: 'Step-by-Step Example',
              // 	items: [
              // 		{ label: 'Overview', slug: 'example/overview' },
              // 		{ label: 'Step 1: IPs & ASN', slug: 'example/step-1' },
              // 		{ label: 'Step 2: IRR & RPKI', slug: 'example/step-2' },
              // 		{ label: 'Step 3: BGP Setup', slug: 'example/step-3' },
              // 		{ label: 'Step 4: Provider Setup', slug: 'example/step-4' },
              // 		{ label: 'Step 5: DNS Anycast', slug: 'example/step-5' },
              // 		{ label: 'Step 6: Health Checks', slug: 'example/step-6' },
              // 	],
              // },
              {
                  label: 'Appendix',
                  items: [
                      { label: 'Glossary', slug: 'appendix/glossary' },
                      { label: 'RIR Policy Comparison', slug: 'appendix/policy-comparison' },
                  ],
              },
          ],
          components: {
              Head: './src/components/Head.astro',
          }
      }),
	],

  markdown: {
      rehypePlugins: [
          [rehypeMermaid, { strategy: 'pre-mermaid' }]
          // rehypeMermaid
      ]
	},

  adapter: cloudflare()
});