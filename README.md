# Dorian

**Note:** Project is in alpha, use at your own risk.

Dorian is a static site generator that converts any website into a static site. Postprocessing is done to perform optimizations on the downloaded content.

## Usage

```js
const dorian = require(`@smarterlabs/dorian`)

dorian({
	entry: [
		`https://originsite.com/sitemap.xml`,
	],
	domains: [
		{ domain: `originsite.com`, path: `/` },
		{ domain: `assets.cdn.com`, path: `/assets` },
	],
    dist: `dist`,
})
```