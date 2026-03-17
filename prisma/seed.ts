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

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!", 12);

  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@example.com" },
    update: {
      name: "FTMO Админ",
      passwordHash,
    },
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      name: "FTMO Админ",
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
    where: { key: "invitation_templates" },
    update: {
      value: {
        subject: "FTMO Challenge Room урилга",
        message:
          "Сайн байна уу,\n\nТаны өргөдөл room-д сонгогдлоо. Доорх холбоосоор орж зааврыг дагана уу.\n\n{roomLink}\n\n{extraInstructions}",
      },
    },
    create: {
      key: "invitation_templates",
      value: {
        subject: "FTMO Challenge Room урилга",
        message:
          "Сайн байна уу,\n\nТаны өргөдөл room-д сонгогдлоо. Доорх холбоосоор орж зааврыг дагана уу.\n\n{roomLink}\n\n{extraInstructions}",
      },
    },
  });

  const roomSeeds = [
    {
      slug: "blue-alpha-step-1",
      title: "Blue Alpha Room",
      description: "10К ангиллын идэвхтэй сорилтын өрөө.",
      accountSize: AccountSize.SIZE_10K,
      step: ChallengeStep.STEP_1,
      startDate: dayjs().subtract(3, "day").toDate(),
      endDate: dayjs().add(11, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["09:00", "21:00"],
      traders: [
        {
          fullName: "Б. Тэмүүлэн",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-blue-alpha-1",
          currentProfitPercent: 3.42,
          currentProfitAbsolute: 342,
          currentDailyLossValue: -0.92,
          currentMaxLossValue: -1.84,
          currentBalance: 10342,
          currentEquity: 10356,
          rank: 1,
        },
        {
          fullName: "С. Ану",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-blue-alpha-2",
          currentProfitPercent: 2.8,
          currentProfitAbsolute: 280,
          currentDailyLossValue: -0.61,
          currentMaxLossValue: -1.14,
          currentBalance: 10280,
          currentEquity: 10265,
          rank: 2,
        },
        {
          fullName: "Э. Билгүүн",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-blue-alpha-3",
          currentProfitPercent: -1.12,
          currentProfitAbsolute: -112,
          currentDailyLossValue: -1.8,
          currentMaxLossValue: -2.31,
          currentBalance: 9888,
          currentEquity: 9899,
          rank: 3,
        },
      ],
    },
    {
      slug: "navy-apex-step-2",
      title: "Navy Apex Room",
      description: "50К ангиллын Step 2 өрөө.",
      accountSize: AccountSize.SIZE_50K,
      step: ChallengeStep.STEP_2,
      startDate: dayjs().subtract(6, "day").toDate(),
      endDate: dayjs().add(7, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["08:00", "13:00", "21:00"],
      traders: [
        {
          fullName: "Н. Оюун",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-navy-apex-1",
          currentProfitPercent: 4.76,
          currentProfitAbsolute: 2380,
          currentDailyLossValue: -0.5,
          currentMaxLossValue: -1.04,
          currentBalance: 52380,
          currentEquity: 52360,
          rank: 1,
        },
        {
          fullName: "Д. Энхжин",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-navy-apex-2",
          currentProfitPercent: 1.46,
          currentProfitAbsolute: 730,
          currentDailyLossValue: -1.1,
          currentMaxLossValue: -1.85,
          currentBalance: 50730,
          currentEquity: 50700,
          rank: 2,
        },
      ],
    },
    {
      slug: "frozen-wave-history",
      title: "Frozen Wave History",
      description: "Дууссан өрөөний жишээ.",
      accountSize: AccountSize.SIZE_25K,
      step: ChallengeStep.STEP_1,
      startDate: dayjs().subtract(26, "day").toDate(),
      endDate: dayjs().subtract(5, "day").toDate(),
      lifecycleStatus: RoomLifecycleStatus.COMPLETED,
      publicStatus: RoomPublicStatus.PUBLIC,
      updateTimes: ["09:00", "21:00"],
      traders: [
        {
          fullName: "Г. Мөнх",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-frozen-wave-1",
          currentProfitPercent: 5.36,
          currentProfitAbsolute: 1340,
          currentDailyLossValue: -0.42,
          currentMaxLossValue: -0.9,
          currentBalance: 26340,
          currentEquity: 26355,
          rank: 1,
        },
        {
          fullName: "Т. Уянга",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-frozen-wave-2",
          currentProfitPercent: 4.11,
          currentProfitAbsolute: 1027.5,
          currentDailyLossValue: -0.86,
          currentMaxLossValue: -1.65,
          currentBalance: 26027.5,
          currentEquity: 26010,
          rank: 2,
        },
        {
          fullName: "П. Саруул",
          metrixUrl: "https://trader.ftmo.com/metrix/demo-frozen-wave-3",
          currentProfitPercent: 3.58,
          currentProfitAbsolute: 895,
          currentDailyLossValue: -1.91,
          currentMaxLossValue: -5.23,
          currentBalance: 25895,
          currentEquity: 25860,
          rank: 3,
          violationFlag: true,
          violationReason: "Өдрийн алдагдлын дүрэм зөрчсөн",
        },
      ],
    },
  ];

  for (const roomSeed of roomSeeds) {
    const room = await prisma.challengeRoom.upsert({
      where: { slug: roomSeed.slug },
      update: {
        title: roomSeed.title,
        description: roomSeed.description,
        accountSize: roomSeed.accountSize,
        step: roomSeed.step,
        startDate: roomSeed.startDate,
        endDate: roomSeed.endDate,
        lifecycleStatus: roomSeed.lifecycleStatus,
        publicStatus: roomSeed.publicStatus,
        updateTimes: roomSeed.updateTimes,
      },
      create: {
        title: roomSeed.title,
        slug: roomSeed.slug,
        description: roomSeed.description,
        accountSize: roomSeed.accountSize,
        step: roomSeed.step,
        startDate: roomSeed.startDate,
        endDate: roomSeed.endDate,
        lifecycleStatus: roomSeed.lifecycleStatus,
        publicStatus: roomSeed.publicStatus,
        updateTimes: roomSeed.updateTimes,
      },
    });

    for (const traderSeed of roomSeed.traders) {
      const trader = await prisma.trader.upsert({
        where: { metrixUrl: traderSeed.metrixUrl },
        update: {
          roomId: room.id,
          fullName: traderSeed.fullName,
          currentProfitPercent: traderSeed.currentProfitPercent,
          currentProfitAbsolute: traderSeed.currentProfitAbsolute,
          currentDailyLossValue: traderSeed.currentDailyLossValue,
          currentMaxLossValue: traderSeed.currentMaxLossValue,
          currentBalance: traderSeed.currentBalance,
          currentEquity: traderSeed.currentEquity,
          rank: traderSeed.rank,
          latestSnapshotAt: new Date(),
          violationFlag: "violationFlag" in traderSeed ? traderSeed.violationFlag ?? false : false,
          violationReason: "violationReason" in traderSeed ? traderSeed.violationReason ?? null : null,
        },
        create: {
          roomId: room.id,
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
          violationFlag: "violationFlag" in traderSeed ? traderSeed.violationFlag ?? false : false,
          violationReason: "violationReason" in traderSeed ? traderSeed.violationReason ?? null : null,
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
  }

  const completedRoom = await prisma.challengeRoom.findUnique({
    where: { slug: "frozen-wave-history" },
    include: { traders: { where: { violationFlag: false }, orderBy: { currentProfitPercent: "desc" } } },
  });

  if (completedRoom?.traders[0]) {
    await prisma.challengeRoom.update({
      where: { id: completedRoom.id },
      data: {
        winnerTraderId: completedRoom.traders[0].id,
        leaderTraderId: completedRoom.traders[0].id,
        winnerDeclaredAt: new Date(),
      },
    });
  }

  const applicantSeeds = [
    {
      fullName: "Э. Солонго",
      email: "solongo@example.com",
      phoneNumber: "+97699112233",
      telegramUsername: "@solongo_fx",
      desiredAccountSize: AccountSize.SIZE_10K,
      status: ApplicantStatus.PENDING,
    },
    {
      fullName: "Б. Алдар",
      email: "aldar@example.com",
      phoneNumber: "+97699110011",
      telegramUsername: "@aldartrade",
      desiredAccountSize: AccountSize.SIZE_10K,
      status: ApplicantStatus.ACCEPTED,
    },
    {
      fullName: "М. Намуун",
      email: "namuun@example.com",
      phoneNumber: "+97688001122",
      telegramUsername: "@namuuncharts",
      desiredAccountSize: AccountSize.SIZE_50K,
      status: ApplicantStatus.ACCEPTED,
    },
  ];

  for (const applicantSeed of applicantSeeds) {
    await prisma.applicant.upsert({
      where: { email: applicantSeed.email },
      update: applicantSeed,
      create: applicantSeed,
    });
  }
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
