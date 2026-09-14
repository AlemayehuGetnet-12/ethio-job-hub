import express from "express";
import { listApplications, listApplicationsForJob, listApplicationsForEmployer, listInterviewsForEmployer, getApplication, createApplication, scheduleInterview, updateApplication, withdrawApplication, getApplicationStats } from "../controllers/application.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// applicant's own applications
router.get("/", protect, listApplications);
router.get("/:id", protect, getApplication);
router.post("/", protect, createApplication);
router.put("/:id", protect, updateApplication);
router.delete("/:id", protect, withdrawApplication);

// employer: list applications for a job
router.get('/job/:jobId', protect, authorizeRoles('employer','admin'), listApplicationsForJob);
router.get('/job/:jobId/stats', protect, authorizeRoles('employer','admin'), getApplicationStats);
router.get('/employer', protect, authorizeRoles('employer','admin'), listApplicationsForEmployer);

// employer: schedule an interview for an application
router.post('/:id/interview', protect, authorizeRoles('employer','admin'), scheduleInterview);
// employer: list interviews across employer's jobs
router.get('/interviews', protect, authorizeRoles('employer','admin'), listInterviewsForEmployer);

export default router;
