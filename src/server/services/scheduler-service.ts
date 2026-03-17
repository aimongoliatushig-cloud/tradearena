import { FetchSource, JobStatus, JobType, RoomLifecycleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { dayjs } from "@/lib/dayjs";
import { getDefaultScheduleConfig } from "@/server/services/settings-service";
import { refreshRoomStats, syncRoomLifecycleStatus } from "@/server/services/trader-service";

function toMinuteKey(date: Date) {
  return dayjs(date).utc().second(0).millisecond(0).toDate();
}

function isRoomDue(now: Date, updateTimes: string[], timezone: string) {
  const local = dayjs(now).tz(timezone);
  const current = local.format("HH:mm");
  return updateTimes.includes(current);
}

async function claimRoomRun(roomId: string, minute: Date, reason: string) {
  return db.$transaction(async (tx) => {
    const [lockRow] = await tx.$queryRaw<Array<{ locked: boolean }>>`
      SELECT pg_try_advisory_xact_lock(hashtext(${roomId}), hashtext(${minute.toISOString()})) AS locked
    `;

    if (!lockRow?.locked) {
      return null;
    }

    const count = await tx.jobRunLog.count({
      where: {
        roomId,
        jobType: JobType.SCHEDULED_ROOM_UPDATE,
        scheduledFor: minute,
        status: {
          in: [JobStatus.RUNNING, JobStatus.SUCCESS, JobStatus.PARTIAL],
        },
      },
    });

    if (count > 0) {
      return null;
    }

    return tx.jobRunLog.create({
      data: {
        roomId,
        jobType: JobType.SCHEDULED_ROOM_UPDATE,
        status: JobStatus.RUNNING,
        source: FetchSource.SCHEDULER,
        scheduledFor: minute,
        message: `Scheduler tick (${reason}) эхэллээ.`,
      },
    });
  });
}

export async function runSchedulerTick(reason = "worker") {
  const now = new Date();
  const minuteKey = toMinuteKey(now);
  const lifecycleUpdates = await syncRoomLifecycleStatus();
  const defaults = await getDefaultScheduleConfig();

  const rooms = await db.challengeRoom.findMany({
    where: {
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
    },
    select: {
      id: true,
      updateTimes: true,
      updateTimezone: true,
    },
  });

  const dueRooms: string[] = [];

  for (const room of rooms) {
    const schedule = room.updateTimes.length ? room.updateTimes : defaults.updateTimes;
    const timezone = room.updateTimezone || defaults.timezone;

    if (!isRoomDue(now, schedule, timezone)) {
      continue;
    }

    dueRooms.push(room.id);
  }

  const startedRooms: string[] = [];

  for (const roomId of dueRooms) {
    const log = await claimRoomRun(roomId, minuteKey, reason);

    if (!log) {
      continue;
    }

    startedRooms.push(roomId);

    try {
      const result = await refreshRoomStats(roomId, FetchSource.SCHEDULER);
      await db.jobRunLog.update({
        where: { id: log.id },
        data: {
          status: result.results.some((item) => item.status === "failed") ? JobStatus.PARTIAL : JobStatus.SUCCESS,
          finishedAt: new Date(),
          details: result.results,
          message: `${result.results.length} трейдер шинэчлэгдлээ.`,
        },
      });
    } catch (error) {
      await db.jobRunLog.update({
        where: { id: log.id },
        data: {
          status: JobStatus.FAILED,
          finishedAt: new Date(),
          message: error instanceof Error ? error.message : "Scheduler алдаа",
        },
      });
    }
  }

  if (lifecycleUpdates > 0) {
    await db.jobRunLog.create({
      data: {
        jobType: JobType.ROOM_STATUS_SYNC,
        source: FetchSource.SCHEDULER,
        status: JobStatus.SUCCESS,
        message: `${lifecycleUpdates} өрөөний төлөв автоматаар шинэчлэгдлээ.`,
        finishedAt: new Date(),
      },
    });
  }

  return {
    lifecycleUpdates,
    dueRooms: startedRooms,
    minuteKey,
  };
}
