import { Router } from "express";
import {
  getParentTestQuestions,
  submitParentTest,
  getMyParentResults,
  getParentResult,
  getAllParentResults,
  getParentResultsByStudent,
} from "../controllers/parentTestController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";

const router = Router();

router.use(authenticate);

// Student routes
router.get("/questions", authorize(USER_ROLE.STUDENT), getParentTestQuestions);
router.post("/submit", authorize(USER_ROLE.STUDENT), submitParentTest);
router.get("/my-results", authorize(USER_ROLE.STUDENT), getMyParentResults);

// Shared: student sees own, admin sees any
router.get("/results/:id", getParentResult);

// Admin-only
router.get("/admin/results", authorize(USER_ROLE.ADMIN), getAllParentResults);
router.get("/student/:studentId", authorize(USER_ROLE.ADMIN), getParentResultsByStudent);

export default router;
