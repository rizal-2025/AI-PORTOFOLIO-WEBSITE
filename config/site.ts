export type NavigationItem = {
  label: string;
  href: string;
};

type OwnerDetails = {
  name: string | null;
  role: string;
  location: string | null;
  availability: string | null;
  summary: string;
  opportunities: {
    employment: string | null;
    freelance: string | null;
    collaboration: string | null;
  };
};

type ContactDetails = {
  email: string | null;
  linkedin: string | null;
  github: string | null;
};

export const siteConfig = {
  name: "Rizal — AI Engineer",
  shortName: "RIZAL/AI",
  url: "https://example.com",
  description:
    "Portofolio Rizal, AI Engineer yang membangun sistem AI, backend aman, dan produk digital yang berguna.",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Architecture", href: "/architecture" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavigationItem[],
  primaryLink: {
    label: "AURA Demo",
    href: "/demo/aura",
  },
  owner: {
    name: "Rizal",
    role: "AI Engineer",
    location: "Jakarta",
    availability: "24 Hour",
    summary:
      "Membangun AI Agent dan backend systems yang membantu bisnis menangani operasional berulang secara lebih efisien.",
    opportunities: {
      employment: null,
      freelance: null,
      collaboration: null,
    },
  } as OwnerDetails,
  contact: {
    email: "ahmadrizalkurniawan02@gmail.com",
    linkedin: null,
    github: null,
  } as ContactDetails,
  featuredProject: {
    name: "AURA",
    category: "AI Reservation & Customer-Service Agent",
    status: "Development",
    role: "AI Agent & Backend Engineering",
    description:
      "AI Agent berbahasa Indonesia untuk membantu alur reservasi dan layanan pelanggan, dengan jalur handoff yang jelas ke admin.",
    caseStudyHref: "/projects/aura",
    demoHref: "/demo/aura",
    features: [
      "Membuat reservasi",
      "Memperbarui reservasi",
      "Membatalkan reservasi",
      "Mengecek reservasi",
      "Handoff ke admin",
      "Pemahaman bahasa Indonesia",
    ],
    businessValue: [
      "Mengurangi pekerjaan reservasi berulang.",
      "Membantu customer service menangani permintaan umum.",
      "Menyediakan jalur handoff saat agent membutuhkan bantuan manusia.",
    ],
    technologies: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Telegram",
      "Ollama",
      "OpenAI",
      "Indonesian NLU",
    ],
  },
} as const;

export const capabilities = [
  {
    number: "01",
    title: "AI Agent Development",
    description:
      "Merancang agent yang memahami konteks, menjalankan alur kerja, dan tahu kapan harus melibatkan manusia.",
  },
  {
    number: "02",
    title: "Backend API Development",
    description:
      "Membangun API yang terstruktur sebagai fondasi integrasi AI dengan sistem bisnis.",
  },
  {
    number: "03",
    title: "Indonesian NLU",
    description:
      "Mengembangkan pengalaman percakapan yang memahami variasi bahasa Indonesia sehari-hari.",
  },
  {
    number: "04",
    title: "Business Process Automation",
    description:
      "Menerjemahkan proses operasional berulang menjadi alur otomasi yang dapat dipelihara.",
  },
  {
    number: "05",
    title: "LLM Integration",
    description:
      "Menghubungkan model bahasa dengan data, tools, dan guardrail sesuai kebutuhan produk.",
  },
  {
    number: "06",
    title: "Database Integration",
    description:
      "Mendesain aliran data yang konsisten untuk mendukung aplikasi AI end-to-end.",
  },
] as const;

export const projects = [siteConfig.featuredProject] as const;
