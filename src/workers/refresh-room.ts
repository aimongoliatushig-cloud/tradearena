import "dotenv/config";

import { FetchSource } from "@prisma/client";

import { db } from "@/lib/db";
import { closeFtmoBrowser } from "@/server/services/scrape-service";
import { refreshRoomStats } from "@/server/services/trader-service";

async function main() {
  const roomIdentifier = process.argv[2];

  if (!roomIdentifier) {
    throw new Error("Room id эсвэл room title дамжуулаагүй байна.");
  }

  const room = await db.challengeRoom.findFirst({
    where: {
      OR: [{ id: roomIdentifier }, { title: roomIdentifier }],
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!room) {
    throw new Error(`"${roomIdentifier}" өрөө олдсонгүй.`);
  }

  console.log(`[SCRIPT] room refresh start :: ${room.title} (${room.id})`);
  const result = await refreshRoomStats(room.id, FetchSource.MANUAL);
  console.log("[SCRIPT] room refresh result");
  console.log(JSON.stringify(result.results, null, 2));
}

main()
  .then(async () => {
    await closeFtmoBrowser();
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("[SCRIPT] room refresh failed", error);
    await closeFtmoBrowser();
    await db.$disconnect();
    process.exit(1);
  });
