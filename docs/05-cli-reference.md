# 05. Справочник CLI

Бинарник: **`learnverify`**  
**MVP network:** только Devnet.

---

## Глобальные опции

| Флаг | Описание |
|------|----------|
| `-h, --help` | Справка |
| `-V, --version` | Версия |
| `-v, --verbose` | Подробные логи RPC |
| `--json` | JSON на stdout (где применимо) |
| `--config <path>` | Путь к `learnverify.config.json` |
| `--rpc <url>` | Override primary RPC |
| `--rpc-secondary <url>` | Override secondary RPC |

---

## `learnverify verify`

Проверяет один кошелёк по challenge.

```bash
learnverify verify --wallet <BASE58_PUBKEY> --challenge <PATH_TO_YAML>
```

### Опции

| Опция | Обязательно | Описание |
|-------|-------------|----------|
| `--wallet` | да | Публичный ключ студента |
| `--challenge` | да | Путь к challenge YAML |
| `--json` | нет | JSON-отчёт |
| `--strict-rpc` | нет | Fail при RPC divergence (default: warn) |

### Пример (human output)

```
SolKaz LearnVerify v0.1.0
Challenge: kz-week1-fundamentals (Devnet)
Wallet: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

  ✓ funded-wallet          balance ≥ 0.1 SOL
  ✓ sent-to-peer           sent ≥ 0.01 SOL
  ✗ created-mint           SPL mint not found

Result: 2/3 passed (66%)
Hint: Выполните spl-token create-token или задание из student-guide §4

Duration: 8.2s | RPC: primary OK, secondary OK
Exit code: 1
```

### Exit codes

| Code | Значение |
|------|----------|
| 0 | Все tasks `pass` |
| 1 | Есть `fail`, нет `error` |
| 2 | Ошибка CLI/RPC/валидации challenge |

### JSON schema (verify report)

```json
{
  "challengeId": "kz-week1-fundamentals",
  "network": "devnet",
  "wallet": "7xKX...",
  "passed": 2,
  "total": 3,
  "success": false,
  "tasks": [
    {
      "name": "funded-wallet",
      "type": "balance_min",
      "status": "pass",
      "message": "balance ≥ 0.1 SOL",
      "evidence": { "lamports": 1500000000 }
    }
  ],
  "rpcWarnings": [],
  "durationMs": 8200
}
```

---

## `learnverify cohort`

Пакетная проверка.

```bash
learnverify cohort \
  --challenge challenges/examples/week1-fundamentals.yaml \
  --wallets ./cohort.csv \
  --out ./reports/cohort-week1.json
```

### CSV формат

```csv
wallet,name
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,Алия
9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM,Данияр
```

- Первая строка — заголовок (обязателен).
- Колонка `wallet` обязательна; `name` опциональна.

### Опции

| Опция | Описание |
|-------|----------|
| `--strict` | Exit 1 если хотя бы один кошелёк не 100% |
| `--delay-ms` | Пауза между кошельками (default 200) |

### Summary output

```
Cohort report: 30 wallets | 24 full pass | 4 partial | 2 error
Saved: reports/cohort-week1.json
```

---

## `learnverify list-tasks`

Показывает задачи challenge без RPC.

```bash
learnverify list-tasks --challenge challenges/examples/week2-spl-intro.yaml
```

---

## `learnverify challenges`

Список встроенных challenge из `challenges/examples/`.

```bash
learnverify challenges
```

---

## `learnverify doctor`

Диагностика окружения.

```bash
learnverify doctor
```

Проверяет:
- версию Node (≥ 20)
- доступность primary/secondary RPC
- `getVersion`, slot, latency
- что `network` в конфиге = devnet

Пример:

```
✓ Node v22.x
✓ RPC primary: slot 285001234 (420ms)
✓ RPC secondary: slot 285001230 (380ms)
⚠ Slot drift 4 — acceptable
✓ Ready for Devnet verification
```

---

## Переменные окружения

| Variable | Описание |
|----------|----------|
| `HELIUS_API_KEY` | Если задан — подставляется Helius devnet URL |
| `LEARNVERIFY_RPC_PRIMARY` | Primary RPC |
| `LEARNVERIFY_RPC_SECONDARY` | Secondary RPC |
| `LEARNVERIFY_CONFIG` | Путь к config file |

---

## Примеры сценариев

### Студент: самопроверка

```bash
learnverify verify \
  --wallet "$(solana address)" \
  --challenge challenges/examples/week1-fundamentals.yaml
```

### Ментор: пятница, вся группа

```bash
learnverify cohort \
  --challenge challenges/examples/week1-fundamentals.yaml \
  --wallets almau-cohort-03.csv \
  --out reports/almau-w1.json \
  --strict
```

### CI (post-MVP v0.2)

```yaml
- run: npx learnverify verify --wallet ${{ env.STUDENT_WALLET }} --challenge ./week1.yaml --json
```
