import express from "express";
import { 
  createTransaction, 
  deleteTransaction, 
  getSummaryByUserId, 
  getTransactionsByUserId,
  getWeeklySummaryByUserId,
  getMonthlySummaryByUserId
} from "../controllers/transactionsController.js";

const router = express.Router();

router.post("/", createTransaction);


router.get("/summary/:userId", getSummaryByUserId);
router.get("/:userId/summary/weekly", getWeeklySummaryByUserId);
router.get("/:userId/summary/monthly", getMonthlySummaryByUserId);


router.get("/:userId", getTransactionsByUserId);

router.delete("/:id", deleteTransaction);

export default router;