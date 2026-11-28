# jest-tests

API tests of monday.com written in code (Jest). Full documentation: [docs/FRAMEWORK.md](docs/FRAMEWORK.md).

```bash
nvm use            # Node 26.13.1 (.nvmrc)
npm install
cp .env.example .env   # and put your MONDAY_TOKEN
npm run lint
npm test
```

After a run: logs in `logs/<run id>/` and the log report in `reports/log-report-<run id>.html`.
