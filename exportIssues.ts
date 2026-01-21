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

function sortIssuesByPriority(issues: any[]) {
  return issues.sort((a, b) => {
    const typeDiff =
      (typePriority[a.type] ?? 99) -
      (typePriority[b.type] ?? 99);

    if (typeDiff !== 0) {
      return typeDiff;
    }

    return (
      (severityPriority[a.severity] ?? 99) -
      (severityPriority[b.severity] ?? 99)
    );
  });
}


(async () => {
  const issues = await fetchIssues();
  console.log(`Issues encontradas na branch "${BRANCH}": ${issues.length}`);
  const orderedIssues = sortIssuesByPriority(issues);
  generateCSV(orderedIssues);
})();