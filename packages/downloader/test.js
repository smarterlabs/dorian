const download = require(`./src/index`)

async function go(){
    console.log(`go()`)
    await download({
        entry: [
            `https://smarterlabs.webflow.io/sitemap.xml`,
            // `https://smarterlabs.webflow.io/`,
        ],
        domains: [
          { domain: `smarterlabs.webflow.io`, path: `/` },
          { domain: `assets.website-files.com`, path: `/assets` },
        ],
    })
}

try{
    go()
}
catch(err){
    console.error(err)
    process.exit(1)
}