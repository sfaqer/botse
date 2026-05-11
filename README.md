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

The site is built for multiple locales. English (`en`) is the default; additional locales live under `i18n/<locale>/`.

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
$ bash scripts/sync-docs-mirror.sh
```

Translators do not need GitHub or git — they work entirely in the Weblate web editor.

#### Translation status per language

[![Translation status](https://hosted.weblate.org/widget/botse-helper/multi-auto.svg)](https://hosted.weblate.org/engage/botse-helper/)

The image above auto-enumerates every language enabled on the Weblate project, so new locales appear here as they are added — no manual edits needed.

> Translated using [Weblate](https://weblate.org/).
