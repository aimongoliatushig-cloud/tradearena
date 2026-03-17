# FTMO Challenge Rooms Leaderboard

Next.js App Router дээр суурилсан, FTMO public MetriX URL-уудаас Playwright ашиглан статистик татаж leaderboard үүсгэдэг MVP платформ.

## Гол боломжууд

- Нийтэд нээлттэй public route-ууд:
  - `/`
  - `/rooms`
  - `/rooms/[id]`
  - `/history`
  - `/apply`
- Админ route-ууд:
  - `/admin/login`
  - `/admin`
  - `/admin/rooms`
  - `/admin/rooms/new`
  - `/admin/rooms/[id]`
  - `/admin/applicants`
  - `/admin/traders`
  - `/admin/logs`
  - `/admin/settings`
- PostgreSQL + Prisma ORM өгөгдлийн загвар
- Playwright дээр суурилсан FTMO scrape service
- Snapshot history хадгалалт
- Scheduler endpoint болон `node-cron` worker
- Admin-only secure login
- Applicant workflow, invitation template, email/Telegram integration-ready бүтэц

## Технологийн стек

- Next.js 16 App Router
- TypeScript
- React 19
- Tailwind CSS v4
- shadcn/ui
- Prisma 7 + PostgreSQL
- Playwright
- node-cron
- Zod
- SWR
- Nodemailer
- dayjs

## Хурдан эхлүүлэх

1. Dependency суулгана.

```bash
npm install
```

2. `.env.example`-г `.env` болгон хуулж утгуудыг тохируулна.

3. PostgreSQL ажиллуулна.

4. Prisma client болон migration ажиллуулна.

```bash
npm run db:generate
npm run db:migrate
```

5. Demo өгөгдөл seed хийнэ.

```bash
npm run db:seed
```

6. Playwright browser суулгана.

```bash
npm run playwright:install
```

7. App-аа асаана.

```bash
npm run dev
```

8. Scheduler worker ажиллуулна.

```bash
npm run worker
```

## Админ нэвтрэх

- Админ имэйл: `.env` дахь `ADMIN_EMAIL`
- Админ нууц үг: `.env` дахь `ADMIN_PASSWORD`
- Seed script эдгээрээр admin user үүсгэнэ.

## Орчны хувьсагчид

Үндсэн хувьсагчууд:

- `DATABASE_URL`
- `APP_BASE_URL`
- `APP_TIMEZONE`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `JOB_SHARED_SECRET`
- `FTMO_REQUEST_TIMEOUT_MS`
- `FTMO_MAX_RETRIES`
- `FTMO_BROWSER_HEADLESS`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Prisma schema

Бүрэн schema: [prisma/schema.prisma](/D:/ftmostats/prisma/schema.prisma)

Model-ууд:

- `AdminUser`
- `AdminSession`
- `ChallengeRoom`
- `Trader`
- `TraderSnapshot`
- `Applicant`
- `NotificationDispatch`
- `JobRunLog`
- `AppSetting`
- `SubmissionAttempt`

Enum-ууд:

- `AccountSize`
- `ChallengeStep`
- `RoomPublicStatus`
- `RoomLifecycleStatus`
- `ApplicantStatus`
- `JobType`
- `JobStatus`
- `FetchSource`
- `NotificationChannel`
- `NotificationKind`
- `NotificationStatus`

## Гол холбоосууд

- Нэг `ChallengeRoom` олон `Trader`-тай.
- Нэг `Trader` олон `TraderSnapshot`-тай.
- `ChallengeRoom` нь `leaderTraderId` болон `winnerTraderId`-аар `Trader` руу холбогдоно.
- `Applicant` нь хүсвэл `ChallengeRoom`-д assign хийгдэж болно.
- `NotificationDispatch` нь `Applicant` болон `ChallengeRoom`-тай optional байдлаар холбогдоно.
- `JobRunLog` нь room-level болон trader-level scrape/event лог хадгална.
- `AppSetting` нь default schedule болон invitation template хадгална.
- `SubmissionAttempt` нь `/apply` form rate limit-ийн audit trail болно.

## Worker / Scheduler дизайн

### 1. Worker процесс

- Файл: [src/workers/runner.ts](/D:/ftmostats/src/workers/runner.ts)
- `node-cron` ашиглаад минут тутам tick хийнэ.
- Tick бүр:
  - lifecycle status sync хийнэ
  - active room-уудын schedule-ийг шалгана
  - тухайн минутанд өмнө нь ажилласан эсэхийг `JobRunLog`-оор шалгана
  - due room бүр дээр scrape ажиллуулна

