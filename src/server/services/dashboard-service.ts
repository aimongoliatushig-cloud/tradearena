import { ApplicantStatus, JobStatus, PackageEnrollmentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { ROOM_LIFECYCLE_STATUS } from "@/lib/prisma-enums";

function buildAlertScopeKey(log: {
  traderId: string | null;
  roomId: string | null;
  jobType: string;
}) {
  if (log.traderId) {
    return `trader:${log.traderId}`;
  }

  if (log.roomId) {
    return `room:${log.roomId}`;
  }

  return `job:${log.jobType}`;
}

export async function getDashboardSummary() {
  const [rooms, traderCount, applicantGroups, recentLogs, packageCount, courseCount, resourceCount, enrollmentCount, packageRoomCount] = await Promise.all([
    db.challengeRoom.findMany({
      include: {
        traders: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.trader.count(),
    db.applicant.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    db.jobRunLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 100,
      include: { room: true, trader: true },
    }),
    db.packageTier.count(),
    db.course.count(),
    db.resource.count(),
    db.packageEnrollment.count({
      where: {
        status: {
          in: [PackageEnrollmentStatus.PENDING_PAYMENT, PackageEnrollmentStatus.PENDING_CONFIRMATION, PackageEnrollmentStatus.ENROLLED, PackageEnrollmentStatus.AWAITING_DECISION],
        },
      },
    }),
    db.challengeRoom.count({
      where: {
        isPackageRoom: true,
      },
    }),
  ]);

  const applicantCounts = applicantGroups.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.status] = item._count._all;
    return accumulator;
  }, {});

  const latestByScope = new Map<string, (typeof recentLogs)[number]>();
  for (const log of recentLogs) {
    const key = buildAlertScopeKey(log);
    if (!latestByScope.has(key)) {
      latestByScope.set(key, log);
    }
  }

  const alertLogs = Array.from(latestByScope.values())
    .filter((log) => log.status === JobStatus.FAILED || log.status === JobStatus.PARTIAL)
    .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
    .slice(0, 5);

  return {
    rooms,
    roomTotals: {
      running: rooms.filter((room) => room.lifecycleStatus === ROOM_LIFECYCLE_STATUS.ACTIVE).length,
      signupOpen: rooms.filter((room) => room.lifecycleStatus === ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN).length,
      readyToStart: rooms.filter((room) => room.lifecycleStatus === ROOM_LIFECYCLE_STATUS.READY_TO_START).length,
      packageRooms: packageRoomCount,
      traders: traderCount,
      pendingApplicants: applicantCounts[ApplicantStatus.PENDING] ?? 0,
      contactedApplicants: applicantCounts[ApplicantStatus.INVITATION_SENT] ?? 0,
      packages: packageCount,
      courses: courseCount,
      resources: resourceCount,
      enrollments: enrollmentCount,
    },
    alertLogs,
    latestLogs: recentLogs.slice(0, 10),
  };
}

export async function listAdminLogs(limit = 50) {
  return db.jobRunLog.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      room: true,
      trader: true,
    },
  });
}
