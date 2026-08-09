<h1 align="center">Welcome to OSSAT 💻</h1>
<p>
  <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">
    <img alt="License: GNU GPLv3" src="https://img.shields.io/badge/License-GNU GPLv3-yellow.svg" />
  </a>
</p>

> A visually pleasing and easy to use web-based CPU Scheduler and Memory Management Simulator, implementing assessment mechanisms with machine learning, organisation management, and data visualisation capabilities. The API for this project can be found [here](https://github.com/tdherring/ossat-api/).

## Frontend demo data

`yarn dev` uses local demo data in development, so the authenticated assessment, learning-group, and performance-chart pages can be viewed without running the API or a database. Production builds default to frontend-only mode: API-backed account controls are hidden unless API mode is explicitly enabled at build time.

To override the mode for a command:

```bash
VITE_DATA_MODE=demo yarn dev
VITE_DATA_MODE=api yarn dev
```

Set `VITE_DATA_MODE=api` in a production host only when the GraphQL API is available. Leaving it unset keeps registration, login, and authenticated routes disabled.

> A Final Year Master's Project, developed for [King's College London](https://www.kcl.ac.uk/).

### 🏠 [Demo (Frontend Only)](https://ossat.io/)

## Install

```sh
yarn install
```

## Usage

If running locally:

```sh
yarn dev
```

Create a production build or preview it locally with `yarn build` and `yarn preview`.

Production hosts must serve `index.html` for unknown paths so React Router deep links such as
`/simulators/cpu` and `/assessments/:assessmentId` can load directly.

## Code quality

```sh
yarn typecheck     # Strict TypeScript project check
yarn lint          # ESLint flat-config check
yarn format:check  # Prettier check
yarn validate      # Run every check and a production build
```

Use `yarn lint:fix` and `yarn format` to apply safe lint and formatting fixes.

_Or deploy to a cloud environment using your provider's instructions._

## Author

👤 **Tom Herring**

- Github: [@tdherring](https://github.com/tdherring)
- LinkedIn: [@tomh99](https://linkedin.com/in/tomh99)

## 📝 License

Copyright © 2022 [Tom Herring](https://github.com/tdherring).<br />
This project is [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html) licensed.
