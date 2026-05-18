# Руководство для ментора

Как провести неделю курса с **LearnVerify**: от выдачи challenge до отчёта по группе.

---

## 1. Подготовка недели

1. Выберите challenge из `challenges/examples/` или форкните YAML.
2. Прочитайте задачи: `learnverify list-tasks --challenge <file>`.
3. **Сами пройдите** challenge на тестовом Devnet-кошельке.
4. Разошлите студентам:
   - ссылку на [student-guide.md](student-guide.md)
   - файл `weekN-....yaml`
   - дедлайн и формат сдачи (только pubkey)

---

## 2. Формат сдачи

Попросите CSV или таблицу:

```csv
wallet,name
...
```

Не собирайте seed phrase и не просите скриншоты Explorer.

---

## 3. Установка (один раз)

```powershell
cd SolanaAI
npm install
npm run build
npm link
```

Проверка окружения: `learnverify doctor`

## 4. Пакетная проверка

```powershell
learnverify cohort `
  -c week1-fundamentals.yaml `
  --wallets cohort-week1.csv `
  --out reports/cohort-week1.json `
  -v `
  --strict
```

Флаги:
- `-v` — таблица по каждому студенту  
- `--strict` — exit code 1, если не все 100% (для скриптов)  
- `--delay-ms 300` — пауза между кошельками (RPC)

Образец отчёта для гранта: [reports/example-cohort.json](../reports/example-cohort.json)

### Интерпретация summary

```
30 wallets | 24 full pass | 4 partial | 2 error
```

| Категория | Действие |
|-----------|----------|
| full pass | Зачёт |
| partial | Указать студенту failing `task` из JSON |
| error | Проверить валидность адреса / RPC; повторить cohort |

### Флаг `--strict`

Используйте в CI или автоматизации: exit code 1, если не все 100%.

---

## 5. Разбор с отстающими

Откройте `reports/cohort-week1.json`. Для каждого студента с `success: false` найдите `tasks[]` со `status: "fail"` — поле `hint` можно переслать в Telegram.

Пример сообщения студенту:

> Привет! По week1 не хватает задачи `sent-to-peer`: нужен исходящий перевод ≥ 0.01 SOL на Devnet. Подсказка: student-guide §3. После tx подожди 10 сек и снова `learnverify verify`.

---

## 6. Пилот для гранта / отчётность

Заполните [reports/pilot-template.md](../reports/pilot-template.md) после недели:

- число студентов
- % pass
- оценка сэкономленных часов (до/после)
- 2–3 цитаты обратной связи (анонимно)

---

## 7. Создание своего challenge

1. Copy `week1-fundamentals.yaml` → `custom-lab-03.yaml`
2. Измените `id`, `tasks`
3. `learnverify verify` на своём кошельке
4. Выдайте группе

Спека полей: [04-challenge-spec.md](04-challenge-spec.md).

---

## 8. Безопасность в классе

- Напомните про отдельный учебный кошелёк.
- Запретите сдачу приватных ключей.
- См. [08-security.md](08-security.md).

---

## 9. Контакты Superteam KZ

Если проводите официальный пилот bootcamp — согласуйте с talgat@superteam.kz для связки с грантом LearnVerify.

---

## Типичный календарь недели

| День | Действие |
|------|----------|
| Пн | Выдача challenge + лекция |
| Ср | Опционально: самопроверка студентами |
| Пт 18:00 | Дедлайн pubkey |
| Пт 18:30 | `learnverify cohort` → отчёт |
| Сб | Разбор fail + office hours |

**Оценка времени ментора:** ~20–30 мин вместо 2–4 часов ручной проверки на 30 человек.
