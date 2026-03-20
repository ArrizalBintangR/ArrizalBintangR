const fs = require("fs");

const README_PATH = "README.md";
const START_MARKER = "<!-- YEAR_PROGRESS_START -->";
const END_MARKER = "<!-- YEAR_PROGRESS_END -->";
const BAR_WIDTH = 30;
const TIME_ZONE = "Asia/Jakarta";

function getDatePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const data = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      data[part.type] = Number(part.value);
    }
  }

  return {
    year: data.year,
    month: data.month,
    day: data.day,
  };
}

function getYearProgressWIB(date = new Date()) {
  const { year, month, day } = getDatePartsInTimeZone(date, TIME_ZONE);
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const today = Date.UTC(year, month - 1, day);

  const dayOfYear = Math.floor((today - start) / 86400000) + 1;
  const daysInYear = Math.floor((end - start) / 86400000);
  const ratio = dayOfYear / daysInYear;
  const percent = (ratio * 100).toFixed(2);

  const filled = Math.round(ratio * BAR_WIDTH);
  const bar = "█".repeat(filled) + "_".repeat(BAR_WIDTH - filled);

  return { year, line: `Year progress ${year} { ${bar} } ${percent}%` };
}

function normalizeEntryLine(line) {
  return line
    .replace(/^\d+\.\s*/, "")
    .replace(/^~~/, "")
    .replace(/~~$/, "")
    .trim();
}

function parseEntries(blockBody) {
  return blockBody
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => normalizeEntryLine(line))
    .map((line) => {
      const match = line.match(/Year progress\s+(\d{4})\s+\{/);
      if (!match) {
        return null;
      }
      return { year: Number(match[1]), line };
    })
    .filter(Boolean);
}

function buildUnorderedList(currentEntry, existingEntries) {
  const dedupedPast = [];
  const seenYears = new Set();

  for (const entry of existingEntries) {
    if (entry.year === currentEntry.year || seenYears.has(entry.year)) {
      continue;
    }
    seenYears.add(entry.year);
    dedupedPast.push(entry);
  }

  const ordered = [currentEntry, ...dedupedPast];
  return ordered
    .map((entry, index) => {
      const text =
        index === 0 ? entry.line : `~~${normalizeEntryLine(entry.line)}~~`;
      return `- ${text}`;
    })
    .join("\n");
}

function updateReadme() {
  const readme = fs.readFileSync(README_PATH, "utf8");

  const markerPattern = new RegExp(`(${START_MARKER})([\\s\\S]*?)(${END_MARKER})`, "m");

  const markerMatch = readme.match(markerPattern);
  if (!markerMatch) {
    throw new Error("Year progress markers were not found in README.md");
  }

  const currentEntry = getYearProgressWIB();
  const existingEntries = parseEntries(markerMatch[2]);
  const updatedBlockBody = buildUnorderedList(currentEntry, existingEntries);
  const updatedReadme = readme.replace(markerPattern, `$1\n${updatedBlockBody}\n$3`);

  if (updatedReadme !== readme) {
    fs.writeFileSync(README_PATH, updatedReadme, "utf8");
    console.log("README.md year progress updated.");
  } else {
    console.log("README.md already up to date.");
  }
}

updateReadme();
