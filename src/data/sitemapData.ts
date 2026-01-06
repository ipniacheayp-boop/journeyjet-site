export interface SitemapRoute {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastmod?: string;
}

export const sitemapRoutes: SitemapRoute[] = [
  // Main pages
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/deals', priority: 0.9, changefreq: 'daily' },
  { path: '/search-results', priority: 0.8, changefreq: 'hourly' },
  
  // Informational pages
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/careers', priority: 0.6, changefreq: 'weekly' },
  { path: '/support', priority: 0.7, changefreq: 'monthly' },
  { path: '/site-reviews', priority: 0.6, changefreq: 'weekly' },
  
  // Legal pages
  { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  
  // User account pages (lower priority, may be noindex)
  { path: '/account', priority: 0.4, changefreq: 'monthly' },
  { path: '/my-bookings', priority: 0.4, changefreq: 'weekly' },
  
  // Authentication pages (low priority)
  { path: '/login', priority: 0.3, changefreq: 'yearly' },
  { path: '/agent-login', priority: 0.2, changefreq: 'yearly' },
  { path: '/agent-connect', priority: 0.2, changefreq: 'yearly' },
];

// Routes to exclude from sitemap (admin, internal, dynamic)
export const excludedRoutes: string[] = [
  '/admin',
  '/admin-login',
  '/agent-dashboard',
  '/agent-wallet',
  '/booking',
  '/booking-confirmation',
  '/payment-options',
  '/payment-card',
  '/payment-upi',
  '/payment-qr',
  '/payment-stripe-upi',
  '/payment-processing',
  '/payment-success',
  '/payment-cancel',
  '/deals-management',
  '/reviews-analytics',
  '/fx-savings-dashboard',
];

export const BASE_URL = 'https://cheapflights.com';

// Generate sitemap XML string
export const generateSitemapXML = (routes: SitemapRoute[]): string => {
  const today = new Date().toISOString().split('T')[0];
  
  const urlEntries = routes.map(route => `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  return `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin and internal pages
Disallow: /admin
Disallow: /admin-login
Disallow: /agent-dashboard
Disallow: /payment-*
Disallow: /deals-management
Disallow: /reviews-analytics
`;
};
