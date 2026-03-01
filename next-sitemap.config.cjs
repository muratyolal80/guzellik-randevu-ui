/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://guzellikrandevu.com',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: ['/owner/*', '/admin/*', '/auth/*', '/api/*'],
    robotsTxtOptions: {
        additionalSitemaps: [
            `${process.env.SITE_URL || 'https://guzellikrandevu.com'}/server-sitemap.xml`,
        ],
    },
}

