# BOTSE Helper

[![Translation status](https://hosted.weblate.org/widget/botse-helper/svg-badge.svg)](https://hosted.weblate.org/engage/botse-helper/)

Built using [Docusaurus](https://docusaurus.io/)

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

### Internationalization

The site is built for multiple locales. English (`en`) is the default; additional locales are discovered automatically under `i18n/<locale>/`. The site, tracker data, and preview tooltips share this locale list. Documents that have not been translated yet use the English source.

Local preview of a non-default locale:

```
$ yarn start --locale ru
```

Building all locales for production:

```
$ yarn build
```

The build produces `build/` for the default locale and `build/<locale>/` for each additional locale.

### Translation workflow (Weblate)

Translations are managed on [Weblate](https://weblate.org/). The community contributes translations through the Weblate web UI; Weblate keeps the repository in sync:

- **Sources** — UI JSON strings in `i18n/en/` and a mirror of `docs/` under `i18n/en/docusaurus-plugin-content-docs/current/` — are read by Weblate from this repository.
- **Translations** are committed back into `i18n/<locale>/` by Weblate as pull requests.

The `docs/` mirror exists because Weblate cannot map a single component across two directories. A GitHub Action (`.github/workflows/sync-docs-mirror.yml`) keeps the mirror in sync automatically whenever `docs/` changes; the same script also seeds a starting copy of any new document into each non-default locale (without overwriting existing translations). To run it manually after editing `docs/`:

```
$ npm run sync-docs
```

Translators do not need GitHub or git — they work entirely in the Weblate web editor.

The mirror sync also runs when a locale is added or updated. It commits generated documentation for every locale and preserves existing translations. The Bash entry point remains available for older automation.

Run `npm run test:i18n` to check locale discovery, untranslated-document fallback, mirror synchronization, and the workflow's staging of generated files.

#### Translation status per language

[![Translation status](https://hosted.weblate.org/widget/botse-helper/multi-auto.svg)](https://hosted.weblate.org/engage/botse-helper/)

<!--
  Maintainer note: the multi-auto.svg widget above auto-enumerates every
  language enabled on the Weblate project. New locales show up here as they
  are added — no manual edits needed. Don't replace it with hardcoded
  per-language badges (.../-/<lang>/svg-badge.svg) unless you want to
  maintain that list by hand.
-->


> Translated using [Weblate](https://weblate.org/).

### Document checks

Run `npm run check:docs` before submitting documentation or translation changes. It checks all locale documents for MDX syntax, hidden text, callout translations, metadata consistency, internal routes, asset paths and English-mirror drift. `npm run test:docs` exercises the checker with invalid and valid fixtures. Both checks also run in the i18n pull-request build.

Custom callout titles are UI messages under `docs.admonition.*` in `i18n/en/code.json`; their directive syntax stays protected in Markdown translations. Keep routing metadata and tag identifiers consistent across locales. Use named icons in `hoverText`, which supports Markdown text and links rather than raw HTML.
