# 08. Безопасность

LearnVerify спроектирован как **read-only образовательный инструмент**. Этот документ обязателен для ревьюеров гранта и для менторов.

---

## Принципы MVP

| # | Принцип |
|---|---------|
| S1 | **Никогда не запрашивать seed phrase / private key** |
| S2 | **Только Devnet** в v0.1 — hardcoded guard в CLI |
| S3 | **Только публичные адреса** на входе |
| S4 | **Не подписывать транзакции** — нет `Keypair` в runtime verify |
| S5 | **Не отправлять данные на сторонние analytics** без согласия |

---

## Угрозы и митигация

| Угроза | Описание | Митигация |
|--------|----------|-----------|
| Утечка seed студента | Фишинг «введите ключ для verify» | Документация: verify = только pubkey; баннер в CLI |
| Путаница mainnet/devnet | Студент теряет реальные SOL | Challenge `network: devnet`; doctor проверяет RPC cluster |
| Злонамеренный RPC | Ложный balance → неверный pass | Multi-RPC + warnings; опция `--strict-rpc` |
| CSV с лишними данными | Утечка email/телефонов | CSV только `wallet,name`; не собирать PII в MVP |
| Dependency supply chain | Вредоносный npm пакет | lockfile, `npm audit`, минимум зависимостей |
| Rate limit / DoS RPC | Cohort из 1000 кошельков | Default delay; документировать лимиты |

---

## Что хранится локально

| Данные | Где | Git |
|--------|-----|-----|
| `learnverify.config.json` | cwd / home | Нет (пример в docs) |
| `reports/cohort-*.json` | `./reports/` | gitignore |
| `.env` с test wallet | локально | gitignore |
| Публичные pubkeys пилота | `reports/pilot-*.md` | Только с согласия когорты |

---

## Рекомендации для студентов

1. Создайте **отдельный кошелёк** для учёбы (Phantom → Add / Connect).
2. Переключите сеть на **Devnet** в настройках кошелька.
3. Используйте **только faucet Devnet** — не переводите mainnet SOL.
4. **Никому** не отправляйте seed phrase — LearnVerify этого не требует.
5. Сдаёте ментору **только публичный адрес** (строка base58).

---

## Рекомендации для менторов

1. Не просите приватные ключи — только pubkey.
2. Публикуйте cohort CSV в закрытых каналах (Telegram group), не в open web.
3. При пилоте получите устное согласие на использование адресов в агрегированном отчёте.

---

## RPC и API keys

| Сервис | Обязательность | Хранение |
|--------|----------------|----------|
| Public Solana Devnet RPC | Достаточно для MVP | — |
| Helius API key | Опционально | `HELIUS_API_KEY` env, не в repo |

---

## Responsible disclosure

Контакт для уязвимостей: указать email maintainer в README после публикации repo.

Критичные issues (key exfiltration vector): исправление в течение 72h.

---

## Аудит scope MVP

Полный security audit **не входит** в MVP. Достаточно:
- self-review checklist перед v0.1.0
- отсутствие `secret`, `mnemonic`, `Keypair.fromSecretKey` в `src/commands/verify.ts` и cohort

```bash
# Pre-release grep (в CI)
rg -i "secretKey|mnemonic|seed phrase" src/
```

Ожидание: **0 совпадений** в production paths.
