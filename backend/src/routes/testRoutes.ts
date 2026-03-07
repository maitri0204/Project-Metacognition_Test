import { Router } from "express";
import {
  getTestQuestions,
  submitTest,
  getResult,
  getMyResults,
} from "../controllers/testController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";

const router = Router();

router.use(authenticate);

// Student routes
router.get("/questions", authorize(USER_ROLE.STUDENT), getTestQuestions);
router.post("/submit", authorize(USER_ROLE.STUDENT), submitTest);
router.get("/my-results", authorize(USER_ROLE.STUDENT), getMyResults);

// Shared: student sees own, admin sees any
router.get("/results/:id", getResult);

export default router;
