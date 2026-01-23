import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const SONAR_HOST = process.env.SONAR_HOST;
const SONAR_TOKEN = process.env.SONAR_TOKEN;
const PROJECT_KEY = process.env.PROJECT_KEY;
const BRANCH = process.env.BRANCH;

if (!SONAR_HOST) {
  throw new Error("Defina a variável de ambiente SONAR_HOST");
}

if (!PROJECT_KEY) {
  throw new Error("Defina a variável de ambiente PROJECT_KEY");
}

if (!SONAR_TOKEN) {
  throw new Error("Defina a variável de ambiente SONAR_TOKEN");
}
type OrderMode = "priority" | "component";

function getOrderMode(): OrderMode {
  const arg = process.argv.find(a => a.startsWith("--order="));
  if (!arg) {
    return "priority"; // padrão
  }

  const value = arg.split("=")[1];
  if (value === "component" || value === "priority") {
    return value;
  }

  console.warn(`Modo de ordenação inválido (${value}), usando 'priority'.`);
  return "priority";
}

const typePriority: Record<string, number> = {
  BUG: 1,
  VULNERABILITY: 2,
  CODE_SMELL: 3
};

const severityPriority: Record<string, number> = {
  BLOCKER: 1,
  CRITICAL: 2,
  MAJOR: 3
};

const auth = {
  username: SONAR_TOKEN,
  password: ""
};

type Issue = {
  key: string;
  type: string;
  severity: string;
  status: string;
  component?: string;
  line?: number;
  message: string;
  author?: string;
  creationDate: string;
};

async function fetchIssues() {
  let page = 1;
  const pageSize = 500;
  const allIssues: any[] = [];

  while (true) {
    const response = await axios.get(
      `${SONAR_HOST}/api/issues/search`,
      {
        auth,
        params: {
          componentKeys: PROJECT_KEY,
          branch: BRANCH,
          types: "BUG,CODE_SMELL",
          severities: "MAJOR,CRITICAL",
          statuses: "OPEN",
          ps: pageSize,
          p: page
        }
      }
    );

    const issues = response.data.issues;
    allIssues.push(...issues);

    if (issues.length < pageSize) {
      break;
    }

    page++;
  }

  return allIssues;
}

function generateCSV(issues: any[]) {
  const header = [
    "KEY",
    "TYPE",
    "SEVERITY",
    "STATUS",
    "COMPONENT",
    "LINE",
    "MESSAGE",
    "AUTHOR",
    "CREATION_DATE",
    "BRANCH"
  ];

  const rows = issues.map(issue => [
    issue.key,
    issue.type,
    issue.severity,
    issue.status,
    issue.component,
    issue.line ?? "",
    `"${issue.message.replace(/"/g, '""')}"`,
    issue.author ?? "",
    issue.creationDate,
    BRANCH
  ]);

  const csv = [
    header.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const fileName = `sonar-bugs-major-critical-${BRANCH}.csv`;
  fs.writeFileSync(fileName, csv, "utf-8");

  console.log(`Arquivo gerado: ${fileName}`);
}

function sortIssues(issues: Issue[], mode: OrderMode): Issue[] {
  return issues.sort((a, b) => {
    if (mode === "component") {
      return (a.component ?? "").localeCompare(b.component ?? "");
    }

    // PRIORITY (padrão)
    const typeDiff =
      (typePriority[a.type] ?? 99) -
      (typePriority[b.type] ?? 99);

    if (typeDiff !== 0) return typeDiff;

    const severityDiff =
      (severityPriority[a.severity] ?? 99) -
      (severityPriority[b.severity] ?? 99);

    if (severityDiff !== 0) return severityDiff;

    return (a.component ?? "").localeCompare(b.component ?? "");
  });
}


(async () => {
  try {
    const orderMode = getOrderMode();
    console.log(`Buscando issues no SonarQube (order=${orderMode})...`);

    const issues = await fetchIssues();
    const sortedIssues = sortIssues(issues, orderMode);

    await generateCSV(sortedIssues);

    console.log(`CSV gerado com sucesso (${sortedIssues.length} issues).`);
  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    process.exit(1);
  }
})();
