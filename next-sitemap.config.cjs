/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://kuaforara.com.tr',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    exclude: ['/owner/*', '/admin/*', '/auth/*', '/api/*'],
    robotsTxtOptions: {
        additionalSitemaps: [
            `${process.env.SITE_URL || 'https://kuaforara.com.tr'}/server-sitemap.xml`,
        ],
    },
}

