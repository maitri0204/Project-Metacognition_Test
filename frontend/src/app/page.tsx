"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  BookOpen,
  Target,
  Eye,
  MessageSquare,
  Lightbulb,
  Shield,
  TrendingUp,
  CheckCircle2,
  Zap,
  Users,
  GraduationCap,
  BarChart3,
  AlertTriangle,
  HelpCircle,
  Puzzle,
  HeartHandshake,
  School,
  ArrowRight,
} from "lucide-react";

/* ── Animation Variants ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

/* ── Data Arrays ── */
const painPointsStudents = [
  { icon: BookOpen, text: "Memorize without understanding" },
  { icon: MessageSquare, text: "Struggle to express answers clearly" },
  { icon: AlertTriangle, text: "Feel exam pressure and anxiety" },
  { icon: HelpCircle, text: "Do not know how to study effectively" },
];

const painPointsParents = [
  { icon: Eye, text: "Cannot understand their child's learning style" },
  { icon: BarChart3, text: "See inconsistent academic performance" },
  { icon: HeartHandshake, text: "Want to help but don't know how" },
];

const whatTestMeasures = [
  {
    icon: Brain,
    title: "Thinking Awareness",
    desc: "How students understand a question and decide how to solve it.",
  },
  {
    icon: Target,
    title: "Learning Strategy",
    desc: "How students plan and organize the way they study.",
  },
  {
    icon: Eye,
    title: "Self-Monitoring",
    desc: "How students notice whether they understand a topic or need to learn more.",
  },
  {
    icon: MessageSquare,
    title: "Expression & Reflection",
    desc: "How clearly students communicate ideas and reflect on their learning.",
  },
];

const whyMatters = [
  "Critical thinking ability",
  "Problem solving skills",
  "Clear communication style",
  "Self-awareness in learning",
  "Confidence in expression",
];

const benefitsStudents = [
  "Better understanding of how they learn",
  "Stronger critical thinking skills",
  "Improved problem-solving ability",
  "Greater confidence in expressing ideas",
  "Better study strategies",
  "Reduced exam anxiety",
];

const benefitsParents = [
  { title: "Thinking patterns", icon: Brain },
  { title: "Learning habits", icon: BookOpen },
  { title: "Cognitive strengths", icon: Lightbulb },
  { title: "Areas needing support", icon: Target },
];

