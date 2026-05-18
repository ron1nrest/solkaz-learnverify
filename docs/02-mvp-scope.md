# 02. Scope MVP

Документ фиксирует **исчерпывающий минимум** для публичного релиза v0.1.0 и подачи на грант с сильным Proof of Work.

---

## Цель MVP

Рабочий CLI `learnverify`, который по адресу кошелька на **Devnet** проверяет **5 готовых challenge'ов**, поддерживает **пакетную проверку когорты**, использует **multi-RPC консенсус**, поставляется с **русской документацией** и **одним отчётом пилота**.

---

## В scope MVP

### Функциональность CLI

| ID | Функция | Приоритет |
|----|---------|-----------|
| F1 | `learnverify verify --wallet --challenge` | P0 |
| F2 | `learnverify cohort --wallets --challenge --out` | P0 |
| F3 | `learnverify list-tasks --challenge` | P1 |
| F4 | `learnverify doctor` (RPC, сеть, версия) | P1 |
| F5 | `learnverify challenges` (список bundled challenges) | P2 |
| F6 | Multi-RPC: минимум 2 endpoint, расхождение → warning/fail policy | P0 |
| F7 | Human-readable отчёт + `--json` | P0 |
| F8 | Exit codes для CI (0 = all pass, 1 = partial, 2 = error) | P1 |

### Типы задач (`task types`) — MVP

| Type | Что проверяет | Пример |
|------|---------------|--------|
| `balance_min` | Баланс SOL ≥ N lamports | Получил devnet SOL |
| `transfer_sent` | Исходящий SOL transfer ≥ N | Отправил другу |
| `transfer_received` | Входящий transfer | Получил от ментора |
| `spl_mint_created` | Кошелёк authority mint'а с decimals | Создал токен |
| `spl_token_account` | Associated token account существует | ATA для mint |
| `signature_count_min` | ≥ N подтверждённых подписей от кошелька | «Был активен в сети» |

> **Не в MVP:** `program_deployed`, `anchor_instruction`, NFT, mainnet, GitHub Action (→ v0.2).

### Challenge-пакет MVP

| Файл | Тема | Задач |
|------|------|-------|
| `week0-setup.yaml` | Кошелёк + faucet | 2 |
| `week1-fundamentals.yaml` | Баланс + transfer | 3 |
| `week2-spl-intro.yaml` | SPL mint + ATA | 3 |
| `week3-activity.yaml` | Активность (signatures) | 2 |
| `week4-review.yaml` | Комбинированный мини-экзамен | 4 |

Полные примеры: [challenges/examples/](../challenges/examples/).

### Документация MVP

| Документ | Язык |
|----------|------|
| README (quick start) | RU + EN summary |
| `docs/student-guide.md` | RU: кошелёк, Devnet, faucet, verify |
| `docs/mentor-guide.md` | RU: cohort, CSV, интерпретация отчёта |
| Все спеки в `docs/` | RU (уже есть) |

### Тестирование MVP

| Уровень | Требование |
|---------|------------|
| Unit | Парсер YAML, валидатор challenge, агрегация результатов |
| Integration | Mock RPC responses |
| E2E (manual) | 2 golden wallet на Devnet, задокументированы в `tests/fixtures/README.md` |
| CI | `lint` + `test` + `build` на push |

### Grant / PoW артефакты MVP

| Артефакт | Когда |
|----------|-------|
| Публичный GitHub repo | До Apply |
| Demo video 2–3 мин (RU) | До Apply или W1 |
| `reports/pilot-template.md` | W4 пилота |
| 4 weekly progress posts (шаблон в grant playbook) | W1–W4 |

---

## Вне scope MVP (явно)

| Item | Версия |
|------|--------|
| Mainnet | — |
| Приватные ключи в CLI | — |
| AI / NL интерфейс | — |
| Web UI / dashboard | v0.3+ |
| GitHub Action | v0.2 |
| Anchor / program deploy checks | v0.2 |
| Казахский язык docs | v0.2 (RU достаточно для MVP) |
| Devnet credential / NFT badge | v0.3 (опционально) |

