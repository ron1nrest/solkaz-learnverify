# Test Fixtures

## CI (без Devnet)

Интеграционные тесты в `tests/integration/` мокают RPC — **не требуют сети**.

| Тест | Сценарий |
|------|----------|
| `verify-engine.test.ts` | week0–week3 pass / partial |
| `cohort.test.ts` | пакетный отчёт JSON |

Сценарии описаны в [`golden/manifest.json`](golden/manifest.json).

## Golden wallets (ручной Devnet E2E)

Для проверки на живой сети:

1. Создайте **отдельный** Devnet-кошелёк (Phantom / `solana-keygen new`).
2. **Не коммитьте** seed — только pubkey в таблице ниже (по желанию).
3. Пополните: `solana airdrop 2 <PUBKEY> --url devnet`
4. Выполните задания недели вручную.
5. Запустите:

```bash
# Windows PowerShell
$env:E2E_DEVNET_WALLET="<PUBKEY>"
npm run test:e2e
```

| Сценарий | Challenge | Pubkey (заполнить) | Ожидание |
|----------|-----------|-------------------|----------|
| Pass week0 | `week0-setup.yaml` | | 2/2 |
| Pass week1 | `week1-fundamentals.yaml` | | 3/3 |
| Partial week2 | `week2-spl-intro.yaml` | | 1–2/3 (без SPL) |

## Mock RPC helper

`tests/helpers/mock-rpc.ts` — `mockRpcClient()` / `restoreRpcMocks()` для своих тестов.

## Отчёты cohort (локально)

`reports/test-cohort.json` — gitignored; пример генерируется командой cohort.
