const download = require(`./src`)

download({
    entry: [
        `https://www.playcornhole.org/sitemap.xml`,
    ],
    domains: [
        { domain: `www.playcornhole.org`, path: `/orgsite` },
    ],
    replaceOrigin: `https://playcornhole.smarterlabs.com/`,
})