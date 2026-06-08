import { db } from "@/db";
import { idCounters } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const DEPT_CODES: Record<string, string> = {
  CSE: "CSE",
  ECE: "ECE",
  MEE: "MEE",
  CIV: "CIV",
  EEE: "EEE",
  IT: "IT",
  MCA: "MCA",
  "Computer Science and Engineering": "CSE",
  "Electronics and Communication": "ECE",
  "Mechanical Engineering": "MEE",
  "Civil Engineering": "CIV",
  "Electrical Engineering": "EEE",
  "Information Technology": "IT",
  "Master of Computer Applications": "MCA",
};

export async function generateIEDCId(
  department: string,
  joiningYear?: number
): Promise<string> {
  const deptCode = DEPT_CODES[department] || department;
  const year = joiningYear || new Date().getFullYear();
  const key = `${deptCode}_${year}`;

  // Atomic upsert with increment
  await db
    .insert(idCounters)
    .values({ deptYear: key, count: 1 })
    .onConflictDoUpdate({
      target: idCounters.deptYear,
      set: {
        count: sql`${idCounters.count} + 1`,
        updatedAt: sql`NOW()`,
      },
    });

  const result = await db
    .select()
    .from(idCounters)
    .where(eq(idCounters.deptYear, key));

  const paddedNum = String(result[0].count).padStart(5, "0");
  return `IEDC-${year}-${deptCode}-${paddedNum}`;
}