const idealFor = [
  {
    icon: GraduationCap,
    title: "School Students",
    desc: "Grades 5 – 12",
  },
  {
    icon: TrendingUp,
    title: "Competitive Learners",
    desc: "Students preparing for competitive learning environments",
  },
  {
    icon: Users,
    title: "Parents",
    desc: "Who want deeper insights into their child's learning style",
  },
  {
    icon: School,
    title: "Schools",
    desc: "That want to promote thinking-based education",
  },
];

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(u.role || "");
      } catch {
        // ignore
      }
    }
    setChecking(false);
  }, []);

  const goToDashboard = () => {
    if (userRole === "ADMIN") router.push("/admin/dashboard");
    else router.push("/student/dashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* ─────────────────── HERO ─────────────────── */}
      <section className="relative pt-28 pb-24 px-6 bg-gradient-to-b from-[#d0e5f5] to-[#e8f3fa] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {/* <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/70 border border-blue-200 rounded-full text-sm text-blue-700 font-medium mb-6">
              <Brain className="w-4 h-4" />
              Thinking &amp; Expression Skills Test
            </motion.div> */}

            <motion.h1
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-black text-[#0e5080] leading-[1.1] mb-6"
            >
              Every Child Thinks Differently.{" "}
              <span className="text-[#0876b8]">
                Discover the Beautiful Way Your Child&apos;s Mind Works.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed"
            >
              A powerful <span className="font-bold text-[#0e5080]">Metacognitive Assessment</span> designed to develop confident thinkers and independent learners.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <button
                  onClick={goToDashboard}
                  className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#0876b8] to-[#2083bf] hover:from-[#065f94] hover:to-[#1a6f9f] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 btn-glow"
                >
                  Go to Dashboard →
                </button>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#0876b8] to-[#2083bf] hover:from-[#065f94] hover:to-[#1a6f9f] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 btn-glow flex items-center gap-2"
                  >
                    Take the Test <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 text-base font-semibold text-[#0e5080] bg-white border-2 border-[#0876b8]/30 hover:border-[#0876b8] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right side illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 hidden lg:flex items-center justify-center"
          >
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-[#0876b8]/20 to-[#2083bf]/10 rounded-full flex items-center justify-center">
                <Brain className="w-40 h-40 text-[#0876b8]/60" strokeWidth={1} />
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce-slow">
                <Lightbulb className="w-10 h-10 text-amber-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float">
                <Puzzle className="w-10 h-10 text-[#0876b8]" />
              </div>
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                <MessageSquare className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── PROBLEM — STRUGGLING ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
            Is Your Child Studying Hard…{" "}
            <span className="text-[#0876b8]">But Still Struggling?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Many students spend long hours studying, but parents often still notice problems like:
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {[
            "The child finds it hard to explain answers clearly",
            "They memorize lessons without really understanding them",
            "They feel scared or stressed during exams",
            "They lack confidence in their thinking and problem-solving",
            "They are not sure how to study in the right way",
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="flex items-start gap-4 p-5 rounded-2xl bg-red-50/60 border border-red-100"
            >
              <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 shrink-0" />
              <p className="text-slate-700 text-lg">{item}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-12 text-center"
        >
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Most traditional exams only check what students <span className="font-bold">remember</span>, not how well they <span className="font-bold text-[#0876b8]">understand</span> or <span className="font-bold text-[#0876b8]">think</span>.
            But real learning depends on something deeper:{" "}
            <span className="font-black text-[#0e5080]">How students think.</span>
          </p>
        </motion.div>
      </section>

      {/* ─────────────────── WHY STUDENTS STRUGGLE ─────────────────── */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
              Why Students <span className="text-[#0876b8]">Struggle</span> Today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-slate-500">
              Many students study hard… but still struggle
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Students Pain Points */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#6aacd4] to-[#2083bf] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <GraduationCap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-6">Students</h3>
              <ul className="space-y-4">
                {painPointsStudents.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#0876b8]" />
                      </div>
                      <span className="text-slate-700 text-lg pt-1">{p.text}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Parents Pain Points */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#6aacd4] to-[#2083bf] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-6">Parents</h3>
              <ul className="space-y-4">
                {painPointsParents.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#0876b8]" />
                      </div>
                      <span className="text-slate-700 text-lg pt-1">{p.text}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────── WHAT IS THE TEST ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
            What is the <span className="text-[#0876b8]">Thinking &amp; Expression Test?</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left – description */}
          <div>
            <motion.div variants={fadeInUp}>
              <p className="text-xl text-slate-600 leading-relaxed mb-6">
                The <span className="font-bold text-[#0e5080]">Thinking &amp; Expression Test</span> is a unique assessment designed to evaluate how students <span className="font-bold text-[#0876b8]">think, learn, reflect, and express</span> their ideas.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                It is based on the concept of <span className="font-bold text-[#0876b8]">metacognition</span> — the ability to understand and improve one&apos;s own thinking process.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 pl-4 border-l-4 border-[#6aacd4]">
                Instead of testing memory alone, this assessment helps students discover how they approach problems, understand concepts, monitor their learning, and express their ideas. This creates <span className="font-bold text-[#0876b8]">strong thinkers</span>, not just good test-takers.
              </p>
            </motion.div>
          </div>

          {/* Right – Stacked cards */}
          <div className="relative h-[450px]">
            {[
              { icon: Brain, title: "Think", desc: "Understand how you approach problems" },
              { icon: BookOpen, title: "Learn", desc: "Discover your unique learning patterns" },
              { icon: MessageSquare, title: "Express", desc: "Communicate ideas with confidence" },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className={`absolute w-72 bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl hover:z-50 transition-all`}
                  style={{ top: `${i * 130}px`, right: `${i * 48}px`, zIndex: 30 - i * 10 }}
                >
                  <Icon className="text-[#0876b8] mb-3" size={28} />
                  <h4 className="font-bold text-lg mb-2">{card.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ─────────────────── WHY THIS TEST MATTERS ─────────────────── */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
              Why This Test <span className="text-[#0876b8]">Matters</span> Today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-slate-500 max-w-3xl mx-auto">
              In today&apos;s world, students need more than subject knowledge. They need to develop:
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto"
          >
            {whyMatters.map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="bg-white p-6 rounded-[2rem] text-center shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#6aacd4] to-[#2083bf] flex items-center justify-center shadow-lg mb-4">
                  <CheckCircle2 className="text-white" size={24} />
                </div>
                <p className="font-semibold text-slate-800">{item}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            However, most traditional exams do not measure these skills.{" "}
            <span className="font-bold text-[#0e5080]">The Thinking &amp; Expression Test bridges this gap.</span>
          </motion.p>
        </div>
      </section>

      {/* ─────────────────── WHAT THE TEST MEASURES ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
            What the Test <span className="text-[#0876b8]">Measures</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-500">
            The assessment evaluates four essential thinking abilities
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {whatTestMeasures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={scaleIn}
                className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 text-center hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#6aacd4] to-[#2083bf] flex items-center justify-center shadow-xl mb-6">
                  <Icon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-12 text-lg text-slate-600 font-medium"
        >
          Together, these skills build strong <span className="text-[#0876b8] font-bold">academic and life success</span>.
        </motion.p>
      </section>

      {/* ─────────────────── WHAT MAKES THIS TEST DIFFERENT ─────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0876b8] to-[#0e5080] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-black mb-8">
              What Makes This Test <span className="text-blue-200">Different?</span>
            </motion.h2>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-[2rem] p-8 border border-white/20">
                <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Most exams ask</p>
                <p className="text-2xl font-black">&ldquo;What is the answer?&rdquo;</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-[2rem] p-8 border border-white/30 shadow-xl">
                <p className="text-blue-200 text-sm uppercase tracking-wide mb-2">This test asks</p>
                <p className="text-2xl font-black">&ldquo;How did you think about the answer?&rdquo;</p>
              </div>
            </motion.div>

            <motion.p variants={fadeInUp} className="mt-10 text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              This shift helps students develop deeper learning abilities that last a lifetime.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── BENEFITS — STUDENTS ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
            Benefits for <span className="text-[#0876b8]">Students</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-500">
            Students who take the test gain
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {benefitsStudents.map((b, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <p className="text-slate-700 font-medium">{b}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────────── BENEFITS — PARENTS ─────────────────── */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
              Benefits for <span className="text-[#0876b8]">Parents</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-slate-500">
              Parents receive clear insights into their child&apos;s
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {benefitsParents.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm border border-slate-100 hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#6aacd4] to-[#2083bf] flex items-center justify-center shadow-xl mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-bold">{b.title}</h3>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            This helps parents guide their children more effectively and confidently.
          </motion.p>
        </div>
      </section>

      {/* ─────────────────── IDEAL FOR ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
            Ideal <span className="text-[#0876b8]">For</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {idealFor.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={scaleIn}
                className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 text-center hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#6aacd4] to-[#2083bf] flex items-center justify-center shadow-xl mb-6">
                  <Icon className="text-white" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─────────────────── CTA ─────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="bg-gradient-to-r from-[#0876b8] to-[#2083bf] rounded-[3rem] p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black mb-8">
                Help Your Child Become a<br />
                <span className="text-blue-200">Confident Thinker</span>
              </h2>
              <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto">
                Discover how your child thinks, learns, and expresses ideas. Start the Thinking &amp; Expression Test today.
              </p>

              {isLoggedIn ? (
                <button
                  onClick={goToDashboard}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0876b8] font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard <ArrowRight size={20} />
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0876b8] font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Take the Test <ArrowRight size={20} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-10 py-4 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="bg-gray-900 text-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0876b8] to-[#2083bf] rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">TEST — Thinking &amp; Expression Skills Test</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Thinking &amp; Expression Skills Test. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
