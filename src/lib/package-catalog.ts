import type { AccountSize, CourseAccessLevel, ResourceType } from "@prisma/client";

import { ACCOUNT_SIZE, COURSE_ACCESS_LEVEL, RESOURCE_TYPE } from "@/lib/prisma-enums";

export type PackageCatalogItem = {
  accountSize: AccountSize;
  coachingHours: number;
  courseAccessLevel: CourseAccessLevel;
  featuresMn: string[];
  includesCoaching: boolean;
  includesIndicators: boolean;
  nameMn: string;
  priceUsd: number;
  prioritySupport: boolean;
  slug: string;
  strategyCount: number;
};

export const PACKAGE_CATALOG: PackageCatalogItem[] = [
  {
    slug: "10k-bagts",
    nameMn: "10K Багц",
    accountSize: ACCOUNT_SIZE.SIZE_10K,
    priceUsd: 15,
    strategyCount: 1,
    includesCoaching: false,
    coachingHours: 0,
    includesIndicators: false,
    courseAccessLevel: COURSE_ACCESS_LEVEL.BASIC,
    prioritySupport: false,
    featuresMn: ["1 стратеги", "Суурь FTMO сургалт", "Lot calculator индикатор"],
  },
  {
    slug: "25k-bagts",
    nameMn: "25K Багц",
    accountSize: ACCOUNT_SIZE.SIZE_25K,
    priceUsd: 35,
    strategyCount: 2,
    includesCoaching: false,
    coachingHours: 0,
    includesIndicators: false,
    courseAccessLevel: COURSE_ACCESS_LEVEL.TRADING_PLAN,
    prioritySupport: false,
    featuresMn: ["2 стратеги", "Trading plan basics", "Lot calculator индикатор"],
  },
  {
    slug: "50k-bagts",
    nameMn: "50K Багц",
    accountSize: ACCOUNT_SIZE.SIZE_50K,
    priceUsd: 50,
    strategyCount: 3,
    includesCoaching: false,
    coachingHours: 0,
    includesIndicators: true,
    courseAccessLevel: COURSE_ACCESS_LEVEL.INTERMEDIATE,
    prioritySupport: false,
    featuresMn: ["3 стратеги", "Дунд шатны сургалт", "Индикаторын эрх"],
  },
  {
    slug: "100k-bagts",
    nameMn: "100K Багц",
    accountSize: ACCOUNT_SIZE.SIZE_100K,
    priceUsd: 80,
    strategyCount: 5,
    includesCoaching: true,
    coachingHours: 1,
    includesIndicators: true,
    courseAccessLevel: COURSE_ACCESS_LEVEL.ADVANCED,
    prioritySupport: false,
    featuresMn: ["5 стратеги", "Ахисан шатны сургалт", "Индикаторын эрх", "1 цагийн 1:1 коучинг"],
  },
  {
    slug: "200k-bagts",
    nameMn: "200K Багц",
    accountSize: ACCOUNT_SIZE.SIZE_200K,
    priceUsd: 160,
    strategyCount: 10,
    includesCoaching: true,
    coachingHours: 2,
    includesIndicators: true,
    courseAccessLevel: COURSE_ACCESS_LEVEL.FULL_ADVANCED,
    prioritySupport: true,
    featuresMn: ["10 стратеги", "Бүрэн ахисан шатны сургалт", "Индикаторын эрх", "2 цагийн 1:1 коучинг", "Priority support"],
  },
];

