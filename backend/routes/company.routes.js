import express from "express";
import { listCompanies, getCompany, createCompany, updateCompany, deleteCompany } from "../controllers/company.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listCompanies);
router.get("/:id", getCompany);
router.post("/", protect, authorizeRoles("employer", "admin"), createCompany);
router.put("/:id", protect, authorizeRoles("employer", "admin"), updateCompany);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCompany);
// Admin verifies company profiles
router.post("/:id/verify", protect, authorizeRoles("admin"), async (req, res, next) => {
  try {
    // delegate to controller
    const { default: controller } = await import('../controllers/company.controller.js');
    return controller.verifyCompany(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;
