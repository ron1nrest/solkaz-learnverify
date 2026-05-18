# 06. Руководство по разработке

## Требования к окружению

| Инструмент | Версия |
|------------|--------|
| Node.js | ≥ 20 LTS |
| npm | ≥ 10 |
| Git | любая актуальная |
| Solana CLI | опционально (для ручных тестов на Devnet) |

**OS:** Windows 10/11, macOS, Linux — проект кроссплатформенный.

---

## Первичная настройка (этап 0)

```bash
cd SolanaAI
npm init -y
# Далее: зависимости по package.json (создаётся на этапе 0 реализации)

npm install
npm run build
npm link   # глобально learnverify в PATH
```

### Рекомендуемые VS Code extensions

- ESLint
- Prettier
- YAML (Red Hat)

---

## Скрипты npm (целевые)

| Script | Действие |
|--------|----------|
| `npm run build` | `tsc` → `dist/` |
| `npm run dev` | `tsx src/cli.ts` |
| `npm test` | Vitest unit + integration |
| `npm run lint` | ESLint |
| `npm run format` | Prettier check |
| `npm run validate-challenges` | Zod/JSON schema всех YAML |
| `npm run doctor` | `node dist/cli.js doctor` |

---

## Стиль кода

- **TypeScript strict:** `strict: true`
- Именование: `camelCase` в TS, `kebab-case` в файлах verifiers
- Комментарии: только неочевидная on-chain логика
- Сообщения пользователю: **русский**; код и типы — английский
- Никаких `any` без `eslint-disable` и причины

---

## Тестирование

### Unit (`tests/unit/`)

- Парсер YAML → объект Challenge
- Каждый verifier с **mock** `VerifyContext`
- Форматтер отчёта

### Integration (`tests/integration/`)

- Mock RPC server (msw или ручные stubs)
- Полный `verify` pipeline без сети

### E2E Devnet (`tests/fixtures/`)

| Fixture | Описание |
|---------|----------|
| `golden-pass-week1.json` | pubkey + ожидаемый pass/fail per task |
| `golden-partial-week2.json` | частичный pass |

**Правило:** приватные ключи **не коммитить**. Golden wallets — отдельный dev-кошелёк; seed в `.env` локально (gitignored).

```bash
# .env.example (коммитить)
# DEVNET_TEST_WALLET_SECRET=[1,2,...]  — только локально
```

Документировать пополнение: `solana airdrop 2 <PUBKEY> --url devnet`

---

## CI (GitHub Actions)

Файл: `.github/workflows/ci.yml`

```yaml
# Триггер: push, pull_request на main
# Jobs: lint → test → build → validate-challenges
```

Secrets в CI **не нужны** для unit/integration.  
Опциональный nightly job `e2e-devnet` с `DEVNET_TEST_WALLET_SECRET` в repo secrets.

---

## Ветвление и коммиты

| Ветка | Назначение |
|-------|------------|
| `main` | Стабильная, релизы |
| `feat/*` | Фичи по этапам из MVP scope |

Формат коммитов (рекомендация):

```
feat(verify): add balance_min verifier
fix(rpc): retry on 429
docs: student guide faucet section
```

---

## Локальная отладка verifier

```bash
npm run dev -- verify \
  --wallet <PUBKEY> \
  --challenge challenges/examples/week1-fundamentals.yaml \
  -v
```

Логировать: RPC method, duration, signature count (без секретов).

---

## Добавление нового task type

1. `src/verifiers/my-type.ts` implements `TaskVerifier`
2. `register('my_type', new MyTypeVerifier())` в `registry.ts`
3. Расширить Zod в `challenge/schema.ts`
4. Unit tests
5. Пример в `challenges/examples/`
6. Секция в `04-challenge-spec.md`

---

## Release checklist v0.1.0

- [ ] CHANGELOG.md
- [ ] Версия в `package.json`
- [ ] `npm publish` — **не обязательно для MVP**; достаточно `npm link` / install from git
- [ ] Git tag `v0.1.0`
- [ ] README badge CI

---

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| 429 Too Many Requests | Увеличить `--delay-ms`, добавить Helius key |
| Verify fail сразу после tx | Подождать 5–10s, retry; индексация Devnet |
| Invalid pubkey | Проверить base58, нет пробелов в CSV |
| Windows path к YAML | Кавычки: `--challenge ".\challenges\..."` |
