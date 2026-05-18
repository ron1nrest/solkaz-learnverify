# SolKaz LearnVerify

**Open-source автоматическая проверка практических заданий Solana на Devnet для студентов и bootcamp'ов Казахстана.**

LearnVerify читает публичный адрес кошелька студента, сверяет on-chain факты с declarative-спецификацией задания (`challenge.yaml`) и выдаёт понятный отчёт — без скриншотов и без ручной проверки в Explorer.

**Версия:** v0.1.0 · **Лицензия:** MIT

| | |
|--|--|
| **GitHub** | https://github.com/ron1nrest/solkaz-learnverify |
| **Demo video** | _добавьте ссылку после записи_ → [сценарий](docs/10-demo-video-script.md) |
| **Грант** | [Solana Foundation Kazakhstan Grants](https://superteam.fun/earn/grants/solana-foundation-kazakhstan-grants) · [текст заявки](docs/grant-application-ready.md) |
| **PoW** | [чеклист](docs/pow-checklist.md) · [пример cohort JSON](reports/example-cohort.json) |

---

## Быстрый старт

**Требования:** Node.js ≥ 20

```powershell
git clone https://github.com/ron1nrest/solkaz-learnverify.git
cd SolanaAI
npm install
npm run build
npm link

learnverify doctor
learnverify challenges
learnverify verify --wallet <DEVNET_PUBKEY> -c week0-setup.yaml
```

Пакетная проверка группы:

```powershell
learnverify cohort -c week1-fundamentals.yaml --wallets cohort.csv --out reports/out.json -v
```

Без установки в PATH: `npm run dev -- verify ...`

---

## Возможности v0.1.0

| Команда | Описание |
|---------|----------|
| `doctor` | Node + Devnet RPC |
| `verify` | Проверка одного кошелька |
| `cohort` | CSV → JSON-отчёт по группе |
| `list-tasks` | Задачи challenge без сети |
| `challenges` | Список встроенных недель |

**Типы проверок:** `balance_min`, `signature_count_min`, `transfer_sent`, `transfer_received`, `spl_mint_created`, `spl_token_account`

**Challenge-пакет:** [challenges/examples/](challenges/examples/) (недели 0–4, RU)

---

## Документация

| Аудитория | Документ |
|-----------|----------|
| Студент | [docs/student-guide.md](docs/student-guide.md) |
| Ментор | [docs/mentor-guide.md](docs/mentor-guide.md) |
| Грант / PoW | [docs/grant-application-ready.md](docs/grant-application-ready.md) · [docs/07-grant-playbook.md](docs/07-grant-playbook.md) |
| CLI | [docs/05-cli-reference.md](docs/05-cli-reference.md) |
| Индекс | [docs/README.md](docs/README.md) |

---

## Статус MVP

| Этап | Статус |
|------|--------|
| CLI + 6 verifiers + 5 challenges | ✅ |
| cohort + CI + 26 tests | ✅ |
| Docs + grant pack | ✅ |
| Demo video URL в README | 🔲 ваш шаг |
| GitHub public + push | ✅ |
| Пилот bootcamp KZ (этап 6) | 🔲 после гранта |

---

## Разработка

```powershell
npm run test:ci
npm run validate-challenges
```

Опционально Devnet E2E: `$env:E2E_DEVNET_WALLET="<pubkey>"; npm run test:e2e`

См. [CHANGELOG.md](CHANGELOG.md)

---

## Почему не «ещё один AI Agent»

[Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit) — агенты для DeFi и протоколов. **LearnVerify** — read-only **автотесты для учебных домашек** на Devnet.

---

## Лицензия

MIT — см. [LICENSE](LICENSE).
