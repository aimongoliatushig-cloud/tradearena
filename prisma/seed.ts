import {
  AccountSize,
  ApplicantStatus,
  ChallengeStep,
  PrismaClient,
  RoomLifecycleStatus,
  RoomPublicStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

import { getDefaultEntryFeeUsd } from "../src/lib/pricing";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  }),
});

async function upsertApplicant(input: {
  roomId: string;
  clerkUserId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  telegramUsername: string;
  desiredAccountSize: AccountSize;
  status: ApplicantStatus;
}) {
  const existing = await prisma.applicant.findFirst({
    where: {
      email: input.email,
      roomId: input.roomId,
    },
  });

  if (existing) {
    return prisma.applicant.update({
      where: { id: existing.id },
      data: input,
    });
  }

  return prisma.applicant.create({
    data: input,
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!", 12);

  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@example.com" },
    update: {
      name: "TradeArena Admin",
      passwordHash,
    },
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      name: "TradeArena Admin",
      passwordHash,
    },
  });

  await prisma.appSetting.upsert({
    where: { key: "default_schedule" },
    update: { value: { updateTimes: ["09:00", "21:00"], timezone: "Asia/Ulaanbaatar" } },
    create: {
      key: "default_schedule",
      value: { updateTimes: ["09:00", "21:00"], timezone: "Asia/Ulaanbaatar" },
    },
  });

  await prisma.appSetting.upsert({
    where: { key: "room_ready_email" },
    update: {
      value: {
        subject: "Your {roomTitle} is ready to start",
        message: [
          "Hello {fullName},",
          "",
          "{roomTitle} is now full and ready to start.",
          "Account size: {roomSize}",
          "Challenge step: {step}",
          "Entry fee: {entryFee}",
          "",
          "Bank: {bankName}",
          "Account holder: {accountHolder}",
          "Account number: {accountNumber}",
          "Reference: {transactionValueHint}",
          "",
          "Room page: {roomUrl}",
        ].join("\n"),
      },
    },
    create: {
      key: "room_ready_email",
      value: {
        subject: "Your {roomTitle} is ready to start",
        message: [
          "Hello {fullName},",
          "",
          "{roomTitle} is now full and ready to start.",
          "Account size: {roomSize}",
          "Challenge step: {step}",
          "Entry fee: {entryFee}",
          "",
          "Bank: {bankName}",
          "Account holder: {accountHolder}",
          "Account number: {accountNumber}",
          "Reference: {transactionValueHint}",
          "",
          "Room page: {roomUrl}",
        ].join("\n"),
      },
    },
  });

  await prisma.appSetting.upsert({
    where: { key: "payment_details" },
    update: {
      value: {
        bankName: "Golomt bank",
        accountHolder: "TradeArena LLC",
        accountNumber: "MN530015001605199269",
        transactionValueHint: "Use your phone number and full name as the payment reference.",
      },
    },
    create: {
      key: "payment_details",
      value: {
        bankName: "Golomt bank",
        accountHolder: "TradeArena LLC",
        accountNumber: "MN530015001605199269",
        transactionValueHint: "Use your phone number and full name as the payment reference.",
      },
    },
  });

  const active10kRoom = await prisma.challengeRoom.upsert({
    where: { slug: "blue-alpha-step-1" },
    update: {
      title: "Blue Alpha Room",
      description: "Active 10K challenge room.",
      accountSize: AccountSize.SIZE_10K,
      step: ChallengeStep.STEP_1,
      entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_10K),
      startDate: dayjs().subtract(3, "day").toDate(),
      endDate: dayjs().add(11, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["09:00", "21:00"],
      updateTimezone: "Asia/Ulaanbaatar",
    },
    create: {
      title: "Blue Alpha Room",
      slug: "blue-alpha-step-1",
      description: "Active 10K challenge room.",
      accountSize: AccountSize.SIZE_10K,
      step: ChallengeStep.STEP_1,
      entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_10K),
      startDate: dayjs().subtract(3, "day").toDate(),
      endDate: dayjs().add(11, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["09:00", "21:00"],
      updateTimezone: "Asia/Ulaanbaatar",
    },
  });

  const active50kRoom = await prisma.challengeRoom.upsert({
    where: { slug: "navy-apex-step-2" },
    update: {
      title: "Navy Apex Room",
      description: "Active 50K step 2 room.",
      accountSize: AccountSize.SIZE_50K,
      step: ChallengeStep.STEP_2,
      entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_50K),
      startDate: dayjs().subtract(6, "day").toDate(),
      endDate: dayjs().add(7, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["08:00", "13:00", "21:00"],
      updateTimezone: "Asia/Ulaanbaatar",
    },
    create: {
      title: "Navy Apex Room",
      slug: "navy-apex-step-2",
      description: "Active 50K step 2 room.",
      accountSize: AccountSize.SIZE_50K,
      step: ChallengeStep.STEP_2,
      entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_50K),
      startDate: dayjs().subtract(6, "day").toDate(),
      endDate: dayjs().add(7, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["08:00", "13:00", "21:00"],
      updateTimezone: "Asia/Ulaanbaatar",
    },
  });

  const completedRoom = await prisma.challengeRoom.upsert({
    where: { slug: "frozen-wave-history" },
    update: {
      title: "Frozen Wave History",
      description: "Completed 25K room example.",
      accountSize: AccountSize.SIZE_25K,
      step: ChallengeStep.STEP_1,
      entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_25K),
      startDate: dayjs().subtract(26, "day").toDate(),
      endDate: dayjs().subtract(5, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.COMPLETED,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["09:00", "21:00"],
      updateTimezone: "Asia/Ulaanbaatar",
    },
    create: {
      title: "Frozen Wave History",
      slug: "frozen-wave-history",
      description: "Completed 25K room example.",
      accountSize: AccountSize.SIZE_25K,
      step: ChallengeStep.STEP_1,
      entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_25K),
      startDate: dayjs().subtract(26, "day").toDate(),
      endDate: dayjs().subtract(5, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.COMPLETED,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["09:00", "21:00"],
      updateTimezone: "Asia/Ulaanbaatar",
    },
  });

  const signupRooms = await Promise.all([
    prisma.challengeRoom.upsert({
      where: { slug: "tradearena-10k-room-1" },
      update: {
        title: "10K Trader Room 1",
        description: "Open signup room for 10K traders.",
        accountSize: AccountSize.SIZE_10K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_10K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
      create: {
        title: "10K Trader Room 1",
        slug: "tradearena-10k-room-1",
        description: "Open signup room for 10K traders.",
        accountSize: AccountSize.SIZE_10K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_10K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
    }),
    prisma.challengeRoom.upsert({
      where: { slug: "tradearena-25k-room-1" },
      update: {
        title: "25K Trader Room 1",
        description: "Open signup room for 25K traders.",
        accountSize: AccountSize.SIZE_25K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_25K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
      create: {
        title: "25K Trader Room 1",
        slug: "tradearena-25k-room-1",
        description: "Open signup room for 25K traders.",
        accountSize: AccountSize.SIZE_25K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_25K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
    }),
    prisma.challengeRoom.upsert({
      where: { slug: "tradearena-50k-room-1" },
      update: {
        title: "50K Trader Room 1",
        description: "Open signup room for 50K traders.",
        accountSize: AccountSize.SIZE_50K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_50K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
      create: {
        title: "50K Trader Room 1",
        slug: "tradearena-50k-room-1",
        description: "Open signup room for 50K traders.",
        accountSize: AccountSize.SIZE_50K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_50K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
    }),
    prisma.challengeRoom.upsert({
      where: { slug: "tradearena-100k-room-1" },
      update: {
        title: "100K Trader Room 1",
        description: "Open signup room for 100K traders.",
        accountSize: AccountSize.SIZE_100K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_100K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
      create: {
        title: "100K Trader Room 1",
        slug: "tradearena-100k-room-1",
        description: "Open signup room for 100K traders.",
        accountSize: AccountSize.SIZE_100K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_100K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
    }),
    prisma.challengeRoom.upsert({
      where: { slug: "tradearena-200k-room-1" },
      update: {
        title: "200K Trader Room 1",
        description: "Open signup room for 200K traders.",
        accountSize: AccountSize.SIZE_200K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_200K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
      create: {
        title: "200K Trader Room 1",
        slug: "tradearena-200k-room-1",
        description: "Open signup room for 200K traders.",
        accountSize: AccountSize.SIZE_200K,
        step: ChallengeStep.STEP_1,
        entryFeeUsd: getDefaultEntryFeeUsd(AccountSize.SIZE_200K),
        startDate: dayjs().toDate(),
        endDate: dayjs().add(30, "day").toDate(),
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
        publicStatus: RoomPublicStatus.PUBLIC,
        updateTimes: ["09:00", "21:00"],
        updateTimezone: "Asia/Ulaanbaatar",
      },
    }),
  ]);

  const traderSeeds = [
    {
      roomId: active10kRoom.id,
      fullName: "B. Temuulen",
      metrixUrl: "https://trader.ftmo.com/metrix/demo-blue-alpha-1",
      currentProfitPercent: 3.42,
      currentProfitAbsolute: 342,
      currentDailyLossValue: -0.92,
      currentMaxLossValue: -1.84,
      currentBalance: 10342,
      currentEquity: 10356,
      rank: 1,
      violationFlag: false,
      violationReason: null,
    },
    {
      roomId: active10kRoom.id,
      fullName: "S. Anu",
      metrixUrl: "https://trader.ftmo.com/metrix/demo-blue-alpha-2",
      currentProfitPercent: 2.8,
      currentProfitAbsolute: 280,
      currentDailyLossValue: -0.61,
      currentMaxLossValue: -1.14,
      currentBalance: 10280,
      currentEquity: 10265,
      rank: 2,
      violationFlag: false,
      violationReason: null,
    },
    {
      roomId: active50kRoom.id,
      fullName: "N. Oyun",
      metrixUrl: "https://trader.ftmo.com/metrix/demo-navy-apex-1",
      currentProfitPercent: 4.76,
      currentProfitAbsolute: 2380,
      currentDailyLossValue: -0.5,
      currentMaxLossValue: -1.04,
      currentBalance: 52380,
      currentEquity: 52360,
      rank: 1,
      violationFlag: false,
      violationReason: null,
    },
    {
      roomId: active50kRoom.id,
      fullName: "D. Enkhjin",
      metrixUrl: "https://trader.ftmo.com/metrix/demo-navy-apex-2",
      currentProfitPercent: 1.46,
      currentProfitAbsolute: 730,
      currentDailyLossValue: -1.1,
      currentMaxLossValue: -1.85,
      currentBalance: 50730,
      currentEquity: 50700,
      rank: 2,
      violationFlag: false,
      violationReason: null,
    },
    {
      roomId: completedRoom.id,
      fullName: "G. Munkh",
      metrixUrl: "https://trader.ftmo.com/metrix/demo-frozen-wave-1",
      currentProfitPercent: 5.36,
      currentProfitAbsolute: 1340,
      currentDailyLossValue: -0.42,
      currentMaxLossValue: -0.9,
      currentBalance: 26340,
      currentEquity: 26355,
      rank: 1,
      violationFlag: false,
      violationReason: null,
    },
    {
      roomId: completedRoom.id,
      fullName: "T. Uyanga",
      metrixUrl: "https://trader.ftmo.com/metrix/demo-frozen-wave-2",
      currentProfitPercent: 4.11,
      currentProfitAbsolute: 1027.5,
      currentDailyLossValue: -0.86,
      currentMaxLossValue: -1.65,
      currentBalance: 26027.5,
      currentEquity: 26010,
      rank: 2,
      violationFlag: false,
      violationReason: null,
    },
  ];

  for (const traderSeed of traderSeeds) {
    const trader = await prisma.trader.upsert({
      where: { metrixUrl: traderSeed.metrixUrl },
      update: {
        roomId: traderSeed.roomId,
        fullName: traderSeed.fullName,
        currentProfitPercent: traderSeed.currentProfitPercent,
        currentProfitAbsolute: traderSeed.currentProfitAbsolute,
        currentDailyLossValue: traderSeed.currentDailyLossValue,
        currentMaxLossValue: traderSeed.currentMaxLossValue,
        currentBalance: traderSeed.currentBalance,
        currentEquity: traderSeed.currentEquity,
        rank: traderSeed.rank,
        latestSnapshotAt: new Date(),
        violationFlag: traderSeed.violationFlag,
        violationReason: traderSeed.violationReason,
      },
      create: {
        roomId: traderSeed.roomId,
        fullName: traderSeed.fullName,
        metrixUrl: traderSeed.metrixUrl,
        currentProfitPercent: traderSeed.currentProfitPercent,
        currentProfitAbsolute: traderSeed.currentProfitAbsolute,
        currentDailyLossValue: traderSeed.currentDailyLossValue,
        currentMaxLossValue: traderSeed.currentMaxLossValue,
        currentBalance: traderSeed.currentBalance,
        currentEquity: traderSeed.currentEquity,
        rank: traderSeed.rank,
        latestSnapshotAt: new Date(),
        violationFlag: traderSeed.violationFlag,
        violationReason: traderSeed.violationReason,
      },
    });

    await prisma.traderSnapshot.create({
      data: {
        traderId: trader.id,
        profitPercent: traderSeed.currentProfitPercent,
        profitAbsolute: traderSeed.currentProfitAbsolute,
        dailyLossValue: traderSeed.currentDailyLossValue,
        maxLossValue: traderSeed.currentMaxLossValue,
        balance: traderSeed.currentBalance,
        equity: traderSeed.currentEquity,
        statusNotes: "Seed snapshot",
        rawPayload: {
          seeded: true,
          note: "Demo snapshot for local development.",
        },
      },
    });
  }

  const completedLeader = await prisma.trader.findFirst({
    where: {
      roomId: completedRoom.id,
      violationFlag: false,
    },
    orderBy: { currentProfitPercent: "desc" },
  });

  if (completedLeader) {
    await prisma.challengeRoom.update({
      where: { id: completedRoom.id },
      data: {
        winnerTraderId: completedLeader.id,
        leaderTraderId: completedLeader.id,
        winnerDeclaredAt: new Date(),
      },
    });
  }

  await upsertApplicant({
    roomId: signupRooms[0].id,
    clerkUserId: "user_seed_10k_1",
    fullName: "E. Solongo",
    email: "solongo@example.com",
    phoneNumber: "+97699112233",
    telegramUsername: "@solongo_fx",
    desiredAccountSize: AccountSize.SIZE_10K,
    status: ApplicantStatus.PENDING,
  });

  await upsertApplicant({
    roomId: signupRooms[0].id,
    clerkUserId: "user_seed_10k_2",
    fullName: "B. Aldar",
    email: "aldar@example.com",
    phoneNumber: "+97699110011",
    telegramUsername: "@aldartrade",
    desiredAccountSize: AccountSize.SIZE_10K,
    status: ApplicantStatus.PENDING,
  });

  await upsertApplicant({
    roomId: signupRooms[2].id,
    clerkUserId: "user_seed_50k_1",
    fullName: "M. Namuun",
    email: "namuun@example.com",
    phoneNumber: "+97688001122",
    telegramUsername: "@namuuncharts",
    desiredAccountSize: AccountSize.SIZE_50K,
    status: ApplicantStatus.PENDING,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
