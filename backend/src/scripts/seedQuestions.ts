import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in .env");
  process.exit(1);
}

const DEFAULT_OPTIONS = [
  { label: "A", text: "Never",     score: 1 },
  { label: "B", text: "Rarely",    score: 2 },
  { label: "C", text: "Sometimes", score: 3 },
  { label: "D", text: "Often",     score: 4 },
  { label: "E", text: "Always",    score: 5 },
];

const questions = [
  // ────────────────────────────────────────────────────────────
  // Domain 1: Metacognitive Awareness (Self-Knowledge)  Q 1–10
  // ────────────────────────────────────────────────────────────
  {
    questionNumber: 1,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Strengths",
    parameterNumber: 1,
    questionText: "I know which subjects or tasks I perform best in.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 2,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Strengths",
    parameterNumber: 1,
    questionText: "I can clearly explain why I am good at certain types of learning tasks.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 3,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Weaknesses",
    parameterNumber: 2,
    questionText: "I know which subjects or skills I struggle with the most.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 4,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Weaknesses",
    parameterNumber: 2,
    questionText: "I actively try to improve areas where my understanding is weak.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 5,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Knowledge of Learning Strategies",
    parameterNumber: 3,
    questionText: "I know several strategies that help me understand difficult topics.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 6,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Knowledge of Learning Strategies",
    parameterNumber: 3,
    questionText: "I choose different learning methods depending on the subject.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 7,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Understanding Task Requirements",
    parameterNumber: 4,
    questionText: "Before starting a task, I try to understand exactly what is required.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 8,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Understanding Task Requirements",
    parameterNumber: 4,
    questionText: "I identify the key steps needed to complete an assignment.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 9,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Cognitive Biases",
    parameterNumber: 5,
    questionText: "I question my assumptions before making decisions.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 10,
    domain: "Domain 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Cognitive Biases",
    parameterNumber: 5,
    questionText: "I consider alternative viewpoints before forming conclusions.",
    options: DEFAULT_OPTIONS,
  },

  // ────────────────────────────────────────────────────────────
  // Domain 2: Metacognitive Planning  Q 11–20
  // ────────────────────────────────────────────────────────────
  {
    questionNumber: 11,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Goal Setting",
    parameterNumber: 6,
    questionText: "I set clear goals before starting a study or work task.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 12,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Goal Setting",
    parameterNumber: 6,
    questionText: "I break large goals into smaller achievable steps.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 13,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Strategic Planning",
    parameterNumber: 7,
    questionText: "I choose strategies that match the difficulty of a task.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 14,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Strategic Planning",
    parameterNumber: 7,
    questionText: "I think about different ways to approach a problem before starting.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 15,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Time Allocation",
    parameterNumber: 8,
    questionText: "I estimate how much time I need to complete a task.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 16,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Time Allocation",
    parameterNumber: 8,
    questionText: "I organize my schedule to complete tasks on time.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 17,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Resource Identification",
    parameterNumber: 9,
    questionText: "I identify resources (books, videos, experts) that can help me learn.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 18,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Resource Identification",
    parameterNumber: 9,
    questionText: "I actively seek help when I need clarification.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 19,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Anticipating Challenges",
    parameterNumber: 10,
    questionText: "I try to predict problems that might occur while doing a task.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 20,
    domain: "Domain 2: Planning",
    domainNumber: 2,
    parameter: "Anticipating Challenges",
    parameterNumber: 10,
    questionText: "I prepare solutions in advance for potential difficulties.",
    options: DEFAULT_OPTIONS,
  },

  // ────────────────────────────────────────────────────────────
  // Domain 3: Metacognitive Monitoring  Q 21–30
  // ────────────────────────────────────────────────────────────
  {
    questionNumber: 21,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Self-Questioning",
    parameterNumber: 11,
    questionText: "I ask myself questions while learning to check understanding.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 22,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Self-Questioning",
    parameterNumber: 11,
    questionText: "I pause during study sessions to test my understanding.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 23,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Checking Understanding",
    parameterNumber: 12,
    questionText: "I regularly check whether I truly understand the material.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 24,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Checking Understanding",
    parameterNumber: 12,
    questionText: "I explain concepts to myself or others to confirm my understanding.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 25,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Error Detection",
    parameterNumber: 13,
    questionText: "I notice when I make mistakes while solving problems.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 26,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Error Detection",
    parameterNumber: 13,
    questionText: "I review my work to detect errors.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 27,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Strategy Monitoring",
    parameterNumber: 14,
    questionText: "I evaluate whether my study strategy is working.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 28,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Strategy Monitoring",
    parameterNumber: 14,
    questionText: "If a method is ineffective, I look for a better approach.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 29,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Attention Regulation",
    parameterNumber: 15,
    questionText: "I recognize when I lose focus during tasks.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 30,
    domain: "Domain 3: Monitoring",
    domainNumber: 3,
    parameter: "Attention Regulation",
    parameterNumber: 15,
    questionText: "I take actions (breaks or adjustments) to regain concentration.",
    options: DEFAULT_OPTIONS,
  },

  // ────────────────────────────────────────────────────────────
  // Domain 4: Metacognitive Regulation  Q 31–38
  // ────────────────────────────────────────────────────────────
  {
    questionNumber: 31,
    domain: "Domain 4: Regulation",
    domainNumber: 4,
    parameter: "Strategy Adjustment",
    parameterNumber: 16,
    questionText: "I change my learning strategy if something is not working.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 32,
    domain: "Domain 4: Regulation",
    domainNumber: 4,
    parameter: "Strategy Adjustment",
    parameterNumber: 16,
    questionText: "I experiment with new approaches to improve results.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 33,
    domain: "Domain 4: Regulation",
    domainNumber: 4,
    parameter: "Problem-Solving Flexibility",
    parameterNumber: 17,
    questionText: "I try different solutions if the first attempt fails.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 34,
    domain: "Domain 4: Regulation",
    domainNumber: 4,
    parameter: "Problem-Solving Flexibility",
    parameterNumber: 17,
    questionText: "I approach problems from multiple perspectives.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 35,
    domain: "Domain 4: Regulation",
    domainNumber: 4,
    parameter: "Emotional Regulation",
    parameterNumber: 18,
    questionText: "I remain calm and focused when facing difficult tasks.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 36,
    domain: "Domain 4: Regulation",
    domainNumber: 4,
    parameter: "Emotional Regulation",
    parameterNumber: 18,
    questionText: "I manage frustration when learning something challenging.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 37,
    domain: "Domain 4: Metacognitive Regulation",
    domainNumber: 4,
    parameter: "Persistence",
    parameterNumber: 19,
    questionText: "I continue working even when tasks become difficult.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 38,
    domain: "Domain 4: Regulation",
    domainNumber: 4,
    parameter: "Persistence",
    parameterNumber: 19,
    questionText: "I stay motivated until I complete my goals.",
    options: DEFAULT_OPTIONS,
  },

  // ────────────────────────────────────────────────────────────
  // Domain 5: Metacognitive Reflection  Q 39–40
  // ────────────────────────────────────────────────────────────
  {
    questionNumber: 39,
    domain: "Domain 5: Reflection",
    domainNumber: 5,
    parameter: "Reflective Evaluation",
    parameterNumber: 20,
    questionText: "After completing a task, I think about what worked well.",
    options: DEFAULT_OPTIONS,
  },
  {
    questionNumber: 40,
    domain: "Domain 5: Reflection",
    domainNumber: 5,
    parameter: "Reflective Evaluation",
    parameterNumber: 20,
    questionText: "I analyze mistakes to improve future performance.",
    options: DEFAULT_OPTIONS,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "Metacognition_test" });
    console.log("✅ Connected to MongoDB");

    // Drop existing questions
    const db = mongoose.connection.db!;
    const collections = await db.listCollections({ name: "questions" }).toArray();
    if (collections.length > 0) {
      await db.dropCollection("questions");
      console.log("🗑️  Dropped existing questions collection");
    }

    // Insert fresh questions
    await db.collection("questions").insertMany(questions);
    console.log(`✅ Seeded ${questions.length} questions successfully`);
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
