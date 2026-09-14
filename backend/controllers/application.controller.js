import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const listApplications = async (req, res, next) => {
  try {
    // applicant's own applications
    const applications = await Application.find({ applicant: req.user.id }).sort({ createdAt: -1 }).populate('job');
    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

export const listApplicationsForJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    // ensure requester is employer of the job or admin
    const job = await (await import('../models/Job.js')).default.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (req.user.role !== 'admin' && job.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden - not job owner' });
    }
    const applications = await Application.find({ job: jobId }).sort({ createdAt: -1 }).populate('applicant');
    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

export const listApplicationsForEmployer = async (req, res, next) => {
  try {
    const Job = (await import('../models/Job.js')).default;
    const jobs = await Job.find({ employer: req.user.id }).select('_id title company');
    const jobIds = jobs.map((job) => job._id);
    if (jobIds.length === 0) {
      return res.json({ applications: [] });
    }

    const applications = await Application.find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .populate('applicant job');

    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

export const listInterviewsForEmployer = async (req, res, next) => {
  try {
    // find applications where the job belongs to the employer and interview is set
    const Job = (await import('../models/Job.js')).default;
    const jobs = await Job.find({ employer: req.user.id }).select('_id');
    const jobIds = jobs.map(j => j._id);
    const interviews = await Application.find({ job: { $in: jobIds }, 'interview.date': { $exists: true } }).sort({ 'interview.date': 1 }).populate('applicant job');
    res.json({ interviews });
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job applicant');
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    // only applicant, employer of job, or admin can view
    const job = application.job;
    const isOwner = job && job.employer && job.employer.toString() === req.user.id.toString();
    if (req.user.id.toString() !== application.applicant.toString() && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ application });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const { job } = req.body;
    if (!job) {
      return res.status(400).json({ message: 'Job ID is required to apply' });
    }

    const existing = await Application.findOne({ job, applicant: req.user.id });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({ ...req.body, applicant: req.user.id });
    res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
};

export const scheduleInterview = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const { date, location, mode = 'online', notes, status = 'interview' } = req.body;

    if (!date) return res.status(400).json({ message: 'Interview date is required' });
    const interviewDate = new Date(date);
    if (Number.isNaN(interviewDate.getTime())) return res.status(400).json({ message: 'Invalid date format' });

    const application = await Application.findById(applicationId).populate('applicant');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const Job = (await import('../models/Job.js')).default;
    const job = await Job.findById(application.job);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // only employer who owns the job or admin can schedule
    if (req.user.role !== 'admin' && job.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden - not job owner' });
    }

    // set interview info
    application.interview = {
      date: interviewDate,
      location: location || '',
      mode: mode || 'online',
      notes: notes || '',
      invitedBy: req.user.id,
      createdAt: new Date(),
    };

    // update status
    application.status = status;
    await application.save();

    // create notification for applicant
    try {
      const applicant = application.applicant;
      const title = 'Interview scheduled';
      const message = `Your application for ${job.title || 'a role'} has an interview scheduled on ${interviewDate.toUTCString()}.`;
      await Notification.create({ recipient: applicant._id, type: 'info', title, message, metadata: { application: application._id, job: job._id } });

      // send email if configured
      const sendEmail = (await import('../utils/sendEmail.js')).default;
      if (applicant.email) {
        (async () => {
          try {
            await sendEmail({
              to: applicant.email,
              subject: `Interview scheduled — ${job.title || 'Job'}`,
              html: `<p>Hello ${applicant.name || ''},</p><p>${message}</p><p>Details: Mode: ${mode}, Location: ${location || 'N/A'}</p><p>Notes: ${notes || 'N/A'}</p>`
            });
          } catch (e) {
            console.error('Failed to send interview email:', e.message || e);
          }
        })();
      }

    } catch (e) {
      console.error('Failed to create/send notification for interview:', e.message || e);
    }

    res.json({ application });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Only applicant can update their own cover letter/resume, and employer/admin can change status
    const isApplicant = application.applicant.toString() === req.user.id.toString();
    const Job = (await import('../models/Job.js')).default;
    const job = await Job.findById(application.job);
    const isOwner = job && job.employer && job.employer.toString() === req.user.id.toString();

    // If updating status, ensure only owner or admin can do it
    if (req.body.status && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - cannot change status' });
    }

    // Applicant can update allowed fields
    if (isApplicant) {
      const allowed = ['coverLetter', 'resumeUrl'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) application[key] = req.body[key];
      }
      await application.save();
      return res.json({ application });
    }

    // Owner/admin updating status or metadata
    if (isOwner || req.user.role === 'admin') {
      const prevStatus = application.status;
      if (req.body.status) application.status = req.body.status;
      if (req.body.metadata) application.metadata = req.body.metadata;
      await application.save();

      // if status changed, notify applicant
      try {
        if (req.body.status && req.body.status !== prevStatus) {
          const applicantUser = await User.findById(application.applicant);
          if (applicantUser) {
            const title = 'Application status updated';
            const message = `Your application for ${ (await import('../models/Job.js')).default.findById(application.job).then(j=> j?.title || 'a role') } has been updated to '${application.status}'.`;
            await Notification.create({ recipient: applicantUser._id, type: 'info', title, message, metadata: { application: application._id, job: application.job } });
          }
        }
      } catch (e) {
        console.error('Failed to create application status notification:', e.message || e);
      }

      return res.json({ application });
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job applicant');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role !== 'admin' && application.applicant.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden - only applicant can withdraw' });
    }

    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
    await application.save();

    try {
      const job = application.job;
      if (job) {
        await Notification.create({
          recipient: job.employer,
          type: 'info',
          title: 'Application withdrawn',
          message: `${application.applicant.name || 'A candidate'} has withdrawn their application for ${job.title || 'your job'}.`,
          metadata: { application: application._id, job: job._id },
        });
      }
    } catch (e) {
      console.error('Failed to create withdrawal notification:', e.message || e);
    }

    res.json({ application });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStats = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const Job = (await import('../models/Job.js')).default;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (req.user.role !== 'admin' && job.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden - not job owner' });
    }

    const applications = await Application.find({ job: jobId }).select('status');
    const stats = applications.reduce((acc, application) => {
      acc[application.status] = (acc[application.status] || 0) + 1;
      return acc;
    }, {});

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

export default { listApplications, listApplicationsForJob, listInterviewsForEmployer, getApplication, createApplication, scheduleInterview, updateApplication, withdrawApplication, getApplicationStats };
