import SavedJob from '../models/SavedJob.js';

export const listSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ user: req.user.id }).populate('job').sort({ createdAt: -1 });
    res.json({ saved });
  } catch (error) {
    next(error);
  }
};

export const createSavedJob = async (req, res, next) => {
  try {
    const { job } = req.body;
    if (!job) return res.status(400).json({ message: 'job id is required' });

    // avoid duplicates
    const exists = await SavedJob.findOne({ user: req.user.id, job });
    if (exists) return res.status(200).json({ message: 'Already saved', saved: exists });

    const saved = await SavedJob.create({ user: req.user.id, job });
    res.status(201).json({ saved });
  } catch (error) {
    next(error);
  }
};

export const removeSavedJob = async (req, res, next) => {
  try {
    const saved = await SavedJob.findOneAndDelete({ user: req.user.id, job: req.params.jobId });
    if (!saved) return res.status(404).json({ message: 'Saved job not found' });
    res.json({ message: 'Removed', saved });
  } catch (error) {
    next(error);
  }
};

export default { listSavedJobs, createSavedJob, removeSavedJob };