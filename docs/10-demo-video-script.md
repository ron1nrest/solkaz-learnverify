# Сценарий demo video (2–3 мин, RU)

Запишите экран + голос (OBS / Loom). Показывайте терминал и при желании Phantom Devnet.

**Цель:** Proof of Work для гранта — ревьюер за 2 минуты понимает продукт.

---

## 0:00–0:20 — Хук

**Текст:**
> «SolKaz LearnVerify — open-source автопроверка домашек Solana на Devnet для студентов Казахстана. Без скриншотов и без ручного Explorer.»

**На экране:** README GitHub или заголовок репо.

---

## 0:20–0:45 — Проблема

**Текст:**
> «Ментор тратит часы на проверку 30 кошельков. Студент не знает, зачтут ли работу. LearnVerify читает блокчейн и говорит, что именно не сделано.»

**На экране:** схема из docs/01-overview (опционально).

---

## 0:45–1:15 — doctor + challenges

```powershell
cd SolanaAI
npm run build
npm run dev -- doctor
npm run dev -- challenges
```

**Текст:**
> «Doctor проверяет Node и Devnet RPC. Пять готовых недельных challenge в репозитории.»

---

## 1:15–2:00 — verify (главное)

Подготовьте **свой** Devnet-кошелёк с выполненным week0 или week1.

```powershell
npm run dev -- list-tasks -c week1-fundamentals.yaml
npm run dev -- verify -w ВАШ_PUBKEY -c week0-setup.yaml
```

**Текст:**
> «Студент вставляет только публичный адрес — ключи не нужны. Видим галочки по задачам и подсказки на русском.»

Покажите 1× ✗ и как hint объясняет, что сделать (если есть).

---

## 2:00–2:40 — cohort

```powershell
npm run dev -- cohort `
  -c week0-setup.yaml `
  --wallets challenges/examples/cohort-sample.csv `
  --out reports/demo-cohort.json `
  -v
```

**Текст:**
> «Ментор загружает CSV группы — за минуты отчёт: кто сдал, кто отстаёт. JSON для архива.»

---

## 2:40–3:00 — Закрытие

**Текст:**
> «MIT, open source, для Superteam Kazakhstan и вузов. Не конкурируем с AI agent kits — это слой образования. Ссылка на репозиторий в описании видео.»

**На экране:** `reports/example-cohort.json` в VS Code (summary).

---

## Технические советы

| Совет | Зачем |
|-------|--------|
| 1080p, крупный шрифт терминала | Читаемость |
| Убрать seed phrase / .env | Безопасность |
| Если 429 RPC — показать `doctor` + HELIUS в .env | Честность |
| YouTube unlisted или Loom | Ссылка в заявке |

---

## После записи

1. Загрузить видео → получить URL  
2. Вставить в [grant-application-ready.md](grant-application-ready.md)  
3. Добавить ссылку в README под «Demo»
