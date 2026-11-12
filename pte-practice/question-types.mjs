/** Pearson Academic 2025+ registry. 
 * Data checked against official Oct 2026 score guide.
 * These are task/trait mappings, NOT official weighted scoring or test-equating parameters.
 * Every question must have original/licensed content and reviewed answer keys.
 */
export const QUESTION_TYPES = Object.freeze([
  {
    "id": "ra",
    "title": "Read Aloud",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 6,
      "max": 7
    },
    "skills": [
      "Speaking"
    ],
    "input": "spoken",
    "rule": "phonetic-alignment",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "rs",
    "title": "Repeat Sentence",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 10,
      "max": 12
    },
    "skills": [
      "Listening",
      "Speaking"
    ],
    "input": "spoken",
    "rule": "ordered-recall-plus-acoustic",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "di",
    "title": "Describe Image",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 5,
      "max": 6
    },
    "skills": [
      "Speaking"
    ],
    "input": "spoken",
    "rule": "meaning-plus-acoustic",
    "expertContentReview": true,
    "stage": "spec-complete"
  },
  {
    "id": "rl",
    "title": "Retell Lecture",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Listening",
      "Speaking"
    ],
    "input": "spoken",
    "rule": "meaning-plus-acoustic",
    "expertContentReview": true,
    "stage": "spec-complete"
  },
  {
    "id": "asq",
    "title": "Answer Short Question",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 5,
      "max": 6
    },
    "skills": [
      "Listening"
    ],
    "input": "spoken",
    "rule": "curated-semantic-aliases",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "sgd",
    "title": "Summarize Group Discussion",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Listening",
      "Speaking"
    ],
    "input": "spoken",
    "rule": "three-speaker-meaning-plus-acoustic",
    "expertContentReview": true,
    "stage": "spec-complete"
  },
  {
    "id": "rts",
    "title": "Respond to a Situation",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Speaking"
    ],
    "input": "spoken",
    "rule": "situation-goal-and-register-plus-acoustic",
    "expertContentReview": true,
    "stage": "spec-complete"
  },
  {
    "id": "swt",
    "title": "Summarize Written Text",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 2,
      "max": 2
    },
    "skills": [
      "Reading",
      "Writing"
    ],
    "input": "typed",
    "rule": "content-form-grammar-vocabulary",
    "expertContentReview": true,
    "stage": "spec-complete"
  },
  {
    "id": "we",
    "title": "Write Essay",
    "section": "Speaking & Writing",
    "itemsInExam": {
      "min": 1,
      "max": 1
    },
    "skills": [
      "Writing"
    ],
    "input": "typed",
    "rule": "seven-trait-essay-rubric",
    "expertContentReview": true,
    "stage": "spec-complete"
  },
  {
    "id": "rfib-dropdown",
    "title": "Fill in the Blanks (Dropdown)",
    "section": "Reading",
    "itemsInExam": {
      "min": 5,
      "max": 6
    },
    "skills": [
      "Reading"
    ],
    "input": "dropdown",
    "rule": "exact-per-gap",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "rmcma",
    "title": "Multiple Choice, Multiple Answers",
    "section": "Reading",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Reading"
    ],
    "input": "checkbox",
    "rule": "plus-minus-floor-zero",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "rop",
    "title": "Reorder Paragraph",
    "section": "Reading",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Reading"
    ],
    "input": "reorder",
    "rule": "adjacent-pairs",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "rfib-drag",
    "title": "Fill in the Blanks (Drag and Drop)",
    "section": "Reading",
    "itemsInExam": {
      "min": 4,
      "max": 5
    },
    "skills": [
      "Reading"
    ],
    "input": "word-bank",
    "rule": "exact-per-gap",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "rmcsa",
    "title": "Multiple Choice, Single Answer",
    "section": "Reading",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Reading"
    ],
    "input": "radio",
    "rule": "exact-single",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "sst",
    "title": "Summarize Spoken Text",
    "section": "Listening",
    "itemsInExam": {
      "min": 1,
      "max": 1
    },
    "skills": [
      "Listening",
      "Writing"
    ],
    "input": "typed-with-audio",
    "rule": "content-form-grammar-vocabulary-spelling",
    "expertContentReview": true,
    "stage": "spec-complete"
  },
  {
    "id": "lmcma",
    "title": "Multiple Choice, Multiple Answers",
    "section": "Listening",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Listening"
    ],
    "input": "checkbox-audio",
    "rule": "plus-minus-floor-zero",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "lfib",
    "title": "Fill in the Blanks (Type In)",
    "section": "Listening",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Listening"
    ],
    "input": "typed-gaps-audio",
    "rule": "exact-per-gap",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "hcs",
    "title": "Highlight Correct Summary",
    "section": "Listening",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Listening",
      "Reading"
    ],
    "input": "radio-audio",
    "rule": "exact-single",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "lmcsa",
    "title": "Multiple Choice, Single Answer",
    "section": "Listening",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Listening"
    ],
    "input": "radio-audio",
    "rule": "exact-single",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "smw",
    "title": "Select Missing Word",
    "section": "Listening",
    "itemsInExam": {
      "min": 1,
      "max": 2
    },
    "skills": [
      "Listening"
    ],
    "input": "radio-audio",
    "rule": "exact-single",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "hiw",
    "title": "Highlight Incorrect Words",
    "section": "Listening",
    "itemsInExam": {
      "min": 2,
      "max": 3
    },
    "skills": [
      "Listening",
      "Reading"
    ],
    "input": "highlight-audio",
    "rule": "plus-minus-floor-zero",
    "expertContentReview": false,
    "stage": "spec-complete"
  },
  {
    "id": "wfd",
    "title": "Write from Dictation",
    "section": "Listening",
    "itemsInExam": {
      "min": 3,
      "max": 4
    },
    "skills": [
      "Listening",
      "Writing"
    ],
    "input": "typed-with-audio",
    "rule": "sequence-aware-exact-words",
    "expertContentReview": false,
    "stage": "spec-complete"
  }
]);
export const QUESTION_TYPE_BY_ID = Object.freeze(Object.fromEntries(QUESTION_TYPES.map(q=>[q.id,q])));
export const EXAM_SECTIONS = Object.freeze([
  {id:"speaking-writing",name:"Speaking & Writing",minutes:[76,84]},
  {id:"reading",name:"Reading",minutes:[23,30]},
  {id:"listening",name:"Listening",minutes:[31,39]}
]);
export const SOURCE_GUIDE = "https://www.pearsonpte.com/content/dam/ELL/pte/pearsonpte/resources/PTE-Academic-Test-Taker-Score-Guide.pdf";
