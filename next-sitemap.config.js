/** @type {import('next-sitemap').IConfig} */
export default {
    siteUrl: process.env.SITE_URL || 'https://guzellikrandevu.com',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: ['/owner/*', '/admin/*', '/auth/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/owner', '/admin', '/auth'],
            },
        ],
    },
}
