// All site content lives here. Every user-facing string has an `en` and a `pt` version.
// Neuron `t` = decimal year when that neuron "activates" on the timeline.

window.SITE = {
  person: {
    name: "Matheus Bueno de Oliveira",
    email: "matheusbueno.ai@gmail.com",
    emailAcademic: "matheus.060@edu.pucrs.br",
    linkedin: "https://www.linkedin.com/in/matheusbdeoliveira/",
    github: "https://github.com/MatheusBuenodeOliveira",
  },

  timeline: { start: 2019.0, end: 2026.95 },

  layers: [
    { id: "input",  tag: "x₀", label: { en: "Input", pt: "Entrada" },              sub: { en: "who I am", pt: "quem sou" } },
    { id: "train",  tag: "h₁", label: { en: "Training data", pt: "Dados de treino" }, sub: { en: "education & certificates", pt: "formação & certificados" } },
    { id: "exp",    tag: "h₂", label: { en: "Experience", pt: "Experiência" },        sub: { en: "roles", pt: "cargos" } },
    { id: "feat",   tag: "h₃", label: { en: "Learned features", pt: "Features aprendidas" }, sub: { en: "skills", pt: "habilidades" } },
    { id: "out",    tag: "ŷ",  label: { en: "Output", pt: "Saída" },                  sub: { en: "get in touch", pt: "contato" } },
  ],

  neurons: [
    // ───────────── INPUT ─────────────
    {
      id: "hello", layer: 0, t: 2019.0,
      short: { en: "Hello", pt: "Olá" },
      title: { en: "Hello, I'm Matheus", pt: "Olá, eu sou o Matheus" },
      org: { en: "Senior AI Engineer", pt: "Engenheiro Sênior de IA" },
      body: {
        en: "Senior AI Engineer with production experience in LLM-powered systems, Agentic AI and cloud-native data platforms. I like owning a system end to end: from data ingestion and model orchestration to deployment, reliability and measurable business outcomes.",
        pt: "Engenheiro Sênior de IA com experiência em produção com sistemas baseados em LLMs, IA Agêntica e plataformas de dados cloud-native. Gosto de ser dono de um sistema de ponta a ponta: da ingestão de dados e orquestração de modelos ao deploy, confiabilidade e resultados de negócio mensuráveis.",
      },
      bullets: {
        en: [
          "Currently building AI-driven lead generation on Google Cloud at TELUS Digital",
          "Previously delivered automation and ML at Dell Technologies with multi-million-dollar annual savings",
        ],
        pt: [
          "Hoje construo geração de leads com IA no Google Cloud na TELUS Digital",
          "Antes, entreguei automação e ML na Dell Technologies com economias anuais milionárias",
        ],
      },
    },
    {
      id: "base", layer: 0, t: 2019.0,
      short: { en: "Base", pt: "Base" },
      title: { en: "Rio Grande do Sul, Brazil", pt: "Rio Grande do Sul, Brasil" },
      org: { en: "Location", pt: "Localização" },
      body: {
        en: "Based in the south of Brazil, the region where every step of my career has happened so far: from Charqueadas to Eldorado do Sul and Porto Alegre. Today I work remotely.",
        pt: "Moro no sul do Brasil, a região onde aconteceu cada passo da minha carreira até aqui: de Charqueadas a Eldorado do Sul e Porto Alegre. Hoje trabalho remoto.",
      },
    },
    {
      id: "lang", layer: 0, t: 2019.0,
      short: { en: "Languages", pt: "Idiomas" },
      title: { en: "Languages", pt: "Idiomas" },
      org: { en: "Communication", pt: "Comunicação" },
      body: {
        en: "Portuguese is my native language and I work in English at full professional level.",
        pt: "Português é minha língua nativa e trabalho em inglês em nível profissional pleno.",
      },
      bullets: {
        en: ["Portuguese: native", "English: full professional (Cambridge B2 First)"],
        pt: ["Português: nativo", "Inglês: profissional pleno (Cambridge B2 First)"],
      },
    },

    // ───────────── TRAINING DATA ─────────────
    {
      id: "ifsul", layer: 1, t: 2019.17,
      short: { en: "IFSUL", pt: "IFSUL" },
      title: { en: "Technical Degree in Informatics", pt: "Curso Técnico em Informática" },
      org: { en: "IFSUL · Instituto Federal Sul-rio-grandense", pt: "IFSUL · Instituto Federal Sul-rio-grandense" },
      when: { en: "Mar 2019 – Feb 2023", pt: "mar 2019 – fev 2023" },
      body: {
        en: "Where the first weights were initialized: programming fundamentals, systems, and the habit of building things.",
        pt: "Onde os primeiros pesos foram inicializados: fundamentos de programação, sistemas e o hábito de construir coisas.",
      },
    },
    {
      id: "fce", layer: 1, t: 2022.0,
      short: { en: "Cambridge B2", pt: "Cambridge B2" },
      title: { en: "B2 First Certificate in English", pt: "B2 First Certificate in English" },
      org: { en: "Cambridge University Press & Assessment", pt: "Cambridge University Press & Assessment" },
      when: { en: "Jan 2022", pt: "jan 2022" },
      body: {
        en: "Internationally recognized English certification, level B2.",
        pt: "Certificação internacional de inglês, nível B2.",
      },
    },
    {
      id: "hack", layer: 1, t: 2022.83,
      short: { en: "Hackathon 🥈", pt: "Hackathon 🥈" },
      title: { en: "2nd Place · Charcode Hackathon", pt: "2º lugar · Hackathon Charcode" },
      org: { en: "IFSUL", pt: "IFSUL" },
      when: { en: "Nov 2022", pt: "nov 2022" },
      body: {
        en: "Second place in the Charcode Hackathon, building a working solution under time pressure with a team.",
        pt: "Segundo lugar no Hackathon Charcode, construindo uma solução funcional sob pressão de tempo, em equipe.",
      },
    },
    {
      id: "merit", layer: 1, t: 2023.08,
      short: { en: "Academic Merit", pt: "Mérito Acadêmico" },
      title: { en: "Academic Merit", pt: "Mérito Acadêmico" },
      org: { en: "IFSUL", pt: "IFSUL" },
      when: { en: "Feb 2023", pt: "fev 2023" },
      body: {
        en: "Awarded Academic Merit on completing the technical degree.",
        pt: "Reconhecimento de Mérito Acadêmico na conclusão do curso técnico.",
      },
    },
    {
      id: "pucrs", layer: 1, t: 2023.09,
      short: { en: "PUCRS", pt: "PUCRS" },
      title: { en: "B.Sc. in Software Engineering", pt: "Bacharelado em Engenharia de Software" },
      org: { en: "PUCRS · Pontifícia Universidade Católica do RS", pt: "PUCRS · Pontifícia Universidade Católica do RS" },
      when: { en: "Feb 2023 – Jul 2027 (expected)", pt: "fev 2023 – jul 2027 (previsto)" },
      body: {
        en: "Software Engineering degree, and the bridge to industry: through the PUCRS partnership I was selected for the competitive Dell IT Academy program.",
        pt: "Graduação em Engenharia de Software e a ponte para a indústria: pela parceria com a PUCRS fui selecionado para o concorrido programa Dell IT Academy.",
      },
    },
    {
      id: "ada", layer: 1, t: 2023.83,
      short: { en: "Ada · Data Eng.", pt: "Ada · Eng. Dados" },
      title: { en: "Digital Trail · Data Engineer", pt: "Trilha Digital · Engenharia de Dados" },
      org: { en: "Ada Tech", pt: "Ada Tech" },
      when: { en: "Nov 2023", pt: "nov 2023" },
      body: {
        en: "Data engineering track covering pipelines, data modeling and the tooling behind analytics platforms.",
        pt: "Trilha de engenharia de dados cobrindo pipelines, modelagem de dados e as ferramentas por trás de plataformas analíticas.",
      },
    },
    {
      id: "iit", layer: 1, t: 2025.92,
      short: { en: "AI Engineer Prog.", pt: "AI Engineer Prog." },
      title: { en: "Artificial Intelligence Engineer Program", pt: "Programa Artificial Intelligence Engineer" },
      org: { en: "IIT Roorkee & Simplilearn", pt: "IIT Roorkee & Simplilearn" },
      when: { en: "Dec 2025", pt: "dez 2025" },
      body: {
        en: "Applied AI engineering program covering machine learning, deep learning and generative AI.",
        pt: "Programa de engenharia de IA aplicada cobrindo machine learning, deep learning e IA generativa.",
      },
    },

    // ───────────── EXPERIENCE ─────────────
    {
      id: "city", layer: 2, t: 2022.67,
      short: { en: "IT Intern", pt: "Estagiário de TI" },
      title: { en: "IT Intern", pt: "Estagiário de TI" },
      org: { en: "Charqueadas Municipal City Hall · On-site", pt: "Prefeitura Municipal de Charqueadas · Presencial" },
      when: { en: "Sep 2022 – Jan 2023", pt: "set 2022 – jan 2023" },
      body: {
        en: "First professional role: keeping the public administration's systems and people running.",
        pt: "Primeiro emprego: manter os sistemas e as pessoas da administração pública funcionando.",
      },
      bullets: {
        en: ["Provided end-user IT support and troubleshooting", "Maintained internal systems"],
        pt: ["Suporte de TI e troubleshooting para usuários", "Manutenção de sistemas internos"],
      },
    },
    {
      id: "dellint", layer: 2, t: 2023.33,
      short: { en: "Dell · Intern", pt: "Dell · Estágio" },
      title: { en: "Software Engineering Intern", pt: "Estagiário de Engenharia de Software" },
      org: { en: "Dell Technologies · Dell IT Academy", pt: "Dell Technologies · Dell IT Academy" },
      when: { en: "May 2023 – Aug 2024", pt: "mai 2023 – ago 2024" },
      body: {
        en: "Selected for the Dell IT Academy (PUCRS partnership), a competitive training and placement program.",
        pt: "Selecionado para a Dell IT Academy (parceria com a PUCRS), um programa competitivo de formação e contratação.",
      },
      bullets: {
        en: [
          "Built AI-driven automations improving operational efficiency",
          "Hands-on with Python, AI/ML, ASP.NET Core, Vue.js, SQL/NoSQL, Docker, Kubernetes and Git",
        ],
        pt: [
          "Construí automações com IA que aumentaram a eficiência operacional",
          "Prática com Python, IA/ML, ASP.NET Core, Vue.js, SQL/NoSQL, Docker, Kubernetes e Git",
        ],
      },
      metrics: [{ v: "US$12M", l: { en: "saved per year", pt: "economizados por ano" } }],
      tech: ["Python", "AI/ML", "ASP.NET Core", "Vue.js", "SQL", "NoSQL", "Docker", "Kubernetes", "Git"],
    },
    {
      id: "dell1", layer: 2, t: 2024.58,
      short: { en: "Dell · SWE I", pt: "Dell · SWE I" },
      title: { en: "Software Engineer I", pt: "Engenheiro de Software I" },
      org: { en: "Dell Technologies · On-site, Eldorado do Sul", pt: "Dell Technologies · Presencial, Eldorado do Sul" },
      when: { en: "Aug 2024 – Feb 2026", pt: "ago 2024 – fev 2026" },
      body: {
        en: "AI-driven solutions and automation for two of Dell's largest business groups, with ML pipelines taken all the way to production.",
        pt: "Soluções com IA e automação para dois dos maiores grupos de negócio da Dell, com pipelines de ML levados até produção.",
      },
      bullets: {
        en: [
          "AI-driven solutions for the Infrastructure Solutions Group: US$19.4M/year in cost reduction and 87K workload hours saved per year",
          "Automation systems for the Client Solutions Group: US$12M in yearly savings and 133K fewer work orders",
          "Scalable Python APIs handling 20K+ requests/day, highly available on Docker and Kubernetes",
          "Proposed a fiscal automation initiative projected to cut R$20M in annual expenses",
          "End-to-end ML pipelines with TensorFlow and scikit-learn, from data ingestion to production, with MLOps practices",
        ],
        pt: [
          "Soluções com IA para o Infrastructure Solutions Group: redução de US$19,4M/ano em custos e 87 mil horas de trabalho economizadas por ano",
          "Sistemas de automação para o Client Solutions Group: US$12M de economia anual e 133 mil ordens de serviço a menos",
          "APIs Python escaláveis com mais de 20 mil requisições/dia, em alta disponibilidade com Docker e Kubernetes",
          "Propus uma iniciativa de automação fiscal com projeção de reduzir R$20M em despesas anuais",
          "Pipelines de ML ponta a ponta com TensorFlow e scikit-learn, da ingestão à produção, com práticas de MLOps",
        ],
      },
      metrics: [
        { v: "US$19.4M", l: { en: "saved per year (ISG)", pt: "economizados por ano (ISG)" } },
        { v: "87K", l: { en: "work hours saved / year", pt: "horas de trabalho poupadas / ano" } },
        { v: "US$12M", l: { en: "saved per year (CSG)", pt: "economizados por ano (CSG)" } },
        { v: "133K", l: { en: "fewer work orders", pt: "ordens de serviço a menos" } },
        { v: "20K+", l: { en: "API requests / day", pt: "requisições de API / dia" } },
      ],
      tech: ["Python", "Machine Learning", "TensorFlow", "scikit-learn", "APIs", "Docker", "Kubernetes", "MLOps", "Cloud"],
    },
    {
      id: "dell2", layer: 2, t: 2026.08,
      short: { en: "Dell · SWE II", pt: "Dell · SWE II" },
      title: { en: "Software Engineer II", pt: "Engenheiro de Software II" },
      org: { en: "Dell Technologies · Deploy Modernization & Revenue", pt: "Dell Technologies · Deploy Modernization & Revenue" },
      when: { en: "Feb 2026 – May 2026", pt: "fev 2026 – mai 2026" },
      body: {
        en: "Agentic AI systems and LLM-powered automation, connecting agents to the enterprise through MCP.",
        pt: "Sistemas de IA Agêntica e automação com LLMs, conectando agentes à empresa via MCP.",
      },
      bullets: {
        en: [
          "Built MCP (Model Context Protocol) tools and servers in Python for scalable, no-touch workflows integrating LLM agents with enterprise systems",
          "Integrations with Salesforce APIs, Microsoft Graph and internal platforms to automate business-critical operations",
          "Designed public APIs, handled webhooks and implemented subscription lifecycle logic behind secure gateways",
          "Hardened reliability through defect resolution, edge-case handling, unit tests and CI/CD",
          "Contributed to a strategic initiative expected to automate 30–40% of total project volume",
        ],
        pt: [
          "Construí ferramentas e servidores MCP (Model Context Protocol) em Python para fluxos escaláveis e sem intervenção manual, integrando agentes LLM a sistemas corporativos",
          "Integrações com APIs do Salesforce, Microsoft Graph e plataformas internas para automatizar operações críticas",
          "Projetei APIs públicas, tratei webhooks e implementei a lógica de ciclo de vida de assinaturas atrás de gateways seguros",
          "Aumentei a confiabilidade com correção de defeitos, tratamento de casos de borda, testes unitários e CI/CD",
          "Contribuí para uma iniciativa estratégica com expectativa de automatizar 30–40% do volume total de projetos",
        ],
      },
      metrics: [{ v: "30–40%", l: { en: "of project volume to be automated", pt: "do volume de projetos a automatizar" } }],
      tech: ["Python", "Agentic AI", "LLMs", "MCP", "REST APIs", "Salesforce", "Docker", "Kubernetes", "CI/CD"],
    },
    {
      id: "telus", layer: 2, t: 2026.33,
      short: { en: "TELUS · Sr. AI Eng.", pt: "TELUS · Sr. AI Eng." },
      title: { en: "Senior AI Engineer", pt: "Engenheiro Sênior de IA" },
      org: { en: "TELUS Digital · Remote", pt: "TELUS Digital · Remoto" },
      when: { en: "May 2026 – Present", pt: "mai 2026 – atual" },
      current: true,
      body: {
        en: "LLM-powered systems for a lead generation platform that identifies, enriches and qualifies opportunities for sales teams.",
        pt: "Sistemas com LLMs para uma plataforma de geração de leads que identifica, enriquece e qualifica oportunidades para times de vendas.",
      },
      bullets: {
        en: [
          "Design and deploy LLM-powered systems supporting a revenue initiative projected at US$350K+",
          "Build BigQuery data pipelines that consolidate and enrich lead signals at scale, feeding scoring and LLM enrichment",
          "Own cloud infrastructure as code with Pulumi on GCP for reproducible environments and safer deployments",
          "Containerize and ship Python services with Docker and CI/CD",
          "Prompt engineering, output validation and evaluation routines to keep LLM results accurate and production-safe",
          "Work directly with sales and business stakeholders to turn revenue targets into measurable AI features",
        ],
        pt: [
          "Projeto e coloco em produção sistemas com LLMs que sustentam uma iniciativa de receita projetada em mais de US$350 mil",
          "Construo pipelines no BigQuery que consolidam e enriquecem sinais de leads em escala, alimentando scoring e enriquecimento com LLM",
          "Sou responsável pela infraestrutura como código com Pulumi no GCP, com ambientes reproduzíveis e deploys mais seguros",
          "Containerizo e entrego serviços Python com Docker e CI/CD",
          "Engenharia de prompts, validação de saídas e rotinas de avaliação para manter os resultados dos LLMs precisos e seguros em produção",
          "Trabalho direto com stakeholders de vendas e negócio para transformar metas de receita em features de IA mensuráveis",
        ],
      },
      metrics: [{ v: "US$350K+", l: { en: "revenue initiative", pt: "iniciativa de receita" } }],
      tech: ["Python", "LLMs", "GCP", "BigQuery", "Pulumi", "Docker", "CI/CD", "IaC"],
    },

    // ───────────── LEARNED FEATURES ─────────────
    {
      id: "code", layer: 3, t: 2019.17,
      short: { en: "Programming", pt: "Programação" },
      title: { en: "Programming", pt: "Programação" },
      org: { en: "Languages & frameworks", pt: "Linguagens & frameworks" },
      body: { en: "Python first, with a solid base in Java and C#.", pt: "Python em primeiro lugar, com base sólida em Java e C#." },
      tech: ["Python", "Java", "C#", "ASP.NET Core", "Vue.js"],
    },
    {
      id: "ml", layer: 3, t: 2023.33,
      short: { en: "ML & MLOps", pt: "ML & MLOps" },
      title: { en: "Machine Learning & MLOps", pt: "Machine Learning & MLOps" },
      org: { en: "From notebook to production", pt: "Do notebook à produção" },
      body: {
        en: "End-to-end ML pipelines, from data ingestion to production, with MLOps practices for reliability.",
        pt: "Pipelines de ML ponta a ponta, da ingestão de dados à produção, com práticas de MLOps para confiabilidade.",
      },
      tech: ["Machine Learning", "TensorFlow", "scikit-learn", "MLOps", "Applied AI"],
    },
    {
      id: "cloud", layer: 3, t: 2023.34,
      short: { en: "Cloud & IaC", pt: "Cloud & IaC" },
      title: { en: "Cloud & Infrastructure", pt: "Cloud & Infraestrutura" },
      org: { en: "Ship it, reliably", pt: "Entregar com confiabilidade" },
      body: {
        en: "Reproducible, containerized, observable services, with infrastructure written as code.",
        pt: "Serviços reproduzíveis e containerizados, com a infraestrutura escrita como código.",
      },
      tech: ["Google Cloud (GCP)", "Pulumi (IaC)", "Docker", "Kubernetes", "CI/CD", "Git"],
    },
    {
      id: "data", layer: 3, t: 2023.35,
      short: { en: "Data", pt: "Dados" },
      title: { en: "Data Engineering", pt: "Engenharia de Dados" },
      org: { en: "Signals at scale", pt: "Sinais em escala" },
      body: {
        en: "Pipelines that consolidate and enrich data at scale, plus the APIs that serve it.",
        pt: "Pipelines que consolidam e enriquecem dados em escala, e as APIs que os servem.",
      },
      tech: ["BigQuery", "Data Pipelines", "SQL", "NoSQL", "REST APIs"],
    },
    {
      id: "integ", layer: 3, t: 2026.08,
      short: { en: "Integrations", pt: "Integrações" },
      title: { en: "Enterprise Integrations", pt: "Integrações Corporativas" },
      org: { en: "Wiring AI into real systems", pt: "Conectando IA a sistemas reais" },
      body: {
        en: "Connecting agents and automations to the systems where business actually happens.",
        pt: "Conectando agentes e automações aos sistemas onde o negócio realmente acontece.",
      },
      tech: ["Salesforce", "Microsoft Graph", "MCP", "Webhooks", "Public APIs"],
    },
    {
      id: "agentic", layer: 3, t: 2025.92,
      short: { en: "Agentic AI & LLMs", pt: "IA Agêntica & LLMs" },
      title: { en: "Agentic AI & LLMs", pt: "IA Agêntica & LLMs" },
      org: { en: "Core specialty", pt: "Especialidade principal" },
      body: {
        en: "LLM-powered systems and agents that run in production: prompt engineering, tool use via MCP, output validation and evaluation.",
        pt: "Sistemas e agentes com LLMs rodando em produção: engenharia de prompts, uso de ferramentas via MCP, validação de saídas e avaliação.",
      },
      tech: ["Agentic AI", "LLMs", "Prompt Engineering", "MCP", "Evaluation"],
    },

    // ───────────── OUTPUT ─────────────
    {
      id: "email", layer: 4, t: 2019.0,
      short: { en: "Email", pt: "E-mail" },
      title: { en: "Email", pt: "E-mail" },
      org: { en: "The best way to reach me", pt: "A melhor forma de falar comigo" },
      body: { en: "Let's talk about AI, data or a project you have in mind.", pt: "Vamos conversar sobre IA, dados ou um projeto que você tem em mente." },
      link: { href: "mailto:matheusbueno.ai@gmail.com", label: "matheusbueno.ai@gmail.com" },
    },
    {
      id: "linkedin", layer: 4, t: 2019.0,
      short: { en: "LinkedIn", pt: "LinkedIn" },
      title: { en: "LinkedIn", pt: "LinkedIn" },
      org: { en: "Professional profile", pt: "Perfil profissional" },
      body: { en: "Full history, recommendations and updates.", pt: "Histórico completo, recomendações e novidades." },
      link: { href: "https://www.linkedin.com/in/matheusbdeoliveira/", label: "in/matheusbdeoliveira" },
    },
    {
      id: "github", layer: 4, t: 2019.0,
      short: { en: "GitHub", pt: "GitHub" },
      title: { en: "GitHub", pt: "GitHub" },
      org: { en: "Code", pt: "Código" },
      body: { en: "Code, experiments, and the source of this very site.", pt: "Código, experimentos e o código-fonte deste site." },
      link: { href: "https://github.com/MatheusBuenodeOliveira", label: "MatheusBuenodeOliveira" },
    },
    {
      id: "academic", layer: 4, t: 2019.0,
      short: { en: "Academic", pt: "Acadêmico" },
      title: { en: "Academic email", pt: "E-mail acadêmico" },
      org: { en: "PUCRS", pt: "PUCRS" },
      body: { en: "For university and research contacts.", pt: "Para contatos da universidade e de pesquisa." },
      link: { href: "mailto:matheus.060@edu.pucrs.br", label: "matheus.060@edu.pucrs.br" },
    },
  ],

  // [from, to, weight 0..1] — real relationships, not decoration.
  edges: [
    ["hello", "ifsul", .6], ["hello", "pucrs", .6], ["hello", "ada", .4], ["hello", "iit", .6],
    ["base", "ifsul", .7], ["base", "pucrs", .7], ["base", "hack", .4], ["base", "merit", .4],
    ["lang", "fce", 1],
    ["ifsul", "city", .8], ["ifsul", "dellint", .5], ["hack", "dellint", .5], ["merit", "dellint", .5],
    ["fce", "dellint", .4], ["fce", "telus", .6],
    ["pucrs", "dellint", 1], ["pucrs", "dell1", .6], ["pucrs", "dell2", .5], ["pucrs", "telus", .5],
    ["ada", "dell1", .6], ["ada", "telus", .6],
    ["iit", "dell2", .8], ["iit", "telus", .8],
    ["city", "code", .3],
    ["dellint", "code", .8], ["dellint", "ml", .5], ["dellint", "cloud", .5], ["dellint", "data", .5],
    ["dell1", "ml", 1], ["dell1", "cloud", .8], ["dell1", "code", .8], ["dell1", "data", .6],
    ["dell2", "agentic", 1], ["dell2", "integ", 1], ["dell2", "cloud", .7], ["dell2", "code", .6],
    ["telus", "agentic", 1], ["telus", "data", 1], ["telus", "cloud", 1], ["telus", "code", .7],
    ["code", "github", .9], ["code", "email", .5], ["code", "academic", .4],
    ["ml", "linkedin", .6], ["ml", "email", .6], ["ml", "academic", .5],
    ["cloud", "github", .6], ["cloud", "linkedin", .5],
    ["data", "email", .6], ["data", "linkedin", .5],
    ["integ", "linkedin", .6], ["integ", "email", .6],
    ["agentic", "email", 1], ["agentic", "linkedin", .9], ["agentic", "github", .7],
  ],

  ui: {
    tagline: { en: "Senior AI Engineer · LLMs, Agentic AI & cloud data platforms", pt: "Engenheiro Sênior de IA · LLMs, IA Agêntica & plataformas de dados em nuvem" },
    hint: { en: "Hover a neuron to trace its signal. Click to open it.", pt: "Passe o mouse num neurônio para ver o sinal. Clique para abrir." },
    hintTouch: { en: "Tap a neuron to open it.", pt: "Toque num neurônio para abrir." },
    play: { en: "Run forward pass", pt: "Rodar forward pass" },
    pause: { en: "Pause", pt: "Pausar" },
    epoch: { en: "epoch", pt: "época" },
    done: { en: "Forward pass complete", pt: "Forward pass concluído" },
    doneOut: { en: "ŷ = Senior AI Engineer", pt: "ŷ = Engenheiro Sênior de IA" },
    openNeuron: { en: "Open neuron →", pt: "Abrir neurônio →" },
    now: { en: "now", pt: "agora" },
    modelCard: { en: "Model card", pt: "Model card" },
    readAsText: { en: "Read as text ↓", pt: "Ler em texto ↓" },
    incoming: { en: "Incoming signal", pt: "Sinal de entrada" },
    outgoing: { en: "Outgoing signal", pt: "Sinal de saída" },
    impact: { en: "Impact", pt: "Impacto" },
    stack: { en: "Stack", pt: "Stack" },
    close: { en: "Close", pt: "Fechar" },
    prev: { en: "Previous neuron", pt: "Neurônio anterior" },
    next: { en: "Next neuron", pt: "Próximo neurônio" },
    current: { en: "current", pt: "atual" },
    activation: { en: "activation", pt: "ativação" },
    dormant: { en: "not trained yet at this epoch", pt: "ainda não treinado nesta época" },
    switchLang: { en: "Mudar para português", pt: "Switch to English" },
    timelineLabel: { en: "Timeline: drag to travel through time", pt: "Linha do tempo: arraste para viajar no tempo" },

    // Model card
    mcIntro: {
      en: "The same network, flattened into a readable spec sheet. Every model deserves documentation.",
      pt: "A mesma rede, achatada numa ficha técnica legível. Todo modelo merece documentação.",
    },
    mcType: { en: "Model type", pt: "Tipo de modelo" },
    mcTypeV: { en: "Senior AI Engineer", pt: "Engenheiro Sênior de IA" },
    mcArch: { en: "Architecture", pt: "Arquitetura" },
    mcArchV: { en: "5-layer feed-forward: Input → Training data → Experience → Learned features → Output", pt: "Feed-forward de 5 camadas: Entrada → Dados de treino → Experiência → Features aprendidas → Saída" },
    mcUse: { en: "Intended use", pt: "Uso pretendido" },
    mcUseV: {
      en: "Designing and shipping production LLM systems, agentic workflows, MCP tooling and cloud data platforms, end to end, tied to measurable business outcomes.",
      pt: "Projetar e entregar sistemas de LLM em produção, fluxos agênticos, ferramentas MCP e plataformas de dados em nuvem, de ponta a ponta, ligados a resultados de negócio mensuráveis.",
    },
    mcEval: { en: "Evaluation results", pt: "Resultados de avaliação" },
    mcEvalNote: { en: "Measured in production, not on a benchmark.", pt: "Medidos em produção, não em benchmark." },
    mcHistory: { en: "Training history", pt: "Histórico de treino" },
    mcData: { en: "Training data", pt: "Dados de treino" },
    mcFeatures: { en: "Learned features", pt: "Features aprendidas" },
    mcLimits: { en: "Known limitations", pt: "Limitações conhecidas" },
    mcLimitsV: {
      en: "Still training: B.Sc. in Software Engineering expected July 2027. Fine-tuning continues daily.",
      pt: "Ainda em treinamento: bacharelado em Engenharia de Software previsto para julho de 2027. O fine-tuning continua diariamente.",
    },
    mcInference: { en: "Inference endpoints", pt: "Endpoints de inferência" },
    footer: { en: "Hand-built with vanilla JavaScript and canvas.", pt: "Feito à mão com JavaScript puro e canvas." },
    backToNet: { en: "↑ Back to the network", pt: "↑ Voltar para a rede" },
  },
};
