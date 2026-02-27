export function buildWebSiteSchema(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Traffic Camera Explorer',
    url: siteUrl,
    description:
      'Explore live California traffic cameras from Caltrans. Find cameras near any address.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
