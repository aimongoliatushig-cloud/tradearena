export const ftmoCheckedAt = "2026.03.19";

export const ftmoOfficialCards = [
  {
    title: "FTMO гэж юу вэ?",
    description:
      "FTMO нь туршлагатай трейдерүүдийг илрүүлж, эрсдэлийн менежмент болон гүйцэтгэлийг шалгах зорилготой үнэлгээний системтэй prop firm гэж өөрсдийгөө тайлбарладаг.",
    bullets: [
      "Албан ёсны сайтаар FTMO Challenge: 1-Step болон FTMO Challenge: 2-Step гэсэн хоёр төрлийн evaluation санал болгодог.",
      "Амжилттай давсны дараа FTMO Account авах боломжтой бөгөөд үр дүнд суурилсан reward олгодог.",
      "FTMO-ийн тайлбараар бүх account нь simulated/demo орчин дээр ажилладаг.",
    ],
  },
  {
    title: "FTMO Challenge: 2-Step",
    description: "2-Step хувилбар нь хоёр үе шаттайгаар трейдийн ур чадвар, тогтвортой байдал, эрсдэлийн сахилга бат шалгадаг.",
    bullets: [
      "1-р шат FTMO Challenge: Profit Target 10%, Max Daily Loss 5%, Max Loss 10%, Min Trading Days 4.",
      "2-р шат Verification: Profit Target 5%, Max Daily Loss 5%, Max Loss 10%, Min Trading Days 4.",
      "Profit Target хүрэхэд бүх position хаалттай байх ёстой.",
      "FTMO-ийн албан ёсны тайлбараар Trading Period нь хугацааны дээд хязгааргүй.",
      "Trading day-ийн тооцоо Чех улсын CE(S)T midnight-аар солигдоно.",
    ],
  },
  {
    title: "FTMO Challenge: 1-Step",
    description: "1-Step нь Verification шатгүй, нэг evaluation phase-тэй хувилбар юм.",
    bullets: [
      "Албан ёсны FAQ-аар 1-Step дээр Verification phase байхгүй.",
      "Trading consistency болон risk management нь нэг phase дотроо applicable Trading Objectives-оор шалгагдана.",
      "FTMO-ийн reward мэдээллээр 1-Step-ээр qualify хийсэн трейдер FTMO Account дээрээ 90% reward split-ээс эхэлдэг.",
    ],
  },
  {
    title: "FTMO Account, reward, scaling",
    description: "Evaluation амжилттай дуусвал FTMO Account дээр reward болон scale-up боломж нээгддэг.",
    bullets: [
      "Сонгосон account size нь FTMO Account дээр хадгалагдана. Албан ёсны мэдээллээр нэг account size нь $200,000 хүртэл байдаг.",
      "2-Step-ээр qualify хийсэн тохиолдолд reward split 80%, Scaling Plan-ийн нөхцөл хангагдвал 90% болдог.",
      "1-Step-ээр qualify хийсэн тохиолдолд reward split 90%-аас эхэлдэг.",
      "Нэг трейдер/стратегид ногдох нийт capital allocation нь scaling-ээс өмнө $400,000 хүртэл.",
      "Scaling Plan: дор хаяж 4 сарын цикл, 4 сарын цонхонд 10%-иас дээш net simulated profit, дор хаяж 2 reward, scale хийх үед positive balance шаарддаг.",
      "Scaling Plan-ийн benefit нь 25%-ийн balance өсөлт, 90% reward split, дээд тал нь $2,000,000 scale-up cap.",
    ],
  },
] as const;

