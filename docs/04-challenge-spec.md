# 04. Спецификация Challenge (YAML)

## Обзор

Challenge — декларативный файл формата YAML, описывающий набор **проверяемых on-chain условий** для одного кошелька на указанной сети.

**MVP:** только `network: devnet`.

---

## Корневая структура

```yaml
# Обязательные поля
id: string              # уникальный slug, kebab-case
version: 1              # версия формата spec
network: devnet         # devnet | (mainnet — не в MVP)

# Метаданные (для людей)
title:
  ru: string
  en: string            # опционально
description:
  ru: string
estimated_minutes: number

# Список задач (выполняются по порядку отчёта, не по зависимостям)
tasks:
  - name: string
    type: string        # см. реестр типов
    # ... параметры типа
    hint:
      ru: string        # опционально, переопределяет дефолт
```

---

## JSON Schema

Файл: [`schema/challenge.schema.json`](../schema/challenge.schema.json) (генерируется/поддерживается в этапе 1).

Валидация при:
- `learnverify verify` (load time)
- CI: `npm run validate-challenges`

---

## Реестр типов задач (MVP)

### `balance_min`

Минимальный баланс SOL (lamports) на кошельке.

```yaml
- name: funded-wallet
  type: balance_min
  lamports: 100000000    # 0.1 SOL
```

| Поле | Тип | Обязательно |
|------|-----|-------------|
| `lamports` | integer ≥ 0 | да |

---

### `signature_count_min`

Минимум подтверждённых транзакций, где кошелёк — fee payer / signer.

```yaml
- name: was-active
  type: signature_count_min
  count: 3
  limit: 100            # опционально, глубина поиска sigs (default 100)
```

| Поле | Тип | Default |
|------|-----|---------|
| `count` | integer ≥ 1 | — |
| `limit` | integer | 100 |

---

### `transfer_sent`

Исходящий перевод нативного SOL с кошелька студента.

```yaml
- name: sent-to-peer
  type: transfer_sent
  min_lamports: 10000000   # 0.01 SOL
  # to: <pubkey>           # опционально: конкретный получатель
```

| Поле | Тип | Обязательно |
|------|-----|-------------|
| `min_lamports` | integer | да |
| `to` | base58 pubkey | нет |

**Алгоритм (MVP):**  
`getSignaturesForAddress(wallet, { limit })` → для каждой sig `getTransaction` → разбор `preBalances` / `postBalances` / `accountKeys` на предмет уменьшения баланса wallet и увеличения другого аккаунта.

---

### `transfer_received`

Входящий перевод SOL на кошелёк студента.

```yaml
- name: received-airdrop-or-transfer
  type: transfer_received
  min_lamports: 5000000
```

---

### `spl_mint_created`

Кошелёк является `mintAuthority` хотя бы одного SPL Mint с заданными параметрами.

```yaml
- name: created-class-token
  type: spl_mint_created
  decimals: 9
  # freeze_authority: disabled | any  # опционально
```

| Поле | Тип | Default |
|------|-----|---------|
| `decimals` | 0–9 | 9 |
| `freeze_authority` | enum | любой |

**Алгоритм (MVP):**  
Поиск через signatures → `getParsedTransaction` / parsed token balances; альтернатива: `getTokenAccountsByOwner` не находит mint — скан последних N tx (документированный лимит).

---

### `spl_token_account`

Существует Associated Token Account для указанного mint (или любого mint студента).

```yaml
- name: has-ata
  type: spl_token_account
  mint: <base58>          # опционально; без mint — любой ATA владельца
```

---

## Поведение при ошибках парсинга

| Ситуация | Поведение CLI |
|----------|---------------|
| Неизвестный `type` | Exit 2, сообщение со списком известных типов |
| `network !== devnet` | Exit 2, «MVP supports devnet only» |
| Невалидный YAML | Exit 2 + путь к строке |
| Отсутствует `name` у task | Exit 2 |

---

## Подсказки (hints)

Приоритет текста для студента:

1. `task.hint.ru` из YAML  
2. Встроенный шаблон verifier'а на русском  
3. Generic: «Выполните требования задачи {name}»

---

## Версионирование spec

| version | Изменения |
|---------|-----------|
| 1 | MVP types (6 типов) |
| 2 | + `program_deployed`, `instruction_emitted` |

При `version: 2` в старом CLI — предупреждение обновить learnverify.

---

## Примеры bundled challenges

См. каталог [challenges/examples/](../challenges/examples/).

| Файл | id |
|------|-----|
| week0-setup.yaml | kz-week0-setup |
| week1-fundamentals.yaml | kz-week1-fundamentals |
| week2-spl-intro.yaml | kz-week2-spl-intro |
| week3-activity.yaml | kz-week3-activity |
| week4-review.yaml | kz-week4-review |

---

## Создание своего challenge (для менторов)

1. Скопировать `week1-fundamentals.yaml`.
2. Изменить `id`, `title`, `tasks`.
3. Проверить: `learnverify list-tasks --challenge ./my.yaml`.
4. Прогнать на своём Devnet-кошельке.
5. (Опционально) PR в репозиторий для community pack.