---

## Definition of Done (v0.1.0)

MVP считается готовым, когда выполнены **все** пункты:

- [x] `npm run build` без ошибок
- [x] `learnverify verify` — все 6 task types (integration tests + Devnet)
- [x] `learnverify cohort` — JSON + summary (см. `reports/example-cohort.json`)
- [x] Multi-RPC: документировано в architecture + strict-rpc
- [x] `docs/student-guide.md` и `docs/mentor-guide.md` обновлены
- [x] CI green (`npm run test:ci`)
- [ ] Demo video записано и ссылка в README — **ваш шаг** ([10-demo-video-script.md](10-demo-video-script.md))
- [ ] Пилот ≥10 студентов — **этап 6** ([reports/pilot-template.md](../reports/pilot-template.md))

---

## Пошаговый план реализации

Каждый шаг — отдельная сессия разработки. Не переходить к следующему без DoD текущего.

### Этап 0 — Окружение (день 1)

- [x] Init monorepo: TypeScript, ESLint, Prettier, Vitest
- [x] Структура папок по [06-development-guide.md](06-development-guide.md)
- [x] CLI: `--version`, `doctor`, `list-tasks`, `challenges`, загрузка challenge (Zod)

### Этап 1 — Ядро (дни 2–4)

- [x] Парсер `challenge.yaml` + Zod валидация
- [x] Абстракция `TaskVerifier` + registry типов
- [x] `MultiRpcClient` с retry + multi-endpoint (balance consensus)
- [x] `balance_min`, `signature_count_min`
- [x] `learnverify verify` + human / JSON отчёт

### Этап 2 — Транзакции (дни 5–7)

- [x] `transfer_sent`, `transfer_received` (разбор parsed transactions)
- [x] `spl_mint_created`, `spl_token_account`
- [x] Кэш истории кошелька на один прогон `verify`

### Этап 3 — Cohort + challenges (дни 8–10)

- [x] `cohort` + CSV parser + JSON report + `--strict` / `--verbose`
- [x] 5 YAML в `challenges/examples/`
- [x] `list-tasks`, `challenges`

### Этап 4 — Качество (дни 11–12)

- [x] Unit + integration tests (mock RPC)
- [x] Golden manifest + fixture README + optional `test:e2e`
- [x] CI: lint, format, security-check, smoke CLI, unit/integration jobs

### Этап 5 — Docs + PoW (дни 13–14)

- [x] student-guide, mentor-guide (обновлены под v0.1.0)
- [x] Сценарий demo: [10-demo-video-script.md](10-demo-video-script.md)
- [x] Заявка: [grant-application-ready.md](grant-application-ready.md) + [pow-checklist.md](pow-checklist.md)
- [x] `reports/example-cohort.json` + weekly-update шаблоны
- [ ] Записать video + Submit Earn — **ваши действия**

### Этап 6 — Пилот (неделя 3–4, параллельно гранту)

- [ ] Письмо Superteam KZ
- [ ] Прогон когорты, `reports/pilot-YYYY-MM.md`
- [ ] Weekly updates × 4

---

## Оценка трудозатрат

| Этап | Часы (оценка) |
|------|----------------|
| 0–1 | 12–16 |
| 2 | 10–14 |
| 3 | 8–10 |
| 4 | 8–10 |
| 5 | 6–8 |
| 6 | 4–8 (+ календарное ожидание пилота) |
| **Итого MVP** | **~50–65 ч** |

---

## Риски MVP и митигация

| Риск | Митигация |
|------|-----------|
| RPC rate limit | 2 провайдера, backoff, кэш signatures на 60s |
| Медленный `getSignaturesForAddress` | Лимит `before` + `limit` в spec task |
| Ложные fail из-за задержки индексации | Retry 3× с паузой 2s в verify |
| Студент путает mainnet/devnet | `doctor` + жёсткий `network: devnet` в challenge |
| Scope creep (AI, web) | Этот документ — контракт; любое расширение → v0.2 |
