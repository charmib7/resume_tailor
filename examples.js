// Example data so the page shows what it does on first load.
// Replace with your own in the page (it's saved in your browser), or edit these defaults.

window.EXAMPLES = {
  job: `Fieldnote Analytics — Software Engineering Intern (Full-Stack), Summer 2027

About the role
You'll join our product team building the dashboards customers use to explore survey data. You'll ship features end to end: React/TypeScript front end, REST APIs in Node.js, and PostgreSQL.

What you'll do
- Build and polish data-heavy UI components in React and TypeScript
- Design and implement REST API endpoints and SQL queries
- Improve performance of slow pages and queries
- Write unit and integration tests; review teammates' code

Requirements
- Pursuing a BS/MS in Computer Science or related field
- Experience with JavaScript/TypeScript and a modern front-end framework (React preferred)
- Familiarity with relational databases and SQL
- Comfortable writing automated tests

Nice to have
- Python data tooling (pandas), data pipelines
- AWS or another cloud provider
- Experience shipping a product with real users`,

  experiences: `## Software Engineering Intern | Lumen Health | Jun 2026 – Aug 2026 | San Francisco, CA
- Built a React dashboard that shows clinicians patient vitals in real time; used daily by 40 nurses across 2 hospital units
- Wrote Node.js REST endpoints backed by PostgreSQL for the vitals service
- Added indexes and rewrote two slow queries, cutting dashboard load time from 3.1s to 1.2s
- Added Jest tests to the API, raising coverage from 52% to 78%
- Presented the project at the intern demo day to ~120 employees

## Undergraduate Researcher | Distributed Systems Research Group, UC Berkeley | Jan 2026 – Present | Berkeley, CA
- Benchmarked 4 caching strategies for serverless functions on AWS Lambda in Python
- Built a pandas data pipeline that cleans and aggregates 2M function-trace records
- Made plots for a workshop paper draft (co-author, under review)

## Teaching Assistant, CS 61B (Data Structures) | UC Berkeley | Aug 2025 – May 2026 | Berkeley, CA
- Led two weekly discussion sections of ~30 students on data structures in Java
- Wrote autograder tests for 3 programming projects
- Held 4 hours of office hours per week

## Project: CalTrack | Personal project | Sep 2025 – Dec 2025
- React Native + Firebase app showing live campus bike-share availability
- Grew to ~600 weekly active users after posting to the campus subreddit
- Implemented push notifications when a nearby dock has bikes

## Project: Job-posting matcher | Class project (CS 189) | Mar 2026 – May 2026
- Ranked job postings against resumes using sentence embeddings and logistic regression in Python (scikit-learn)
- Reached 0.81 AUC on a labeled set of 3,000 pairs

## Barista | Corner Grind Café | Jun 2023 – Aug 2024 | Oakland, CA
- Trained 4 new hires
- Handled 200+ orders per shift during morning rush`,

  template: String.raw`\documentclass[11pt,letterpaper]{article}
\usepackage[margin=0.6in]{geometry}
\usepackage[hidelinks]{hyperref}
\usepackage{enumitem}
\usepackage{titlesec}
\setlength{\parindent}{0pt}
\pagestyle{empty}
\titleformat{\section}{\large\bfseries\scshape}{}{0pt}{}[\titlerule]
\titlespacing*{\section}{0pt}{10pt}{6pt}
\setlist[itemize]{leftmargin=1.2em,itemsep=1pt,topsep=2pt}

% \entry{Title}{Dates}{Organization}{Location}
\newcommand{\entry}[4]{%
  \textbf{#1}\hfill #2\\
  \textit{#3}\hfill \textit{#4}\par}

\begin{document}

\begin{center}
  {\LARGE\bfseries Alex Rivera}\\[3pt]
  alex.rivera@example.com \,|\, (510) 555-0142 \,|\, \href{https://github.com/arivera}{github.com/arivera}
\end{center}

\section{Education}
\entry{B.S. Electrical Engineering \& Computer Sciences}{Expected May 2027}{University of California, Berkeley}{Berkeley, CA}
GPA: 3.8/4.0 \quad Coursework: Data Structures, Machine Learning, Databases, Operating Systems

\section{Experience}
\entry{Role}{Dates}{Company}{Location}
\begin{itemize}
  \item Bullet point
\end{itemize}

\section{Projects}
\entry{Project}{Dates}{Context}{}
\begin{itemize}
  \item Bullet point
\end{itemize}

\section{Skills}
\textbf{Languages:} Python, Java, TypeScript, JavaScript, C, SQL\\
\textbf{Tools:} React, React Native, Node.js, PostgreSQL, Firebase, AWS Lambda, pandas, scikit-learn, Jest, Git

\end{document}`,

  // A finished run for the inputs above, so the output side isn't empty on first visit.
  result: {
    keywords: [
      { term: "React", covered: true },
      { term: "TypeScript", covered: false },
      { term: "REST APIs", covered: true },
      { term: "Node.js", covered: true },
      { term: "PostgreSQL / SQL", covered: true },
      { term: "Performance", covered: true },
      { term: "Automated testing", covered: true },
      { term: "pandas / data pipelines", covered: true },
      { term: "AWS", covered: true },
      { term: "Real users", covered: true }
    ],
    selected: [
      {
        section: "Experience",
        title: "Software Engineering Intern", org: "Lumen Health", dates: "Jun 2026 – Aug 2026", location: "San Francisco, CA",
        why: "Closest match: full-stack React, Node.js REST APIs, PostgreSQL, query performance and tests.",
        bullets: [
          { original: "Built a React dashboard that shows clinicians patient vitals in real time; used daily by 40 nurses across 2 hospital units",
            tailored: "Built a data-heavy React dashboard streaming real-time patient vitals, used daily by 40 nurses across 2 hospital units" },
          { original: "Added indexes and rewrote two slow queries, cutting dashboard load time from 3.1s to 1.2s",
            tailored: "Designed Node.js REST endpoints on PostgreSQL and tuned slow SQL queries with new indexes, cutting page load from 3.1s to 1.2s" },
          { original: "Added Jest tests to the API, raising coverage from 52% to 78%",
            tailored: "Wrote Jest unit and integration tests for the API, raising coverage from 52% to 78%" }
        ]
      },
      {
        section: "Experience",
        title: "Undergraduate Researcher", org: "Distributed Systems Research Group, UC Berkeley", dates: "Jan 2026 – Present", location: "Berkeley, CA",
        why: "Covers the nice-to-haves: pandas data pipeline and AWS.",
        bullets: [
          { original: "Built a pandas data pipeline that cleans and aggregates 2M function-trace records",
            tailored: "Built a Python data pipeline with pandas to clean and aggregate 2M function-trace records" },
          { original: "Benchmarked 4 caching strategies for serverless functions on AWS Lambda in Python",
            tailored: "Benchmarked 4 caching strategies for serverless functions on AWS Lambda to compare latency and cost" }
        ]
      },
      {
        section: "Projects",
        title: "CalTrack", org: "Personal project", dates: "Sep 2025 – Dec 2025", location: "",
        why: "Shows shipping a product with real users.",
        bullets: [
          { original: "React Native + Firebase app showing live campus bike-share availability",
            tailored: "Shipped a React Native and Firebase app showing live campus bike-share availability" },
          { original: "Grew to ~600 weekly active users after posting to the campus subreddit",
            tailored: "Grew to about 600 weekly active users; added push notifications when nearby docks restock" }
        ]
      },
      {
        section: "Projects",
        title: "Job-posting matcher", org: "Class project (CS 189)", dates: "Mar 2026 – May 2026", location: "",
        why: "Extra Python and data work; a fit for an analytics product.",
        bullets: [
          { original: "Ranked job postings against resumes using sentence embeddings and logistic regression in Python (scikit-learn)",
            tailored: "Ranked job postings against resumes with sentence embeddings and logistic regression in Python, reaching 0.81 AUC on 3,000 labeled pairs" }
        ]
      }
    ],
    skipped: [
      { title: "Teaching Assistant, CS 61B", why: "Strong, but Java teaching is less relevant than the hands-on full-stack work; dropped to keep one page." },
      { title: "Barista, Corner Grind Café", why: "Not related to the role." }
    ],
    notes: "TypeScript is listed in the posting but not shown in any experience. If you've used it, add it to a bullet in your experience bank."
  },

  latex: String.raw`\documentclass[11pt,letterpaper]{article}
\usepackage[margin=0.6in]{geometry}
\usepackage[hidelinks]{hyperref}
\usepackage{enumitem}
\usepackage{titlesec}
\setlength{\parindent}{0pt}
\pagestyle{empty}
\titleformat{\section}{\large\bfseries\scshape}{}{0pt}{}[\titlerule]
\titlespacing*{\section}{0pt}{10pt}{6pt}
\setlist[itemize]{leftmargin=1.2em,itemsep=1pt,topsep=2pt}

% \entry{Title}{Dates}{Organization}{Location}
\newcommand{\entry}[4]{%
  \textbf{#1}\hfill #2\\
  \textit{#3}\hfill \textit{#4}\par}

\begin{document}

\begin{center}
  {\LARGE\bfseries Alex Rivera}\\[3pt]
  alex.rivera@example.com \,|\, (510) 555-0142 \,|\, \href{https://github.com/arivera}{github.com/arivera}
\end{center}

\section{Education}
\entry{B.S. Electrical Engineering \& Computer Sciences}{Expected May 2027}{University of California, Berkeley}{Berkeley, CA}
GPA: 3.8/4.0 \quad Coursework: Data Structures, Machine Learning, Databases, Operating Systems

\section{Experience}
\entry{Software Engineering Intern}{Jun 2026 -- Aug 2026}{Lumen Health}{San Francisco, CA}
\begin{itemize}
  \item Built a data-heavy React dashboard streaming real-time patient vitals, used daily by 40 nurses across 2 hospital units
  \item Designed Node.js REST endpoints on PostgreSQL and tuned slow SQL queries with new indexes, cutting page load from 3.1s to 1.2s
  \item Wrote Jest unit and integration tests for the API, raising coverage from 52\% to 78\%
\end{itemize}

\entry{Undergraduate Researcher}{Jan 2026 -- Present}{Distributed Systems Research Group, UC Berkeley}{Berkeley, CA}
\begin{itemize}
  \item Built a Python data pipeline with pandas to clean and aggregate 2M function-trace records
  \item Benchmarked 4 caching strategies for serverless functions on AWS Lambda to compare latency and cost
\end{itemize}

\section{Projects}
\entry{CalTrack}{Sep 2025 -- Dec 2025}{Personal project}{}
\begin{itemize}
  \item Shipped a React Native and Firebase app showing live campus bike-share availability
  \item Grew to about 600 weekly active users; added push notifications when nearby docks restock
\end{itemize}

\entry{Job-Posting Matcher}{Mar 2026 -- May 2026}{Class project (CS 189)}{}
\begin{itemize}
  \item Ranked job postings against resumes with sentence embeddings and logistic regression in Python, reaching 0.81 AUC on 3,000 labeled pairs
\end{itemize}

\section{Skills}
\textbf{Languages:} JavaScript, TypeScript, SQL, Python, Java, C\\
\textbf{Tools:} React, Node.js, PostgreSQL, Jest, AWS Lambda, pandas, React Native, Firebase, scikit-learn, Git

\end{document}`
};
