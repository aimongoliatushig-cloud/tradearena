import "dotenv/config";

import { closeFtmoBrowser } from "@/server/services/scrape-service";
import { runSchedulerTick } from "@/server/services/scheduler-service";

runSchedulerTick("manual-script")
  .then(async (result) => {
    console.log(result);
    await closeFtmoBrowser();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await closeFtmoBrowser();
    process.exit(1);
  });