export const ftmoSourceLinks = [
  {
    label: "FTMO гэж юу вэ?",
    href: "https://ftmo.com/en/faq/what-is-ftmo/",
  },
  {
    label: "Trading Objectives",
    href: "https://ftmo.com/en/trading-objectives/",
  },
  {
    label: "FTMO үндсэн танилцуулга",
    href: "https://ftmo.com/en/",
  },
  {
    label: "Reward & Scaling Plan",
    href: "https://ftmo.com/en/reward-growth-and-scaling-plan/",
  },
  {
    label: "Reward withdrawal FAQ",
    href: "https://ftmo.com/en/faq/how-do-i-withdraw-my-profits/",
  },
  {
    label: "Account size FAQ",
    href: "https://ftmo.com/en/faq/what-account-size-will-i-work-with/",
  },
  {
    label: "How many accounts can I have?",
    href: "https://ftmo.com/en/faq/how-many-accounts-can-i-have/",
  },
  {
    label: "1-Step дээр Verification байдаг уу?",
    href: "https://ftmo.com/en/faq/does-ftmo-challenge-1-step-include-a-verification-phase/",
  },
] as const;

export const ourChallengeRuleGroups = [
  {
    title: "Үндсэн бүтэц",
    rules: [
      {
        number: "1️⃣",
        title: "Оролцогчийн тоо",
        description: "Нийт 10 хүн оролцоно.",
      },
      {
        number: "2️⃣",
        title: "Ашиглах данс",
        description: "Оролцогч бүр 10K, 25K, 50K, 100K, эсвэл 200K challenge room-оос сонгож, тухайн хэмжээний Demo account ашиглана.",
      },
      {
        number: "3️⃣",
        title: "Нэгдүгээр шатны зорилго",
        description: "14 хоногийн дотор +5% ашиг хийх.",
      },
      {
        number: "4️⃣",
        title: "Хоёрдугаар шатны зорилго",
        description: "Хоёр demo нийлээд нийт +10% ашиг хийх.",
      },
      {
        number: "5️⃣",
        title: "Хугацаа",
        description: "1-р demo: 14 хоног – +5%. 2-р demo: үлдсэн хугацаанд +5%. Нийт challenge хугацаа: 30 хоног.",
      },
    ],
  },
  {
    title: "Fail ба шалгаралт",
    rules: [
      {
        number: "6️⃣",
        title: "Хасагдах нөхцөл",
        description: "Daily Max Loss зөрчих, Total Max Loss зөрчих, Account blow хийх, Challenge-ийн дүрэм зөрчих тохиолдолд оролцогч шууд хасагдана.",
      },
      {
        number: "7️⃣",
        title: "5% хүрээгүй тохиолдол",
        description: "14 хоногийн дотор +5% хүрч чадахгүй бол тухайн оролцогч энэ challenge дээр failed гэж тооцогдоно.",
      },
      {
        number: "8️⃣",
        title: "Эхний шатанд амжилттай хүмүүс",
        description: "14 хоногийн дотор +5% хийсэн оролцогчид дараагийн шатанд орно.",
      },
      {
        number: "9️⃣",
        title: "Хэрэв зөвхөн 1 хүн +5% хийвэл",
        description: "Тэр оролцогч шууд ялагч болно. 2-р demo хийх шаардлагагүй.",
      },
      {
        number: "🔟",
        title: "Хэрэв 2 ба түүнээс олон хүн +5% хийвэл",
        description: "Ялагчийг эрсдэлийн менежментээр тодруулна.",
      },
      {
        number: "1️⃣1️⃣",
        title: "Эрсдэлийн шалгуур",
        description: "Daily Max Loss болон Total Max Loss үзүүлэлтүүдийг харьцуулна.",
      },
      {
        number: "1️⃣2️⃣",
        title: "Ялагчийг тодруулах зарчим",
        description: "Хамгийн бага эрсдэл, өөрөөр хэлбэл хамгийн бага loss ашигласан оролцогч ялагч болно.",
      },
    ],
  },
  {
    title: "Consistency Rule",
    rules: [
      {
        number: "1️⃣3️⃣",
        title: "Consistency Rule",
        description: "Нэг өдөрт хамгийн их тооцогдох ашиг = 2.5%.",
      },
      {
        number: "1️⃣4️⃣",
        title: "Хамгийн бага 2 өөр өдөр ашиг хийх шаардлага",
        description: "+5% зорилгод хүрэхийн тулд оролцогч дор хаяж 2 өөр өдөр ашиг хийх ёстой.",
      },
      {
        number: "1️⃣5️⃣",
        title: "Жишээ тайлбар",
        description: "Хэрэв нэг өдөр +4% ашиг хийвэл challenge тооцоонд зөвхөн +2.5% гэж тооцно. Үлдсэн ашгийг өөр өдөр хийх шаардлагатай.",
      },
      {
        number: "1️⃣6️⃣",
        title: "Consistency rule-ийн зорилго",
        description: "Азанд найдсан нэг удаагийн trade-ийг хязгаарлаж, тогтвортой трейдинг чадварыг шалгана.",
      },
      {
        number: "1️⃣7️⃣",
        title: "Хэрэв хэн ч +5% хийж чадаагүй бол",
        description: "10 оролцогчоос хэн ч 14 хоногийн дотор +5% хийж чадахгүй бол challenge-ийг дахин нэг удаа үнэгүй эхлүүлнэ.",
      },
    ],
  },
  {
    title: "Шагнал, гэрээ, funded үе шат",
    rules: [
      {
        number: "1️⃣8️⃣",
        title: "Шагнал",
        description: "Ялагчид Funded Challenge account олгоно.",
      },
      {
        number: "1️⃣9️⃣",
        title: "Гэрээ байгуулах шаардлага",
        description: "Ялагч шагналаа авахын тулд албан ёсны гэрээ байгуулна.",
      },
      {
        number: "2️⃣0️⃣",
        title: "Гэрээ хийхэд шаардлагатай мэдээлэл",
        description: "Ажлын хаяг, гэрийн хаяг, регистрийн дугаар шаардлагатай.",
      },
      {
        number: "2️⃣1️⃣",
        title: "Challenge илгээх",
        description: "Гэрээ баталгаажсаны дараа Funded Challenge account нь ялагчийн email хаяг руу илгээгдэнэ.",
      },
      {
        number: "2️⃣2️⃣",
        title: "Funded account ба шагналын нөхцөл",
        description:
          "Хэрэв ялагч funded account дээр challenge-ийг амжилттай давж, анхны withdrawal хийвэл эхний төлсөн $640 challenge fee буцаан олгогдоно. Энэ мөнгийг бусад багийн гишүүдэд хуваан шилжүүлнэ.",
      },
      {
        number: "2️⃣3️⃣",
        title: "Бодит дансны эрсдэлийн дүрэм",
        description: "Funded account авсны дараа эрсдэлийг $100,000 биш бодит $10,000 account дээр суурилж тооцно.",
      },
      {
        number: "2️⃣4️⃣",
        title: "Daily loss limit (бодит данс)",
        description: "Анхны withdrawal хүртэл өдрийн алдагдал $250-аас хэтрэхгүй байх ёстой.",
      },
      {
        number: "2️⃣5️⃣",
        title: "Paid challenge-ийн эрсдэлийн нөхцөл",
        description: "Хэрэв эхний demo challenge-ийн ялагч paid challenge дээр fail хийвэл тэр хүн ямар нэгэн мөнгө буцаан төлөх үүрэг хүлээхгүй.",
      },
    ],
  },
  {
    title: "Тайлагнал ба ил тод байдал",
    rules: [
      {
        number: "2️⃣6️⃣",
        title: "Долоо хоногийн тайлагнал",
        description: "Challenge phase болон Real account phase-ийн хугацаанд оролцогч долоо хоног бүр trading progress-оо хуваалцаж, risk management болон trading дүрмээ баримталж байгаагаа нотолно.",
      },
      {
        number: "2️⃣7️⃣",
        title: "Ил тод байдлын зорилго",
        description: "Энэ тайлагналын зорилго нь risk management баримталж байгаа эсэхийг харуулах, бусад гишүүдэд суралцах боломж бий болгох, challenge-ийг ил тод шударга байлгах юм.",
      },
    ],
  },
] as const;
