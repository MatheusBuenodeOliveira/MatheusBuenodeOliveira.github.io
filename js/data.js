// All site content lives here. Every user-facing string has an `en` and a `pt` version.
//
// Structure:
//   hello   → the entry neuron. It fires into the first neuron of each track.
//   tracks  → three themed paths (career, education, skills), each an ordered list of neuron ids.
//   contact → where every track ends; from there you can open the full network.
//   links   → cross-track synapses: real relationships between neurons, with a short reason.

window.SITE = {
  tracks: [
    { id: "career", label: { en: "Career", pt: "Carreira" }, color: "#4da3ff",
      blurb: { en: "5 roles, from City Hall to TELUS", pt: "5 cargos, da Prefeitura à TELUS" },
      order: ["city", "dellint", "dell1", "dell2", "telus"] },
    { id: "edu", label: { en: "Education", pt: "Formação" }, color: "#8b9bff",
      blurb: { en: "Degrees, certificates and awards", pt: "Cursos, certificados e prêmios" },
      order: ["ifsul", "fce", "awards", "pucrs", "ada", "iit"] },
    { id: "skills", label: { en: "Skills", pt: "Habilidades" }, color: "#3fd3f2",
      blurb: { en: "What the training produced", pt: "O que o treino produziu" },
      order: ["code", "ml", "data", "cloud", "integ", "agentic"] },
  ],

  coreColor: "#cfe2ff",

  // [a, b, weight 0..1, reason] — shown on both neurons as a synapse to the other one
  links: [
    ["ifsul", "city", 0.8, { en: "Technical degree → first IT job", pt: "Curso técnico → 1º emprego em TI" }],
    ["ifsul", "code", 0.9, { en: "Where I learned to code", pt: "Onde aprendi a programar" }],
    ["pucrs", "dellint", 1, { en: "Selected for Dell IT Academy", pt: "Selecionado para a Dell IT Academy" }],
    ["awards", "dellint", 0.5, { en: "Hackathon mindset, shipped at Dell", pt: "Espírito de hackathon, levado à Dell" }],
    ["dellint", "code", 0.8, { en: "Python, .NET and Vue.js in practice", pt: "Python, .NET e Vue.js na prática" }],
    ["dell1", "ml", 1, { en: "ML pipelines taken to production", pt: "Pipelines de ML levados à produção" }],
    ["dell1", "cloud", 0.8, { en: "Docker and Kubernetes at scale", pt: "Docker e Kubernetes em escala" }],
    ["ada", "data", 0.9, { en: "Data engineering track", pt: "Trilha de engenharia de dados" }],
    ["dell2", "agentic", 1, { en: "Agents and MCP servers", pt: "Agentes e servidores MCP" }],
    ["dell2", "integ", 1, { en: "Salesforce and Microsoft Graph", pt: "Salesforce e Microsoft Graph" }],
    ["iit", "agentic", 0.8, { en: "Formal AI engineering training", pt: "Formação em engenharia de IA" }],
    ["telus", "agentic", 1, { en: "LLM systems in production", pt: "Sistemas de LLM em produção" }],
    ["telus", "data", 1, { en: "BigQuery lead pipelines", pt: "Pipelines de leads no BigQuery" }],
    ["telus", "cloud", 0.9, { en: "Pulumi IaC on GCP", pt: "IaC com Pulumi no GCP" }],
    ["fce", "telus", 0.6, { en: "Working remotely in English", pt: "Trabalho remoto em inglês" }],
  ],

  neurons: {
    hello: {
      photo: { src: "assets/photos/portrait.jpg", kind: "avatar", alt: { en: "Portrait of Matheus", pt: "Retrato do Matheus" } },
      short: { en: "Hello", pt: "Olá" },
      kicker: { en: "Input neuron", pt: "Neurônio de entrada" },
      title: { en: "Hi, I'm Matheus", pt: "Oi, eu sou o Matheus" },
      org: { en: "Senior AI Engineer · Rio Grande do Sul, Brazil", pt: "Engenheiro Sênior de IA · Rio Grande do Sul, Brasil" },
      body: {
        en: "I build LLM-powered systems, agentic workflows and cloud data platforms, and I like owning them end to end: from data ingestion and model orchestration to deployment and measurable business results.",
        pt: "Construo sistemas com LLMs, fluxos agênticos e plataformas de dados em nuvem, e gosto de ser dono deles de ponta a ponta: da ingestão de dados e orquestração de modelos ao deploy e a resultados de negócio mensuráveis.",
      },
      facts: [
        { k: { en: "Now", pt: "Hoje" }, v: { en: "TELUS Digital", pt: "TELUS Digital" } },
        { k: { en: "Before", pt: "Antes" }, v: { en: "Dell Technologies", pt: "Dell Technologies" } },
        { k: { en: "Speaks", pt: "Idiomas" }, v: { en: "Portuguese · English", pt: "Português · Inglês" } },
      ],
      hint: { en: "This is a neural network of my career. Pick a path to follow its signal.", pt: "Esta é uma rede neural da minha carreira. Escolha um caminho para seguir o sinal." },
    },

    // ───────────── CAREER ─────────────
    city: {
      short: { en: "City Hall", pt: "Prefeitura" },
      title: { en: "IT Intern", pt: "Estagiário de TI" },
      org: { en: "Charqueadas Municipal City Hall", pt: "Prefeitura Municipal de Charqueadas" },
      when: { en: "Sep 2022 – Jan 2023", pt: "set 2022 – jan 2023" },
      body: {
        en: "My first job: keeping the systems and the people of a public administration running.",
        pt: "Meu primeiro emprego: manter funcionando os sistemas e as pessoas de uma administração pública.",
      },
      bullets: {
        en: ["End-user IT support and troubleshooting", "Maintenance of internal systems"],
        pt: ["Suporte de TI e troubleshooting para usuários", "Manutenção de sistemas internos"],
      },
    },
    dellint: {
      photo: { src: "assets/photos/dell.jpg", kind: "wide", alt: { en: "Dell Technologies mug and Matheus's employee badge on a desk", pt: "Caneca da Dell Technologies e o crachá do Matheus numa mesa" } },
      short: { en: "Dell · Intern", pt: "Dell · Estágio" },
      title: { en: "Software Engineering Intern", pt: "Estagiário de Engenharia de Software" },
      org: { en: "Dell Technologies · Dell IT Academy", pt: "Dell Technologies · Dell IT Academy" },
      when: { en: "May 2023 – Aug 2024", pt: "mai 2023 – ago 2024" },
      body: {
        en: "Selected for the Dell IT Academy, a competitive training and placement program run with PUCRS.",
        pt: "Selecionado para a Dell IT Academy, um programa concorrido de formação e contratação em parceria com a PUCRS.",
      },
      bullets: {
        en: ["Built AI-driven automations that improved operational efficiency", "Hands-on with Python, AI/ML, ASP.NET Core, Vue.js, SQL/NoSQL, Docker and Kubernetes"],
        pt: ["Construí automações com IA que aumentaram a eficiência operacional", "Prática com Python, IA/ML, ASP.NET Core, Vue.js, SQL/NoSQL, Docker e Kubernetes"],
      },
      metrics: [{ v: "US$12M", l: { en: "saved per year", pt: "economia por ano" } }],
    },
    dell1: {
      short: { en: "Dell · SWE I", pt: "Dell · SWE I" },
      title: { en: "Software Engineer I", pt: "Engenheiro de Software I" },
      org: { en: "Dell Technologies · Eldorado do Sul", pt: "Dell Technologies · Eldorado do Sul" },
      when: { en: "Aug 2024 – Feb 2026", pt: "ago 2024 – fev 2026" },
      body: {
        en: "AI solutions and automation for two of Dell's largest business groups, with ML pipelines taken all the way to production.",
        pt: "Soluções de IA e automação para dois dos maiores grupos de negócio da Dell, com pipelines de ML levados até a produção.",
      },
      bullets: {
        en: [
          "Infrastructure Solutions Group: US$19.4M/year in cost reduction and 87K work hours saved per year",
          "Client Solutions Group: US$12M/year in savings and 133K fewer work orders",
          "Python APIs handling 20K+ requests/day on Docker and Kubernetes",
          "Proposed a fiscal automation projected to cut R$20M in annual expenses",
        ],
        pt: [
          "Infrastructure Solutions Group: redução de US$19,4M/ano em custos e 87 mil horas de trabalho poupadas por ano",
          "Client Solutions Group: US$12M/ano de economia e 133 mil ordens de serviço a menos",
          "APIs Python com mais de 20 mil requisições/dia em Docker e Kubernetes",
          "Propus uma automação fiscal com projeção de cortar R$20M em despesas anuais",
        ],
      },
      metrics: [
        { v: "US$19.4M", l: { en: "saved / year", pt: "economia / ano" } },
        { v: "87K", l: { en: "hours saved / year", pt: "horas poupadas / ano" } },
        { v: "20K+", l: { en: "requests / day", pt: "requisições / dia" } },
      ],
    },
    dell2: {
      short: { en: "Dell · SWE II", pt: "Dell · SWE II" },
      title: { en: "Software Engineer II", pt: "Engenheiro de Software II" },
      org: { en: "Dell Technologies · Deploy Modernization & Revenue", pt: "Dell Technologies · Deploy Modernization & Revenue" },
      when: { en: "Feb 2026 – May 2026", pt: "fev 2026 – mai 2026" },
      body: {
        en: "Agentic AI systems and LLM automation, connecting agents to enterprise systems through MCP.",
        pt: "Sistemas de IA Agêntica e automação com LLMs, conectando agentes a sistemas corporativos via MCP.",
      },
      bullets: {
        en: [
          "Built MCP tools and servers in Python for no-touch workflows",
          "Integrated Salesforce APIs, Microsoft Graph and internal platforms",
          "Public APIs, webhooks and subscription lifecycle behind secure gateways",
        ],
        pt: [
          "Construí ferramentas e servidores MCP em Python para fluxos sem intervenção manual",
          "Integrei APIs do Salesforce, Microsoft Graph e plataformas internas",
          "APIs públicas, webhooks e ciclo de vida de assinaturas atrás de gateways seguros",
        ],
      },
      metrics: [{ v: "30–40%", l: { en: "of project volume to automate", pt: "do volume de projetos a automatizar" } }],
    },
    telus: {
      short: { en: "TELUS", pt: "TELUS" },
      current: true,
      title: { en: "Senior AI Engineer", pt: "Engenheiro Sênior de IA" },
      org: { en: "TELUS Digital · Remote", pt: "TELUS Digital · Remoto" },
      when: { en: "May 2026 – now", pt: "mai 2026 – hoje" },
      body: {
        en: "LLM systems for a lead generation platform that finds, enriches and qualifies opportunities for sales teams.",
        pt: "Sistemas com LLMs para uma plataforma de geração de leads que encontra, enriquece e qualifica oportunidades para times de vendas.",
      },
      bullets: {
        en: [
          "BigQuery pipelines that consolidate and enrich lead signals at scale",
          "Infrastructure as code with Pulumi on GCP; Docker and CI/CD",
          "Prompt engineering, output validation and evaluation for production-safe LLMs",
          "Working with sales stakeholders to turn revenue targets into AI features",
        ],
        pt: [
          "Pipelines no BigQuery que consolidam e enriquecem sinais de leads em escala",
          "Infraestrutura como código com Pulumi no GCP; Docker e CI/CD",
          "Engenharia de prompts, validação de saídas e avaliação para LLMs seguros em produção",
          "Trabalho com vendas para transformar metas de receita em features de IA",
        ],
      },
      metrics: [{ v: "US$350K+", l: { en: "revenue initiative", pt: "iniciativa de receita" } }],
    },

    // ───────────── EDUCATION ─────────────
    ifsul: {
      short: { en: "IFSUL", pt: "IFSUL" },
      title: { en: "Technical Degree in Informatics", pt: "Técnico em Informática" },
      org: { en: "IFSUL · Instituto Federal Sul-rio-grandense", pt: "IFSUL · Instituto Federal Sul-rio-grandense" },
      when: { en: "Mar 2019 – Feb 2023", pt: "mar 2019 – fev 2023" },
      body: {
        en: "Where the first weights were initialized: programming fundamentals, systems and the habit of building things.",
        pt: "Onde os primeiros pesos foram inicializados: fundamentos de programação, sistemas e o hábito de construir coisas.",
      },
    },
    fce: {
      short: { en: "Cambridge B2", pt: "Cambridge B2" },
      title: { en: "B2 First Certificate in English", pt: "B2 First Certificate in English" },
      org: { en: "Cambridge University Press & Assessment", pt: "Cambridge University Press & Assessment" },
      when: { en: "Jan 2022", pt: "jan 2022" },
      body: {
        en: "International English certification. Today I work in English at full professional level.",
        pt: "Certificação internacional de inglês. Hoje trabalho em inglês em nível profissional pleno.",
      },
    },
    awards: {
      photo: { src: "assets/photos/speech.jpg", kind: "avatar", alt: { en: "Matheus giving a speech at a microphone", pt: "Matheus discursando ao microfone" } },
      short: { en: "Awards", pt: "Prêmios" },
      title: { en: "Hackathon & Academic Merit", pt: "Hackathon & Mérito Acadêmico" },
      org: { en: "IFSUL", pt: "IFSUL" },
      when: { en: "Nov 2022 · Feb 2023", pt: "nov 2022 · fev 2023" },
      bullets: {
        en: ["2nd place, Charcode Hackathon (Nov 2022)", "Academic Merit on finishing the technical degree (Feb 2023)"],
        pt: ["2º lugar no Hackathon Charcode (nov 2022)", "Mérito Acadêmico ao concluir o curso técnico (fev 2023)"],
      },
    },
    pucrs: {
      short: { en: "PUCRS", pt: "PUCRS" },
      title: { en: "B.Sc. in Software Engineering", pt: "Bacharelado em Engenharia de Software" },
      org: { en: "PUCRS · Pontifícia Universidade Católica do RS", pt: "PUCRS · Pontifícia Universidade Católica do RS" },
      when: { en: "Feb 2023 – Jul 2027 (expected)", pt: "fev 2023 – jul 2027 (previsto)" },
      body: {
        en: "Still training. The degree was also my bridge to industry, through the Dell IT Academy partnership.",
        pt: "Ainda em treinamento. A graduação também foi minha ponte para a indústria, pela parceria com a Dell IT Academy.",
      },
    },
    ada: {
      short: { en: "Ada Tech", pt: "Ada Tech" },
      title: { en: "Digital Trail · Data Engineer", pt: "Trilha Digital · Engenharia de Dados" },
      org: { en: "Ada Tech", pt: "Ada Tech" },
      when: { en: "Nov 2023", pt: "nov 2023" },
      body: {
        en: "A data engineering track: the foundation for the pipelines I build today.",
        pt: "Uma trilha de engenharia de dados: a base dos pipelines que construo hoje.",
      },
    },
    iit: {
      short: { en: "IIT Roorkee", pt: "IIT Roorkee" },
      title: { en: "Artificial Intelligence Engineer Program", pt: "Programa Artificial Intelligence Engineer" },
      org: { en: "IIT Roorkee & Simplilearn", pt: "IIT Roorkee & Simplilearn" },
      when: { en: "Dec 2025", pt: "dez 2025" },
      body: {
        en: "Applied AI engineering program, completed while building AI systems at Dell.",
        pt: "Programa de engenharia de IA aplicada, concluído enquanto eu construía sistemas de IA na Dell.",
      },
    },

    // ───────────── SKILLS ─────────────
    code: {
      short: { en: "Programming", pt: "Programação" },
      title: { en: "Programming", pt: "Programação" },
      body: { en: "Python first, with a solid base in Java and C#.", pt: "Python em primeiro lugar, com base sólida em Java e C#." },
      tech: ["Python", "Java", "C#", "ASP.NET Core", "Vue.js", "Git"],
    },
    ml: {
      short: { en: "ML & MLOps", pt: "ML & MLOps" },
      title: { en: "Machine Learning & MLOps", pt: "Machine Learning & MLOps" },
      body: {
        en: "End-to-end ML pipelines, from data ingestion to production, with MLOps practices for reliability.",
        pt: "Pipelines de ML de ponta a ponta, da ingestão à produção, com práticas de MLOps para confiabilidade.",
      },
      tech: ["TensorFlow", "scikit-learn", "MLOps", "Applied AI"],
    },
    data: {
      short: { en: "Data", pt: "Dados" },
      title: { en: "Data Engineering", pt: "Engenharia de Dados" },
      body: {
        en: "Pipelines that consolidate and enrich data at scale, and the APIs that serve it.",
        pt: "Pipelines que consolidam e enriquecem dados em escala, e as APIs que os servem.",
      },
      tech: ["BigQuery", "Data pipelines", "SQL", "NoSQL", "REST APIs"],
    },
    cloud: {
      short: { en: "Cloud & IaC", pt: "Cloud & IaC" },
      title: { en: "Cloud & Infrastructure", pt: "Cloud & Infraestrutura" },
      body: {
        en: "Reproducible, containerized services with the infrastructure written as code.",
        pt: "Serviços reproduzíveis e containerizados, com a infraestrutura escrita como código.",
      },
      tech: ["Google Cloud", "Pulumi", "Docker", "Kubernetes", "CI/CD"],
    },
    integ: {
      short: { en: "Integrations", pt: "Integrações" },
      title: { en: "Enterprise Integrations", pt: "Integrações Corporativas" },
      body: {
        en: "Wiring agents and automations into the systems where the business actually happens.",
        pt: "Conectando agentes e automações aos sistemas onde o negócio realmente acontece.",
      },
      tech: ["Salesforce", "Microsoft Graph", "MCP", "Webhooks", "Public APIs"],
    },
    agentic: {
      short: { en: "Agentic AI", pt: "IA Agêntica" },
      title: { en: "Agentic AI & LLMs", pt: "IA Agêntica & LLMs" },
      body: {
        en: "My core specialty: LLM systems and agents that run in production, with tool use via MCP, output validation and evaluation.",
        pt: "Minha especialidade: sistemas de LLM e agentes rodando em produção, com uso de ferramentas via MCP, validação de saídas e avaliação.",
      },
      tech: ["Agentic AI", "LLMs", "Prompt engineering", "MCP", "Evaluation"],
    },

    contact: {
      short: { en: "Contact", pt: "Contato" },
      kicker: { en: "Output neuron", pt: "Neurônio de saída" },
      title: { en: "Let's talk", pt: "Vamos conversar" },
      body: {
        en: "Every path ends here. If something in this network caught your attention, send a signal back.",
        pt: "Todos os caminhos terminam aqui. Se algo nesta rede chamou sua atenção, mande um sinal de volta.",
      },
      links: [
        { href: "mailto:matheusbueno.ai@gmail.com", label: "matheusbueno.ai@gmail.com", kind: "Email" },
        { href: "https://www.linkedin.com/in/matheusbdeoliveira/", label: "in/matheusbdeoliveira", kind: "LinkedIn" },
        { href: "https://github.com/MatheusBuenodeOliveira", label: "MatheusBuenodeOliveira", kind: "GitHub" },
        { href: "mailto:matheus.060@edu.pucrs.br", label: "matheus.060@edu.pucrs.br", kind: { en: "Academic", pt: "Acadêmico" } },
      ],
    },
  },

  ui: {
    role: { en: "Senior AI Engineer", pt: "Engenheiro Sênior de IA" },
    network: { en: "Full network", pt: "Rede completa" },
    networkHint: { en: "Click any neuron to fly to it", pt: "Clique em qualquer neurônio para ir até ele" },
    back: { en: "Back", pt: "Voltar" },
    next: { en: "Next", pt: "Próximo" },
    start: { en: "Start", pt: "Começar" },
    contactNext: { en: "End of path", pt: "Fim do caminho" },
    openNetwork: { en: "See the full network", pt: "Ver a rede completa" },
    openNetworkWhy: { en: "Every neuron at once", pt: "Todos os neurônios de uma vez" },
    returnTo: { en: "Return to", pt: "Voltar para" },
    visited: { en: "visited", pt: "visitados" },
    keys: { en: "← → move · N network", pt: "← → navegar · N rede" },
    now: { en: "now", pt: "atual" },
    switchLang: { en: "Mudar para português", pt: "Switch to English" },
    core: { en: "Start & end", pt: "Início & fim" },
  },
};
