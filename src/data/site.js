// Site-wide settings, hero and interface text, from the CMS (cms/: Site settings,
// Homepage → Hero, Interface text). src/data/content.json is written by
// scripts/pull-content.mjs before every dev/build.

import content from './content.json';

const { settings, labels: ui, homepage } = content;

// Fill {tokens} in CMS text, e.g. fmt('{name} — Galeri', { name: 'Tipe 1' }).
export const fmt = (text, vars = {}) => (text ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

// Prefix a root-relative path with the deploy base (for hosting under a subpath).
export const url = (path) => (/^[a-z]+:/i.test(path) ? path : `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`);

export const site = {
  name: settings.name,
  fullName: settings.fullName,
  lang: settings.language,
  description: settings.seo.description,
  shareImage: settings.seo.shareImage,
  logo: settings.logo,
  logoOnDark: settings.logoOnDark,
  favicon: settings.favicon,
  copyright: fmt(settings.footer?.copyright || '© {year} {fullName}', {
    year: new Date().getFullYear(),
    fullName: settings.fullName,
  }),
  theme: settings.theme,
  analyticsId: settings.dev?.analyticsId,

  // Small "contoh" badges on stand-in media and data. Off: the site is presented as live.
  showPlaceholderBadges: Boolean(settings.dev?.showPlaceholderBadges),

  hero: {
    eyebrow: homepage.hero.eyebrow,
    title: homepage.hero.title,
    teaser: homepage.hero.loopVideo.src,
    full: homepage.hero.fullVideo.src,
    cover: homepage.hero.cover.src,
    playLabel: homepage.hero.playLabel,
    scrollCue: homepage.hero.scrollCue,
  },
};

// Favicon: the uploaded one, else the wordmark drawn on the dark tile.
const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
site.faviconHref = site.favicon
  ? url(site.favicon.src)
  : 'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0b0d0f"/>' +
        `<rect x="0" y="28" width="32" height="4" fill="${site.theme.accent}"/>` +
        `<text x="16" y="21" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${site.name.length > 2 ? 10 : 14}" fill="#f3f4f2">${esc(site.name.slice(0, 3))}</text></svg>`,
    );

export const nav = settings.nav.map((n) => ({ href: `#${n.section}`, label: n.label }));

export const statusLabels = settings.statusLabels;

export const labels = ui;
