export type Question = {
  id: number;
  section: string;
  type: "mcq";
  question: string;
  options: string[];
  answer: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
};


export const grammarQuestions: Question[] = [

  {
    id: 1,
    section: "Grammar",
    type: "mcq",
    question: "Choose the correct sentence.",
    options: [
      "The students studies English every day.",
      "The students study English every day.",
      "The students studying English every day.",
      "The students has studied English every day."
    ],
    answer: "The students study English every day.",
    marks: 2,
    difficulty: "easy"
  },


  {
    id: 2,
    section: "Grammar",
    type: "mcq",
    question:
      "She wants to become ___ engineer after completing her studies.",
    options: [
      "a",
      "an",
      "the",
      "no article"
    ],
    answer: "an",
    marks: 2,
    difficulty: "easy"
  },


  {
    id: 3,
    section: "Grammar",
    type: "mcq",
    question:
      "My brother ___ in Singapore since 2023.",
    options: [
      "lives",
      "lived",
      "has lived",
      "is living"
    ],
    answer: "has lived",
    marks: 2,
    difficulty: "easy"
  },


  {
    id: 4,
    section: "Grammar",
    type: "mcq",
    question:
      "Choose the correct sentence.",
    options: [
      "The university which I applied accepts international students.",
      "The university where I applied accepts international students.",
      "The university I applied to accepts international students.",
      "The university what I applied to accepts international students."
    ],
    answer:
      "The university I applied to accepts international students.",
    marks: 2,
    difficulty: "medium"
  },


  {
    id: 5,
    section: "Grammar",
    type: "mcq",
    question:
      "If students practice regularly, they ___ their English skills faster.",
    options: [
      "improve",
      "improved",
      "would improve",
      "had improved"
    ],
    answer: "improve",
    marks: 2,
    difficulty: "medium"
  },


  {
    id: 6,
    section: "Grammar",
    type: "mcq",
    question:
      "Many environmental problems ___ by human activities.",
    options: [
      "cause",
      "caused",
      "are caused",
      "are causing"
    ],
    answer: "are caused",
    marks: 2,
    difficulty: "medium"
  },


  {
    id: 7,
    section: "Grammar",
    type: "mcq",
    question:
      "The cost of living is increasing; ___, many young people are finding it difficult to save money.",
    options: [
      "however",
      "therefore",
      "although",
      "because"
    ],
    answer: "therefore",
    marks: 2,
    difficulty: "medium"
  },


  {
    id: 8,
    section: "Grammar",
    type: "mcq",
    question:
      "Choose the correct sentence.",
    options: [
      "Despite he was inexperienced, he managed to complete the project successfully.",
      "Despite being inexperienced, he managed to complete the project successfully.",
      "Despite of his inexperienced, he managed to complete the project successfully.",
      "Despite he being inexperienced, he managed completing the project successfully."
    ],
    answer:
      "Despite being inexperienced, he managed to complete the project successfully.",
    marks: 2,
    difficulty: "hard"
  },


  {
    id: 9,
    section: "Grammar",
    type: "mcq",
    question:
      "Choose the correct sentence.",
    options: [
      "Never I have seen such a beautiful place.",
      "Never have I seen such a beautiful place.",
      "Never I saw such a beautiful place.",
      "Never did I have seen such a beautiful place."
    ],
    answer:
      "Never have I seen such a beautiful place.",
    marks: 2,
    difficulty: "hard"
  },


  {
    id: 10,
    section: "Grammar",
    type: "mcq",
    question:
      "If I had studied harder when I was younger, I ___ a better position now.",
    options: [
      "would have",
      "would have had",
      "would be in",
      "will be in"
    ],
    answer:
      "would be in",
    marks: 2,
    difficulty: "hard"
  }

];
