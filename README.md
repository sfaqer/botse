# BOTSE Helper


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

- **Sources** (English markdown in `docs/` and UI strings in `i18n/en/`) are read by Weblate from this repository.
- **Translations** are committed back into `i18n/<locale>/` by Weblate as pull requests.

Translators do not need GitHub or git — they work entirely in the Weblate web editor.

> Translated using [Weblate](https://weblate.org/).