export const DEFAULT_COURSE_SEEDS = [
  {
    slug: "ftmo-suur-oylgolt",
    titleMn: "FTMO суурь ойлголт",
    descriptionMn: "Challenge эхлэхийн өмнөх үндсэн ойлголт, дүрэм, сахилга.",
    videoUrl: "https://player.vimeo.com/video/101010101",
    textContent: "FTMO challenge эхлэхээс өмнө эрсдэл, дүрэм, сэтгэлзүйн сууриа бэлдэнэ.",
    pdfUrls: ["https://example.com/docs/ftmo-basic.pdf"],
    sortOrder: 1,
    packageSlugs: ["10k-bagts", "25k-bagts", "50k-bagts", "100k-bagts", "200k-bagts"],
  },
  {
    slug: "trading-plan-basics",
    titleMn: "Trading plan basics",
    descriptionMn: "Төлөвлөгөө, чеклист, trade before/after review загвар.",
    videoUrl: "https://player.vimeo.com/video/202020202",
    textContent: "Өдөр тутмын төлөвлөгөө, entry checklist, review системийг байгуулна.",
    pdfUrls: ["https://example.com/docs/trading-plan-basics.pdf"],
    sortOrder: 2,
    packageSlugs: ["25k-bagts", "50k-bagts", "100k-bagts", "200k-bagts"],
  },
  {
    slug: "intermediate-execution",
    titleMn: "Дунд шатны гүйцэтгэл",
    descriptionMn: "Execution quality, risk stacking, session planning.",
    videoUrl: "https://player.vimeo.com/video/303030303",
    textContent: "Дунд шатанд гүйцэтгэлийн чанар, эрсдэлийн давхар хяналтыг системчилнэ.",
    pdfUrls: ["https://example.com/docs/intermediate-execution.pdf"],
    sortOrder: 3,
    packageSlugs: ["50k-bagts", "100k-bagts", "200k-bagts"],
  },
  {
    slug: "advanced-structure",
    titleMn: "Ахисан шатны бүтэц",
    descriptionMn: "Multi-scenario planning, higher timeframe alignment, journal review.",
    videoUrl: "https://player.vimeo.com/video/404040404",
    textContent: "Ахисан шатны trader workflow, structure reading, journal review framework.",
    pdfUrls: ["https://example.com/docs/advanced-structure.pdf"],
    sortOrder: 4,
    packageSlugs: ["100k-bagts", "200k-bagts"],
  },
  {
    slug: "full-advanced-playbook",
    titleMn: "Бүрэн ахисан шатны playbook",
    descriptionMn: "Scaling, review loops, capital preservation and advanced routines.",
    videoUrl: "https://player.vimeo.com/video/505050505",
    textContent: "Өндөр шатны execution system болон long-term scaling framework.",
    pdfUrls: ["https://example.com/docs/full-advanced-playbook.pdf"],
    sortOrder: 5,
    packageSlugs: ["200k-bagts"],
  },
] as const;

export const DEFAULT_RESOURCE_SEEDS: Array<{
  descriptionMn: string;
  linkUrl: string;
  packageSlugs: string[];
  sortOrder: number;
  titleMn: string;
  type: ResourceType;
}> = [
  {
    titleMn: "Lot calculator",
    descriptionMn: "Эрсдэлийн хэмжээ болон lot size хурдан тооцох хэрэгсэл.",
    type: RESOURCE_TYPE.TOOL,
    linkUrl: "https://example.com/tools/lot-calculator",
    sortOrder: 1,
    packageSlugs: ["10k-bagts", "25k-bagts", "50k-bagts", "100k-bagts", "200k-bagts"],
  },
  {
    titleMn: "Strategy pack 1",
    descriptionMn: "Market structure + confirmation strategy guide.",
    type: RESOURCE_TYPE.STRATEGY,
    linkUrl: "https://example.com/resources/strategy-pack-1",
    sortOrder: 2,
    packageSlugs: ["10k-bagts", "25k-bagts", "50k-bagts", "100k-bagts", "200k-bagts"],
  },
  {
    titleMn: "Indicator access",
    descriptionMn: "TradingView invite-only indicator access.",
    type: RESOURCE_TYPE.INDICATOR,
    linkUrl: "https://example.com/resources/invite-only-indicator",
    sortOrder: 3,
    packageSlugs: ["50k-bagts", "100k-bagts", "200k-bagts"],
  },
];
