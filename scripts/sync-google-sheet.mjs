import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");

const defaultCsvUrl =
  "https://docs.google.com/spreadsheets/d/1Cg8FNh8ZeMopfQTM5oCF_E87Jxe27z8R54a8XRjKlxQ/gviz/tq?tqx=out:csv&gid=973484009";

const csvUrl = process.env.SHEET_CSV_URL || defaultCsvUrl;
const localOnly = process.argv.includes("--local-only");

const headerMap = new Map([
  ["robot_slug", "robot_slug"],
  ["company_slug", "company_slug"],
  ["Lab", "company"],
  ["Robot", "robot"],
  ["Web", "website"],
  ["X", "x"],
  ["Linkedin", "linkedin"],
  ["Youtube", "youtube"],
  ["Country", "country"],
  ["Careers", "careers"],
  ["B2B Client", "b2b_client"],
  ["Stock", "stock"],
  ["Valuation", "valuation"],
  ["Investors", "investors"],
  ["Rounds", "rounds"],
  ["Release", "release"],
  ["Height (cm)", "height_cm"],
  ["Weight (kg)", "weight_kg"],
  ["Walk (km/h)", "walk_kmh"],
  ["Run (km/h)", "run_kmh"],
  ["Payload/carry (kg)", "payload_kg"],
  ["Power (hours)", "power_hours"],
  ["Software", "software"],
  ["Voice", "voice"],
  ["Clothed?", "clothed"],
  ["Company", "company"],
  ["Official URL", "website"],
  ["Release Year", "release"],
  ["Height cm", "height_cm"],
  ["Weight kg", "weight_kg"],
  ["Walk km/h", "walk_kmh"],
  ["Run km/h", "run_kmh"],
  ["Payload kg", "payload_kg"],
  ["Power Hours Text", "power_hours"]
]);

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = value == null ? "" : String(value);
          if (/[",\n\r]/.test(text)) {
            return `"${text.replaceAll('"', '""')}"`;
          }
          return text;
        })
        .join(",")
    )
    .join("\n");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function clean(value) {
  const text = String(value || "").trim();
  if (!text || text === "Not found" || text === "Not disclosed") return "";
  return text;
}

function titleizeSlug(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeRows(rows) {
  const [headers, ...body] = rows.filter((row) => row.some((cell) => String(cell || "").trim()));
  if (!headers) return [];

  const keys = headers.map((header) => headerMap.get(String(header).trim()) || slugify(header));

  return body
    .map((row) => {
      const record = {};
      keys.forEach((key, index) => {
        if (!key) return;
        record[key] = clean(row[index]);
      });

      if (!record.company && record.company_slug) record.company = titleizeSlug(record.company_slug);
      if (!record.robot && record.Robot) record.robot = record.Robot;

      record.company = clean(record.company);
      record.robot = clean(record.robot);
      record.id = slugify(`${record.company}-${record.robot || "robot"}`);
      return record;
    })
    .filter((record) => record.company && record.robot);
}

async function loadCsv() {
  const current = path.join(dataDir, "humanoids.csv");

  if (!localOnly) {
    const response = await fetch(csvUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Integrarobot Robotics Database Sync" }
    });

    if (!response.ok) {
      throw new Error(`Google Sheets CSV export failed with HTTP ${response.status}`);
    }

    return {
      csv: await response.text(),
      source: csvUrl,
      mode: "google_sheets"
    };
  }

  return {
    csv: await readFile(current, "utf8"),
    source: "local data/humanoids.csv",
    mode: "local"
  };
}

async function main() {
  await mkdir(dataDir, { recursive: true });
  const { csv, source, mode } = await loadCsv();
  const records = normalizeRows(parseCsv(csv));

  const publicHeaders = [
    "id",
    "company",
    "robot",
    "country",
    "website",
    "x",
    "linkedin",
    "youtube",
    "careers",
    "b2b_client",
    "stock",
    "valuation",
    "investors",
    "rounds",
    "release",
    "height_cm",
    "weight_kg",
    "walk_kmh",
    "run_kmh",
    "payload_kg",
    "power_hours",
    "software",
    "voice",
    "clothed"
  ];

  const publicCsv = toCsv([
    publicHeaders,
    ...records.map((record) => publicHeaders.map((header) => record[header] || ""))
  ]);

  const metadata = {
    title: "Integrarobot Humanoid Robotics Database",
    source,
    mode,
    updated_at: new Date().toISOString(),
    row_count: records.length,
    checksum: createHash("sha256").update(publicCsv).digest("hex")
  };

  await writeFile(path.join(dataDir, "humanoids.csv"), `${publicCsv}\n`);
  await writeFile(path.join(dataDir, "humanoids.json"), `${JSON.stringify(records, null, 2)}\n`);
  await writeFile(path.join(dataDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);

  console.log(`Wrote ${records.length} records to data/humanoids.csv and data/humanoids.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
