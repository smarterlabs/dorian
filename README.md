# Project Dorian

Dorian is a static site generator that converts a website into a static site by scraping any content found from the origin. Postprocessing is done to perform optimizations on the downloaded content.

## Usage

Make sure you have 2 environment variables set:

- `URL`: The destination URL
- `WEBFLOW_URL`: The original source URL to be scraped

To do this, you can create a `.env` file with the contents of `.env.template`. and fill in the variables.

Then run:

```bash
yarn build
```

It should output the files to the `dist` folder in the project root. You can test the site out locally by running:

```bash
yarn serve
```

# Excluding pages from the sitemap

In Webflow, add this custom attribute to the "body" tag of the page you want to exclude from the sitemap:

Name: `sitemap`
Value: `no`