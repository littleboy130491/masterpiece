import { defineConfig } from 'astro/config';

// Static site. Set `site`/`base` once the domain and hosting path are decided.
export default defineConfig({
  trailingSlash: 'always',
  build: { format: 'directory' },
});
