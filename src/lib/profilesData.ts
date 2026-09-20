import fs from "fs";
import path from "path";
import { CandidateProfile } from "@/types";

let cachedProfiles: CandidateProfile[] | null = null;

export function getCandidateProfiles(): CandidateProfile[] {
  if (cachedProfiles) {
    return cachedProfiles;
  }

  // Look in project root for profiles.json or sample data name
  const primaryPath = path.join(process.cwd(), "profiles.json");
  const fallbackPath = path.join(
    process.cwd(),
    "profiles.json - Flexiple Engineering Challenge sample data"
  );

  const targetPath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Candidate profiles dataset not found at ${targetPath}`);
  }

  const rawData = fs.readFileSync(targetPath, "utf-8");
  cachedProfiles = JSON.parse(rawData) as CandidateProfile[];
  return cachedProfiles;
}
