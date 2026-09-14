import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';

export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      activeJobs,
      totalApplications,
      hiredApplications,
      totalCompanies,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'jobseeker' }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'hired' }),
      Company.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      activeJobs,
      totalApplications,
      hiredApplications,
      totalCompanies,
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const q = {};
    if (req.query.role) q.role = req.query.role;
    if (req.query.search) {
      const re = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [{ name: re }, { email: re }];
    }

    const [users, total] = await Promise.all([
      User.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password -refreshToken -resetPasswordToken'),
      User.countDocuments(q),
    ]);

    res.json({ users, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // admin can update isActive, role (but not to/from admin via UI for safety)
    const allowed = ['isActive', 'name', 'phone', 'location'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) user[key] = req.body[key];
    }
    // allow role change but guard against removing last admin
    if (req.body.role && ['jobseeker', 'employer', 'admin'].includes(req.body.role)) {
      if (user.role === 'admin' && req.body.role !== 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) return res.status(400).json({ message: 'Cannot remove the only admin' });
      }
      user.role = req.body.role;
    }

    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) return res.status(400).json({ message: 'Cannot delete the only admin' });
    }
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const listAllJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('employer', 'name email'),
      Job.countDocuments(),
    ]);
    res.json({ jobs, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export default { getStats, listUsers, updateUser, deleteUser, listAllJobs };
