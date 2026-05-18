# Руководство для студента

Как выполнить задание и проверить себя через **LearnVerify** на Devnet.

> **Важно:** LearnVerify никогда не просит seed phrase или приватный ключ. Только публичный адрес кошелька.

---

## 1. Кошелёк и Devnet

1. Установите [Phantom](https://phantom.app/) или [Solflare](https://solflare.com/).
2. Создайте новый кошелёк **для учёбы**.
3. В настройках включите **Devnet** (Testnet mode).
4. Скопируйте **публичный адрес** (Public Key) — длинная строка base58.

---

## 2. Получить тестовые SOL (faucet)

**Вариант A — Phantom:** Settings → Developer Settings → Devnet → Airdrop.

**Вариант B — CLI:**

```bash
solana config set --url devnet
solana airdrop 2 ВАШ_ПУБЛИЧНЫЙ_АДРЕС
```

Подождите 10–20 секунд. Проверьте баланс в Explorer:  
https://explorer.solana.com/?cluster=devnet

---

## 3. Выполнить задание недели

Откройте файл challenge от ментора, например `week1-fundamentals.yaml`.

Типичные шаги недели 1:
- Иметь ≥ 0.1 SOL на балансе
- Отправить другу ≥ 0.01 SOL (адрес даст ментор или одногруппник)

Для недели 2 (SPL):
- Создать токен через `spl-token create-token` или урок ментора
- Создать token account

---

## 4. Установка LearnVerify

Из папки проекта (нужен [Node.js 20+](https://nodejs.org/)):

```powershell
git clone https://github.com/ron1nrest/solkaz-learnverify.git
cd SolanaAI
npm install
npm run build
npm link
```

Без `npm link` можно так: `npm run dev -- verify ...`

## 5. Самопроверка

```powershell
learnverify verify --wallet ВАШ_ПУБЛИЧНЫЙ_АДРЕС -c week1-fundamentals.yaml
```

Или из репозитория:

```powershell
npm run dev -- verify --wallet ВАШ_ПУБЛИЧНЫЙ_АДРЕС -c challenges/examples/week1-fundamentals.yaml
```

### Как читать результат

| Символ | Значение |
|--------|----------|
| ✓ | Задание выполнено on-chain |
| ✗ | Ещё не выполнено — читайте Hint |
| ⚠ | Проблема RPC — попробуйте через минуту |

Если только что отправили транзакцию — подождите **10 секунд** и запустите снова.

---

## 6. Сдача ментору

Отправьте **только публичный адрес** (и ФИО, если просят) — не скриншоты.

---

## RPC и почему это важно {#rpc}

LearnVerify спрашивает несколько RPC-узлов Solana. Если ответы различаются, вы увидите предупреждение.

**Урок:** приложения не должны зависеть от одного посредника — это часть устойчивости и censorship resistance в Web3.

---

## FAQ

**Можно ли использовать mainnet?**  
Нет. В курсе используется только Devnet.

**LearnVerify списывает SOL?**  
Нет. Программа только читает данные из сети.

**Все задачи ✓, а ментор говорит не зачтено?**  
Убедитесь, что сдали тот же адрес и тот же файл challenge, что у группы.

**Ошибка «429» / rate limit**  
Подождите 1 минуту. Ментор может добавить `HELIUS_API_KEY` в `.env` (см. README).

**Команда `list-tasks`**  
Показать задания недели без RPC:  
`learnverify list-tasks -c week1-fundamentals.yaml`

---

## Полезные ссылки

- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)
- [Solana Foundation Curriculum](https://github.com/solana-foundation/curriculum)
- Документация проекта: [docs/01-overview.md](01-overview.md)
