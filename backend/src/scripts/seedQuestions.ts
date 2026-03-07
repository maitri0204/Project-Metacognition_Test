/**
 * Seed script — adds all 52 MAI (Metacognitive Awareness Inventory) questions.
 *
 * Usage (from /backend directory):
 *   npx ts-node -r dotenv/config src/scripts/seedQuestions.ts
 *
 * Safe to run multiple times — skips questions that already exist (matched by
 * questionText + category) and only inserts the ones that are missing.
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Question from "../models/Question";

// ─── Question data ────────────────────────────────────────────────────────────

const QUESTIONS: Array<{
  questionText: string;
  part: "Knowledge" | "Regulation";
  category:
    | "Declarative"
    | "Procedural"
    | "Conditional"
    | "Planning"
    | "Information Management"
    | "Monitoring"
    | "Debugging"
    | "Evaluation";
  orderIndex: number;
}> = [
  // ── Section 1: Declarative Knowledge (Items 1–8) ──────────────────────────
  { part: "Knowledge", category: "Declarative", orderIndex: 1,  questionText: "I am aware of what strategies I use when I study." },
  { part: "Knowledge", category: "Declarative", orderIndex: 2,  questionText: "I know what kind of information is most important to learn." },
  { part: "Knowledge", category: "Declarative", orderIndex: 3,  questionText: "I am good at remembering information." },
  { part: "Knowledge", category: "Declarative", orderIndex: 4,  questionText: "I know what the teacher expects me to learn." },
  { part: "Knowledge", category: "Declarative", orderIndex: 5,  questionText: "I understand my intellectual strengths and weaknesses." },
  { part: "Knowledge", category: "Declarative", orderIndex: 6,  questionText: "I know which strategies are most effective for me." },
  { part: "Knowledge", category: "Declarative", orderIndex: 7,  questionText: "I am aware of how well I perform when I learn something new." },
  { part: "Knowledge", category: "Declarative", orderIndex: 8,  questionText: "I know when I understand something and when I do not." },

  // ── Section 2: Procedural Knowledge (Items 9–12) ─────────────────────────
  { part: "Knowledge", category: "Procedural",  orderIndex: 1,  questionText: "I try to use strategies that have worked for me in the past." },
  { part: "Knowledge", category: "Procedural",  orderIndex: 2,  questionText: "I know how to use different study strategies." },
  { part: "Knowledge", category: "Procedural",  orderIndex: 3,  questionText: "I am aware of what strategies I use while solving problems." },
  { part: "Knowledge", category: "Procedural",  orderIndex: 4,  questionText: "I know how to organize information to help me learn better." },

  // ── Section 3: Conditional Knowledge (Items 13–17) ───────────────────────
  { part: "Knowledge", category: "Conditional", orderIndex: 1,  questionText: "I know when each strategy I use will be most effective." },
  { part: "Knowledge", category: "Conditional", orderIndex: 2,  questionText: "I know why certain strategies help me learn better." },
  { part: "Knowledge", category: "Conditional", orderIndex: 3,  questionText: "I use different strategies depending on the situation." },
  { part: "Knowledge", category: "Conditional", orderIndex: 4,  questionText: "I change strategies when I do not understand something." },
  { part: "Knowledge", category: "Conditional", orderIndex: 5,  questionText: "I choose strategies based on the difficulty of the task." },

  // ── Section 4: Planning (Items 18–24) ────────────────────────────────────
  { part: "Regulation", category: "Planning",              orderIndex: 1,  questionText: "I set specific goals before I begin a task." },
  { part: "Regulation", category: "Planning",              orderIndex: 2,  questionText: "I think about what I need to learn before starting a task." },
  { part: "Regulation", category: "Planning",              orderIndex: 3,  questionText: "I plan how I will accomplish a learning task." },
  { part: "Regulation", category: "Planning",              orderIndex: 4,  questionText: "I organize my time before starting work." },
  { part: "Regulation", category: "Planning",              orderIndex: 5,  questionText: "I think about different ways to solve a problem before starting." },
  { part: "Regulation", category: "Planning",              orderIndex: 6,  questionText: "I consider several alternatives before solving a problem." },
  { part: "Regulation", category: "Planning",              orderIndex: 7,  questionText: "I read instructions carefully before beginning a task." },

  // ── Section 5: Information Management Strategies (Items 25–34) ───────────
  { part: "Regulation", category: "Information Management", orderIndex: 1,  questionText: "I focus on the meaning and significance of new information." },
  { part: "Regulation", category: "Information Management", orderIndex: 2,  questionText: "I try to break information into smaller parts." },
  { part: "Regulation", category: "Information Management", orderIndex: 3,  questionText: "I create examples to help me understand concepts." },
  { part: "Regulation", category: "Information Management", orderIndex: 4,  questionText: "I summarize information in my own words." },
  { part: "Regulation", category: "Information Management", orderIndex: 5,  questionText: "I organize information to help me remember it." },
  { part: "Regulation", category: "Information Management", orderIndex: 6,  questionText: "I focus on important information and ignore distractions." },
  { part: "Regulation", category: "Information Management", orderIndex: 7,  questionText: "I try to relate new information to what I already know." },
  { part: "Regulation", category: "Information Management", orderIndex: 8,  questionText: "I draw diagrams or charts to help understand ideas." },
  { part: "Regulation", category: "Information Management", orderIndex: 9,  questionText: "I slow down when I encounter difficult information." },
  { part: "Regulation", category: "Information Management", orderIndex: 10, questionText: "I re-read information to improve understanding." },

  // ── Section 6: Monitoring (Items 35–41) ──────────────────────────────────
  { part: "Regulation", category: "Monitoring",             orderIndex: 1,  questionText: "I ask myself questions about what I am learning." },
  { part: "Regulation", category: "Monitoring",             orderIndex: 2,  questionText: "I check whether I understand what I am studying." },
  { part: "Regulation", category: "Monitoring",             orderIndex: 3,  questionText: "I periodically review what I have learned." },
  { part: "Regulation", category: "Monitoring",             orderIndex: 4,  questionText: "I consider whether my learning strategies are effective." },
  { part: "Regulation", category: "Monitoring",             orderIndex: 5,  questionText: "I check my progress while learning." },
  { part: "Regulation", category: "Monitoring",             orderIndex: 6,  questionText: "I question whether I have understood material correctly." },
  { part: "Regulation", category: "Monitoring",             orderIndex: 7,  questionText: "I notice when I become confused during learning." },

  // ── Section 7: Debugging Strategies (Items 42–46) ────────────────────────
  { part: "Regulation", category: "Debugging",              orderIndex: 1,  questionText: "I try to identify errors in my thinking." },
  { part: "Regulation", category: "Debugging",              orderIndex: 2,  questionText: "I stop and review when I get confused." },
  { part: "Regulation", category: "Debugging",              orderIndex: 3,  questionText: "I try different strategies when I do not understand something." },
  { part: "Regulation", category: "Debugging",              orderIndex: 4,  questionText: "I ask others for help when I cannot understand something." },
  { part: "Regulation", category: "Debugging",              orderIndex: 5,  questionText: "I re-evaluate my approach when I encounter difficulties." },

  // ── Section 8: Evaluation (Items 47–52) ──────────────────────────────────
  { part: "Regulation", category: "Evaluation",             orderIndex: 1,  questionText: "I summarize what I have learned after finishing a task." },
  { part: "Regulation", category: "Evaluation",             orderIndex: 2,  questionText: "I reflect on how well I achieved my learning goals." },
  { part: "Regulation", category: "Evaluation",             orderIndex: 3,  questionText: "I evaluate the effectiveness of my study strategies." },
  { part: "Regulation", category: "Evaluation",             orderIndex: 4,  questionText: "I think about how I could improve my performance." },
  { part: "Regulation", category: "Evaluation",             orderIndex: 5,  questionText: "I analyze mistakes to understand why they happened." },
  { part: "Regulation", category: "Evaluation",             orderIndex: 6,  questionText: "I reflect on what worked and what did not after completing a task." },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB…");
  await mongoose.connect(mongoURI, { dbName: "Metacognition_test" });
  console.log("✅ Connected\n");

  let inserted = 0;
  let skipped  = 0;

  for (const q of QUESTIONS) {
    const exists = await Question.findOne({
      category:     q.category,
      questionText: q.questionText,
    });

    if (exists) {
      console.log(`⏭  [${q.category}] Already exists — skipping: "${q.questionText.slice(0, 60)}…"`);
      skipped++;
    } else {
      await Question.create({ ...q, isActive: true });
      console.log(`✅ [${q.category}] Added #${q.orderIndex}: "${q.questionText.slice(0, 60)}…"`);
      inserted++;
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`📊 Summary:`);
  console.log(`   Inserted : ${inserted}`);
  console.log(`   Skipped  : ${skipped} (already in DB)`);
  console.log(`   Total    : ${QUESTIONS.length}`);
  console.log(`─────────────────────────────────────────\n`);

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB. Done!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
