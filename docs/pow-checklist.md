# Proof of Work — чеклист перед подачей на грант

Отметьте вручную то, что требует ваших действий вне репозитория.

## Репозиторий (готово в v0.1.0)

- [x] MIT LICENSE
- [x] README RU + quick start
- [x] CLI: `doctor`, `verify`, `cohort`, `list-tasks`, `challenges`
- [x] 5 challenges + JSON schema
- [x] student-guide + mentor-guide
- [x] 26+ automated tests + CI
- [x] `reports/example-cohort.json` — образец отчёта
- [x] CHANGELOG v0.1.0

## Ваши действия

- [ ] Push: `.\scripts\publish-github.ps1` (логин GitHub в браузере один раз)
- [ ] Записать **demo video** ([10-demo-video-script.md](10-demo-video-script.md))
- [ ] Вставить URL в README и [grant-application-ready.md](grant-application-ready.md)
- [ ] Email **talgat@superteam.kz** (шаблон в [07-grant-playbook.md](07-grant-playbook.md))
- [ ] Submit на [Superteam Earn](https://superteam.fun/earn/grants/solana-foundation-kazakhstan-grants)
- [ ] (Опционально) `git tag v0.1.0 && git push --tags`

## После approve (этап 6)

- [ ] Weekly updates × 4 ([weekly-updates/](weekly-updates/))
- [ ] Пилот ≥10 студентов → [reports/pilot-template.md](../reports/pilot-template.md)
- [ ] Onboarding wallet от Foundation

## Быстрая проверка локально

```powershell
npm run test:ci
npm run dev -- doctor
npm run dev -- verify -w <DEVNET_PUBKEY> -c week0-setup.yaml
```
