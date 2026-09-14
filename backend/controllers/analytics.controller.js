import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const employerAnalytics = async (req, res, next) => {
  try {
    // only employers or admins
    const employerId = req.user.id;
    // count jobs
    const jobs = await Job.find({ employer: employerId });
    const jobIds = jobs.map(j => j._id);

    const totalJobs = jobs.length;
    const applicantsCount = await Application.countDocuments({ job: { $in: jobIds } });
    const hiresCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'hired' });

    // applicants per job
    const perJob = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    res.json({ totalJobs, applicantsCount, hiresCount, perJob });
  } catch (error) {
    next(error);
  }
};

export default { employerAnalytics };