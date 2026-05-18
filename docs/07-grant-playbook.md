# 07. Grant Playbook — Solana Foundation Kazakhstan Grants

Пошаговое руководство для **максимального шанса approve** проекта LearnVerify.

**Листинг:** [Solana Foundation Kazakhstan Grants](https://superteam.fun/earn/grants/solana-foundation-kazakhstan-grants)  
**Контакт KZ:** talgat@superteam.kz

---

## Стратегия подачи

| Принцип | Действие |
|---------|----------|
| PoW > pitch | Публичный repo + demo **до** или сразу после Apply |
| Узкий scope | MVP только Devnet verify, $2.8k–$3.5k |
| Регион | Пилот KZ bootcamp в milestone |
| Не дублировать SendAI | Явно: education verification layer |
| Weekly updates | 4 поста минимум после approve |

---

## Рекомендуемый бюджет

**Запрос: $3,000 USDG**

| Milestone | Срок | Deliverable | % |
|-----------|------|-------------|---|
| M1 | Неделя 1 | CLI verify + 2 challenge + RU student-guide draft | 25% |
| M2 | Неделя 2 | 6 task types + multi-RPC + 5 challenges | 25% |
| M3 | Неделя 3 | cohort + mentor-guide + CI green | 25% |
| M4 | Неделя 4 | Пилот ≥10 студентов + публичный отчёт + demo video | 25% |

*По правилам программы: ~25% может прийти после onboarding, остальное по milestone.*

---

## Текст для формы заявки (черновик)

### Project name
SolKaz LearnVerify — Devnet Skill Verification for Kazakhstan Education

### One-liner
Open-source CLI that automatically verifies Solana Devnet homework on-chain for students and bootcamp mentors in Kazakhstan.

### Problem (150 words max)
Solana bootcamps and university courses in Kazakhstan rely on manual verification: mentors open block explorers for dozens of student wallets each week. Screenshots are easy to fake and provide poor feedback. There is no lightweight, Russian-localized, open-source tooling to declaratively define homework (e.g. "sent 0.01 SOL", "created SPL mint") and batch-verify a cohort in minutes. AI agent kits target mainnet DeFi, not classroom assessment.

### Solution
LearnVerify reads a `challenge.yaml` spec and a student's public wallet address, queries Solana Devnet via multiple RPC endpoints, and returns a pass/fail report per task. Mentors run `learnverify cohort` on a CSV of wallets. Bundled challenges align with Solana Foundation curriculum week 1–2. All MIT licensed.

### Why Solana
Devnet offers fast, free iteration for students. On-chain proofs are native to Solana's account model. Verification teaches real builder skills (wallets, signatures, SPL) while supporting the Foundation's education goals.

### Public good
Free, open-source, no API keys required for basic use. Any school in Kazakhstan can fork challenges. We publish pilot results openly.

### Censorship resistance angle
Verification uses consensus across 2+ RPC providers; divergent responses surface warnings—teaching students not to trust a single endpoint.

### Why Kazakhstan
Pilot with Superteam KZ / local bootcamp cohort; Russian documentation; addressing emerging-market education infrastructure gap.

### Proof of work (link)
- GitHub: https://github.com/ron1nrest/solkaz-learnverify
- Demo video (RU, 2–3 min): `YOUR_VIDEO_URL` — сценарий [10-demo-video-script.md](10-demo-video-script.md)
- Sample report: [reports/example-cohort.json](../reports/example-cohort.json)

### Budget ($3,000)
- Engineering & documentation: $2,400
- Pilot workshop / coordination: $400
- RPC / infra buffer: $200

### Timeline
4 weeks from approval to v0.1.0 + pilot report.

### Milestones
(см. таблицу выше)

### Open source commitment
MIT license, public repo from day 1, challenges and CLI open-sourced at v0.1.0.

---

## Письмо Superteam KZ (до Apply)

**To:** talgat@superteam.kz  
**Subject:** LearnVerify — open-source Devnet homework checker for KZ bootcamps

```
Здравствуйте!

Готовлю заявку на Solana Foundation Kazakhstan Grants: LearnVerify —
open-source CLI для автоматической проверки Devnet-заданий (без AI,
не конкурент SendAI).

Цель — снять ручную проверку домашек на bootcamp / AlmaU.
Ищу пилот на 10–15 студентов. MVP за ~3 недели.

Demo: [ссылка]
Repo: [ссылка]

Подскажите, актуален ли пилот для ближайшей когорты?

С уважением,
[Имя]
```

---

## Weekly update template (Twitter / Telegram / Earn)

```
📚 LearnVerify — Week [N]/4

✅ Done:
- ...

🔜 Next:
- ...

📊 Metrics:
- Challenges: X
- Pilot wallets verified: Y

🔗 Repo: [url]
```

---

## Чеклист перед кнопкой Apply

См. полный список: [pow-checklist.md](pow-checklist.md)

- [x] README на русском + MIT
- [x] CLI verify/cohort + 5 YAML + 26 tests
- [x] Grant text: [grant-application-ready.md](grant-application-ready.md)
- [ ] GitHub public + push
- [ ] Demo video записано
- [ ] Email Superteam KZ отправлен
- [ ] Submit Superteam Earn

---

## После approve

1. Onboarding email от Foundation — следовать инструкциям по кошельку SOL.
2. Первый weekly update в течение 7 дней.
3. Не расширять scope без версии v0.2.
4. Финальный deliverable: tag `v0.1.0` + `reports/pilot-YYYY-MM.md` + короткий thread.

---

## Шаблон пилот-отчёта

Файл: [reports/pilot-template.md](../reports/pilot-template.md)

---

## Риски отклонения и ответы

| Вопрос ревьюера | Ответ |
|-----------------|-------|
| «Это как Solana Agent Kit?» | SAK — autonomous agents for protocols; we — read-only education grader for Devnet homework |
| «Зачем грант, если можно волонтёрить?» | 4-week full focus + pilot coordination + RU docs for KZ public good |
| «Mainnet?» | Out of scope v0.1; keeps students safe |
| «Метрики impact?» | Pilot cohort pass rates, hours saved (mentor survey) |

---

## Альтернативные программы (не конфликтовать)

| Program | Когда |
|---------|-------|
| Agentic Engineering Grants ($200) | Не подавать параллельно на тот же scope |
| Superteam Education Fund | Закрыт / другой фокус |
| Solana Foundation direct | После успешного KZ regional grant |
