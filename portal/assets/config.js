// /portal/assets/config.js

// Brand
export const BRAND = {
  name: "LizOn Education",
  accent: "#0b5a2a",     // dark green
  accent2: "#0f6b33"
};

// Course → default teacher mapping (your current structure)
export const COURSE_TEACHER_DEFAULTS = {
  "IELTS ZERO": "Mr. Prince",
  "IELTS HOPE": "Mr. Prince",
  "IELTS STEP-UP": "Mr. Prince",
  "IELTS DESPERATE": "Mr. Prince",
  "PTE": "Joy Bhaiya",
  "1:1": "Joy Bhaiya",
  "Computer Skills": "Swapnil"
};

// Courses list (use these exact strings in admin)
export const COURSES = [
  "IELTS ZERO",
  "IELTS HOPE",
  "IELTS STEP-UP",
  "IELTS DESPERATE",
  "PTE",
  "1:1",
  "Computer Skills"
];

// Simple helper: format batch like 2026-01 to "January 2026"
export function formatBatch(batch) {
  try {
    const [y, m] = batch.split("-").map(x => parseInt(x, 10));
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  } catch {
    return batch;
  }
}
