import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'atheros-blog',
  title: 'Atheros — Blog',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',

  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        initial: '/blog',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      resolve: {
        locations: {
          post: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: doc?.slug
                ? [
                    { title: doc.title || 'Sem título', href: `/blog/${doc.slug}` },
                    { title: 'Lista do blog', href: '/blog' },
                  ]
                : [],
            }),
          }),
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
