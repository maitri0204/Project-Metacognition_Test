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

const parentQuestions = [
  // Section 1: Metacognitive Awareness (Self-Knowledge) Q 1–10
  {
    questionNumber: 1,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Strengths",
    parameterNumber: 1,
    questionText: "My child knows which subjects or tasks they perform best in.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 2,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Strengths",
    parameterNumber: 1,
    questionText: "My child can clearly explain why they are good at certain types of learning tasks.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 3,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Weaknesses",
    parameterNumber: 2,
    questionText: "My child knows which subjects or skills they struggle with the most.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 4,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Learning Weaknesses",
    parameterNumber: 2,
    questionText: "My child actively tries to improve areas where their understanding is weak.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 5,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Knowledge of Learning Strategies",
    parameterNumber: 3,
    questionText: "My child knows several strategies that help them understand difficult topics.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 6,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Knowledge of Learning Strategies",
    parameterNumber: 3,
    questionText: "My child chooses different learning methods depending on the subject.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 7,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Understanding Task Requirements",
    parameterNumber: 4,
    questionText: "Before starting a task, my child tries to understand exactly what is required.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 8,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Understanding Task Requirements",
    parameterNumber: 4,
    questionText: "My child identifies the key steps needed to complete an assignment.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 9,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Cognitive Biases",
    parameterNumber: 5,
    questionText: "My child questions their assumptions before making decisions.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 10,
    domain: "Section 1: Awareness (Self-Knowledge)",
    domainNumber: 1,
    parameter: "Awareness of Cognitive Biases",
    parameterNumber: 5,
    questionText: "My child considers alternative viewpoints before forming conclusions.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },

  // Section 2: Metacognitive Planning Q 11–20
  {
    questionNumber: 11,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Goal Setting",
    parameterNumber: 6,
    questionText: "My child sets clear goals before starting a study or work task.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 12,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Goal Setting",
    parameterNumber: 6,
    questionText: "My child breaks large goals into smaller achievable steps.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 13,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Strategic Planning",
    parameterNumber: 7,
    questionText: "My child chooses strategies that match the difficulty of a task.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 14,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Strategic Planning",
    parameterNumber: 7,
    questionText: "My child thinks about different ways to approach a problem before starting.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 15,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Time Allocation",
    parameterNumber: 8,
    questionText: "My child estimates how much time they need to complete a task.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 16,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Time Allocation",
    parameterNumber: 8,
    questionText: "My child organizes their schedule to complete tasks on time.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 17,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Resource Identification",
    parameterNumber: 9,
    questionText: "My child identifies resources (books, videos, experts) that can help them learn.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 18,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Resource Identification",
    parameterNumber: 9,
    questionText: "My child actively seeks help when they need clarification.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 19,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Anticipating Challenges",
    parameterNumber: 10,
    questionText: "My child tries to predict problems that might occur while doing a task.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 20,
    domain: "Section 2: Planning",
    domainNumber: 2,
    parameter: "Anticipating Challenges",
    parameterNumber: 10,
    questionText: "My child prepares solutions in advance for potential difficulties.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },

  // Section 3: Metacognitive Monitoring Q 21–30
  {
    questionNumber: 21,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Self-Questioning",
    parameterNumber: 11,
    questionText: "My child asks themselves questions while learning to check understanding.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 22,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Self-Questioning",
    parameterNumber: 11,
    questionText: "My child pauses during study sessions to test their understanding.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 23,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Checking Understanding",
    parameterNumber: 12,
    questionText: "My child regularly checks whether they truly understand the material.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 24,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Checking Understanding",
    parameterNumber: 12,
    questionText: "My child explains concepts to themselves or others to confirm understanding.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 25,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Error Detection",
    parameterNumber: 13,
    questionText: "My child notices when they make mistakes while solving problems.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 26,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Error Detection",
    parameterNumber: 13,
    questionText: "My child reviews their work to detect errors.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 27,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Strategy Monitoring",
    parameterNumber: 14,
    questionText: "My child evaluates whether their study strategy is working.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 28,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Strategy Monitoring",
    parameterNumber: 14,
    questionText: "If a method is ineffective, my child looks for a better approach.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 29,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Attention Regulation",
    parameterNumber: 15,
    questionText: "My child recognizes when they lose focus during tasks.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 30,
    domain: "Section 3: Monitoring",
    domainNumber: 3,
    parameter: "Attention Regulation",
    parameterNumber: 15,
    questionText: "My child takes actions (breaks or adjustments) to regain concentration.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },

  // Section 4: Metacognitive Regulation Q 31–38
  {
    questionNumber: 31,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Strategy Adjustment",
    parameterNumber: 16,
    questionText: "My child changes their learning strategy if something is not working.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 32,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Strategy Adjustment",
    parameterNumber: 16,
    questionText: "My child experiments with new approaches to improve results.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 33,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Problem-Solving Flexibility",
    parameterNumber: 17,
    questionText: "My child tries different solutions if the first attempt fails.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 34,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Problem-Solving Flexibility",
    parameterNumber: 17,
    questionText: "My child approaches problems from multiple perspectives.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 35,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Emotional Regulation",
    parameterNumber: 18,
    questionText: "My child remains calm and focused when facing difficult tasks.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 36,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Emotional Regulation",
    parameterNumber: 18,
    questionText: "My child manages frustration when learning something challenging.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 37,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Persistence",
    parameterNumber: 19,
    questionText: "My child continues working even when tasks become difficult.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 38,
    domain: "Section 4: Regulation",
    domainNumber: 4,
    parameter: "Persistence",
    parameterNumber: 19,
    questionText: "My child stays motivated until they complete their goals.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },

  // Section 5: Metacognitive Reflection Q 39–40
  {
    questionNumber: 39,
    domain: "Section 5: Reflection",
    domainNumber: 5,
    parameter: "Reflective Evaluation",
    parameterNumber: 20,
    questionText: "After completing a task, my child thinks about what worked well.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
  {
    questionNumber: 40,
    domain: "Section 5: Reflection",
    domainNumber: 5,
    parameter: "Reflective Evaluation",
    parameterNumber: 20,
    questionText: "My child analyzes mistakes to improve future performance.",
    options: DEFAULT_OPTIONS,
    testType: "parent",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "Metacognition_test" });
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db!;

    // Remove only parent questions (keep student questions intact)
    await db.collection("questions").deleteMany({ testType: "parent" });
    console.log("🗑️  Removed existing parent questions");

    // Also ensure existing student questions have testType set
    await db.collection("questions").updateMany(
      { testType: { $exists: false } },
      { $set: { testType: "student" } }
    );
    console.log("✅ Ensured existing questions have testType='student'");

    // Drop the old unique index on questionNumber if it exists, then create compound index
    try {
      await db.collection("questions").dropIndex("questionNumber_1");
      console.log("🗑️  Dropped old questionNumber unique index");
    } catch {
      // Index might not exist, that's fine
    }

    // Create compound index before inserting
    await db.collection("questions").createIndex(
      { testType: 1, questionNumber: 1 },
      { unique: true }
    );
    console.log("✅ Created compound index on testType + questionNumber");

    await db.collection("questions").insertMany(parentQuestions);
    console.log(`✅ Seeded ${parentQuestions.length} parent questions successfully`);
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
