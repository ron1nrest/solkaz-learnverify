# Заявка Superteam Earn — готовые тексты (copy-paste)

**Программа:** [Solana Foundation Kazakhstan Grants](https://superteam.fun/earn/grants/solana-foundation-kazakhstan-grants)  
**Сумма:** $3,000 USDG  
**Репозиторий:** замените `YOUR_GITHUB_URL` перед отправкой

---

## English fields (если форма на EN)

### Project title
SolKaz LearnVerify — Devnet Skill Verification for Kazakhstan Education

### Short description (one line)
Open-source CLI that auto-verifies Solana Devnet homework on-chain for KZ students and bootcamp mentors.

### Problem
Bootcamps and universities in Kazakhstan still verify Solana homework manually in block explorers. Screenshots are easy to fake; mentors spend hours per cohort. There is no Russian-localized, open-source tool to define homework declaratively (`challenge.yaml`) and batch-check wallets. AI agent kits target mainnet DeFi—not classroom grading.

### Solution
LearnVerify reads a student's public Devnet wallet and a YAML challenge spec, queries Solana via RPC (multi-endpoint consensus for balances), and returns per-task pass/fail hints. Mentors run `learnverify cohort` on a CSV. Five weekly challenges ship with the repo (MIT). v0.1.0 implemented: 6 task types, CLI, CI, 26+ tests.

### Why Solana
Devnet enables free, fast iteration. On-chain activity is the proof of work—aligned with Solana's account model and education goals (Solana U, Foundation curriculum).

### Public good
MIT license; no API key required for basic RPC; any KZ school can fork challenges; pilot report published openly.

### Censorship resistance
Balance checks use 2+ RPC endpoints; mismatches surface warnings—teaching not to trust a single endpoint.

### Region / Kazakhstan
Russian docs; built for Superteam KZ / AlmaU-style bootcamps; pilot cohort planned locally.

### Proof of work
- Repo: YOUR_GITHUB_URL
- Demo (RU, 2–3 min): YOUR_VIDEO_URL
- Sample cohort JSON: `reports/example-cohort.json` in repo
- CLI: `learnverify` v0.1.0 — verify, cohort, doctor, 5 challenges

### Funding request: $3,000
| Use | Amount |
|-----|--------|
| Engineering & maintenance (4 weeks) | $2,400 |
| Pilot coordination (bootcamp week) | $400 |
| RPC / tooling buffer | $200 |

### Timeline: 4 weeks from approval

| Week | Deliverable |
|------|-------------|
| 1 | M1: verify + guides (done in repo) |
| 2 | M2: all verifiers + 5 challenges (done) |
| 3 | M3: cohort + CI (done) |
| 4 | M4: pilot ≥10 students + public report + demo |

*Note to reviewer: core MVP already built; grant funds pilot scale-up, polish, and community distribution in KZ.*

### Milestones (payment)
25% × 4 milestones as in [07-grant-playbook.md](07-grant-playbook.md)

### Open source
MIT, public GitHub, challenges + CLI in repo at v0.1.0.

---

## Русские поля (если есть свободный текст)

### Название
SolKaz LearnVerify — проверка навыков Solana на Devnet для образования в Казахстане

### Суть
Open-source CLI: ментор описывает задание в YAML, студент делает практику на Devnet, программа по публичному адресу кошелька выдаёт отчёт ✓/✗. Пакетная проверка группы из CSV. Не AI-бот, не mainnet — инфраструктура для bootcamp'ов.

### Почему не SendAI Agent Kit
SendAI — автономные агенты для протоколов и DeFi. LearnVerify — read-only проверка учебных домашек на Devnet.

### Контакт для пилота
talgat@superteam.kz (согласование когорты)

---

## Чеклист перед Submit

- [ ] GitHub public + README
- [ ] Вставить YOUR_GITHUB_URL и YOUR_VIDEO_URL выше
- [ ] Записать demo по [10-demo-video-script.md](10-demo-video-script.md)
- [ ] Email Superteam KZ (шаблон в [07-grant-playbook.md](07-grant-playbook.md))
- [ ] Submit на Superteam Earn
