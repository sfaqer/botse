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

### Translation workflow (Crowdin)

Translations are managed on [Crowdin](https://crowdin.com/). The community contributes translations through the Crowdin UI; a GitHub Action keeps the repository in sync:

- **Sources** (English markdown in `docs/` and UI strings in `i18n/en/`) are uploaded to Crowdin on every push that touches them, and on a daily schedule.
- **Translations** are downloaded back into `i18n/<locale>/` and proposed as a pull request titled `New Crowdin translations`.

The sync workflow lives at `.github/workflows/crowdin.yml`. It requires two repository secrets: `CROWDIN_PROJECT_ID` and `CROWDIN_PERSONAL_TOKEN`.

To run the sync manually: Actions → Crowdin → Run workflow.
