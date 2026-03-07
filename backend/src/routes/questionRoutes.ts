import { Router } from "express";
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from "../controllers/questionController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";

const router = Router();

// All routes require authentication + ADMIN role
router.use(authenticate, authorize(USER_ROLE.ADMIN));

router.get("/", getQuestions);
router.post("/", addQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
