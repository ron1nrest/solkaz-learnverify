# 09. Roadmap (после MVP)

## v0.1.0 — MVP (грант)

См. [02-mvp-scope.md](02-mvp-scope.md).

**Целевая дата:** +4 недели от старта разработки.

---

## v0.2.0 — Classroom scale (+2–3 недели)

| Feature | Описание |
|---------|----------|
| GitHub Action | `learnverify-action` — verify в PR студента |
| `program_deployed` | Проверка deploy программы по programId |
| `instruction_emitted` | Вызов конкретной инструкции (advanced) |
| Kazakh `title.kk` | Метаданные challenge |
| npm publish `@solkaz/learnverify` | Установка без git clone |
| Улучшенный SPL scan | Меньше false negative на mint detection |

---

## v0.3.0 — Community (+4 недели)

| Feature | Описание |
|---------|----------|
| Web dashboard (static) | Загрузка cohort JSON → таблица |
| Challenge registry | community PRs `/challenges/community/` |
| Devnet badge (опционально) | Metaplex compressed NFT «skill proof» — **только opt-in** |
| LMS export | CSV → Moodle/Canvas compatible |

---

## v1.0.0 — Stable education standard

- Стабильный challenge spec v2
- 20+ bundled challenges (full intro course)
- Partnership docs с Superteam KZ / Solana U
- Видеокурс RU на YouTube (3–5 уроков)
- Benchmark: 1000+ verifies/month (community metric)

---

## Не планируется (explicit)

- Mainnet trading / DeFi agents
- Custodial wallets
- AI code generation (отдельный проект, не LearnVerify)
- Token / paid SaaS tier в обозримом будущем

---

## Критерии перехода версий

| Version | Gate |
|---------|------|
| v0.2 | MVP pilot report опубликован + 0 P0 bugs 14 дней |
| v0.3 | ≥ 3 внешних ментора используют без авторской поддержки |
| v1.0 | Spec frozen 60 дней, ≥ 2 community contributors |