### 2. Manual trigger

- CLI: `npm run jobs:run-now`
- API: `POST /api/jobs/scheduler`
- Header: `x-job-secret: <JOB_SHARED_SECRET>`

### 3. Overlap хамгаалалт

- Worker дотор process-level `running` flag ашиглана.
- DB дээр `JobRunLog.scheduledFor` ашиглан ижил минутын duplicate run-ийг алгасна.

## FTMO scraping service

Файл: [src/server/services/scrape-service.ts](/D:/ftmostats/src/server/services/scrape-service.ts)

Онцлогууд:

- `fetch` + HTML parse дээр найдаагүй
- Playwright Chromium ашиглана
- `domcontentloaded` + wait + visible text parse стратеги
- timeout, retry, logging-той
- body text дээр fallback parse хийдэг
- selector/comment-уудаар FTMO DOM өөрчлөгдвөл аль хэсгийг update хийхийг заасан

## Public user flow

1. Хэрэглэгч `/`, `/rooms`, `/history` дээр room card-уудыг нээлттэй үзнэ.
2. `/rooms/[id]` дээр leaderboard, progress, violation, winner мэдээлэл харна.
3. `/apply` дээр account size сонгож өргөдөл илгээнэ.
4. Өргөдөл шууд room-д орохгүй, admin review-д орно.

## Admin flow

1. `/admin/login` дээр нэвтэрнэ.
2. `/admin/rooms` дээр room үүсгэж, засаж, schedule ба lifecycle удирдана.
3. `/admin/rooms/[id]` дээр trader нэмэх, edit хийх, violation тэмдэглэх, manual refresh хийх боломжтой.
4. `/admin/applicants` дээр account size bucket-уудаар өргөдлүүдийг хянаж, status update хийнэ.
5. 10 applicant бүрдвэл invitation form-оор email/Telegram-ready dispatch workflow эхлүүлнэ.
6. `/admin/logs` дээр scrape лог болон алдааг live-refresh байдлаар харна.
7. `/admin/settings` дээр default schedule, invitation template-ийг шинэчилнэ.

## Project folder structure

```text
.
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ admin/
│  │  │  ├─ (dashboard)/
│  │  │  └─ login/
│  │  ├─ api/
│  │  ├─ apply/
│  │  ├─ history/
│  │  ├─ rooms/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ forms/
│  │  ├─ layout/
│  │  ├─ shared/
│  │  └─ ui/
│  ├─ lib/
│  ├─ server/
│  │  ├─ actions/
│  │  └─ services/
│  └─ workers/
├─ .env.example
├─ package.json
└─ prisma.config.ts
```

## Local verification

Ажиллуулж шалгасан:

- `npm run db:generate`
- `npm run lint`
- `npm run build`

## Production deployment зөвлөмж

- Web app болон worker-ийг тусдаа process/service болгож ажиллуул.
- PostgreSQL managed service ашигла.
- `JOB_SHARED_SECRET`, `ADMIN_SESSION_SECRET`-ийг production secret manager-т хадгал.
- Playwright-той worker-д Chromium binary суусан байх ёстой.
- Web tier-ээс scheduler-г салгаж ажиллуулах нь найдвартай.

## FTMO dependency risk notes

- FTMO DOM structure өөрчлөгдвөл scrape parse эвдэрч болно.
- Cookie/consent UI нэмэгдвэл wait strategy update шаардлагатай.
- Public MetriX page partial render эсвэл lazy load байвал parse incomplete болох эрсдэлтэй.
- FTMO page дээр metric label өөрчлөгдвөл regex/selector adjustment хэрэгтэй.
- MVP дээр violation auto-detection бүрэн биш, admin manual override гол механизм хэвээр.

## Дараагийн санал болгож буй upgrade-ууд

- BullMQ + Redis queue ашиглаж scrape concurrency-г илүү найдвартай болгох
- Telegram Bot API auto-send production implementation
- FTMO page parser-д visual regression / selector smoke test нэмэх
- Applicant selection UI-г checkbox-based bulk action болгох
- Snapshot chart болон performance sparkline нэмэх
- Admin audit log болон action-level RBAC нэмэх
- Sentry/structured logging integration нэмэх
#   t r a d e a r e n a  
 