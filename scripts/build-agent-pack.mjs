import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");

function compact(value) {
  return typeof value === "string" ? value.trim() : value;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sourceIdFromUrl(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const robotsPath = path.join(dataDir, "humanoids.json");
const metadataPath = path.join(dataDir, "metadata.json");
const robots = JSON.parse(await fs.readFile(robotsPath, "utf8")).map((record) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(record)) {
    cleaned[key] = compact(value);
  }
  return cleaned;
});
const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));

await fs.writeFile(path.join(dataDir, "robots.json"), `${JSON.stringify(robots, null, 2)}\n`);

const companyMap = new Map();
for (const robot of robots) {
  const key = robot.company || "Unknown";
  const current =
    companyMap.get(key) ||
    {
      id: key
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      company: key,
      country: robot.country || "",
      website: robot.website || "",
      x: robot.x || "",
      linkedin: robot.linkedin || "",
      youtube: robot.youtube || "",
      careers: robot.careers || "",
      stock: robot.stock || "",
      investors: robot.investors || "",
      rounds: robot.rounds || "",
      robot_ids: [],
      robots: [],
      evidence_level: "derived",
      source_note: "Derived from data/robots.json."
    };

  current.robot_ids.push(robot.id);
  current.robots.push(robot.robot);
  for (const field of ["country", "website", "x", "linkedin", "youtube", "careers", "stock", "investors", "rounds"]) {
    if (!current[field] && robot[field]) current[field] = robot[field];
  }
  companyMap.set(key, current);
}

const companies = [...companyMap.values()].map((company) => ({
  ...company,
  robot_ids: unique(company.robot_ids),
  robots: unique(company.robots),
  robot_count: unique(company.robot_ids).length
}));

await fs.writeFile(path.join(dataDir, "companies.json"), `${JSON.stringify(companies, null, 2)}\n`);

const sources = [
  {
    id: "integrarobot-working-google-sheet",
    title: "Integrarobot working Google Sheet export",
    url: metadata.source,
    source_type: "google_sheets_csv_export",
    evidence_level: "database",
    updated_at: metadata.updated_at,
    notes: "Primary working export for the current data package."
  }
];

for (const robot of robots) {
  for (const [field, sourceType] of [
    ["website", "official_or_best_available_url"],
    ["x", "social_profile"],
    ["linkedin", "social_profile"],
    ["youtube", "demo_or_channel"],
    ["careers", "careers_page"]
  ]) {
    const url = robot[field];
    if (!url) continue;
    sources.push({
      id: sourceIdFromUrl(url),
      title: `${robot.company} / ${robot.robot} ${field}`,
      url,
      source_type: sourceType,
      related_record_id: robot.id,
      evidence_level: field === "website" ? "official" : "source_reference",
      date_checked: metadata.updated_at
    });
  }
}

const dedupedSources = [...new Map(sources.map((source) => [source.id, source])).values()];
await fs.writeFile(path.join(dataDir, "sources.json"), `${JSON.stringify(dedupedSources, null, 2)}\n`);

const claims = robots.flatMap((robot) => {
  const base = {
    record_id: robot.id,
    company: robot.company,
    robot: robot.robot,
    date_checked: metadata.updated_at
  };
  const output = [
    {
      ...base,
      claim_type: "existence",
      claim: `${robot.company} is listed with robot/platform ${robot.robot}.`,
      evidence_level: robot.website ? "official_url_present" : "database",
      source_id: robot.website ? sourceIdFromUrl(robot.website) : "integrarobot-working-google-sheet",
      confidence: robot.website ? "medium" : "low",
      caveat: "Listing indicates visibility in the Integrarobot database, not guaranteed commercial availability."
    }
  ];

  const specs = ["height_cm", "weight_kg", "walk_kmh", "run_kmh", "payload_kg", "power_hours"].filter(
    (field) => robot[field]
  );
  if (specs.length) {
    output.push({
      ...base,
      claim_type: "specifications_present",
      claim: `${robot.robot} has specification fields recorded: ${specs.join(", ")}.`,
      evidence_level: "database",
      source_id: "integrarobot-working-google-sheet",
      confidence: "low",
      caveat: "Specification values should be verified against official sources before high-stakes use."
    });
  }

  if (robot.investors || robot.rounds || robot.valuation || robot.stock) {
    output.push({
      ...base,
      claim_type: "commercial_signal",
      claim: `${robot.company} has commercial, funding, investor, valuation, or stock-related signals recorded.`,
      evidence_level: "database",
      source_id: "integrarobot-working-google-sheet",
      confidence: "low",
      caveat: "Commercial and funding fields can become stale quickly and should be checked against current sources."
    });
  }

  return output;
});

await fs.writeFile(path.join(dataDir, "claims.json"), `${JSON.stringify(claims, null, 2)}\n`);

const agentMetadata = {
  title: "Integrarobot Robotics Agent Context Pack",
  generated_at: new Date().toISOString(),
  based_on: metadata,
  files: [
    "AGENTS.md",
    "README.md",
    "questions.md",
    "schema.md",
    "weekly/2026-05-26.md",
    "data/robots.json",
    "data/companies.json",
    "data/sources.json",
    "data/claims.json",
    "data/schema.json",
    "data/metadata.json"
  ]
};

await fs.writeFile(path.join(dataDir, "agent-context-pack.json"), `${JSON.stringify(agentMetadata, null, 2)}\n`);

console.log(`Built agent context pack: ${robots.length} robots, ${companies.length} companies, ${claims.length} claims.`);
