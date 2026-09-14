import Company from "../models/Company.js";

export const listCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({ companies });
  } catch (error) {
    next(error);
  }
};

export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ company });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ company });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Only owner or admin can update
    const requesterId = req.user?.id?.toString ? req.user.id.toString() : String(req.user?.id);
    const ownerId = company.owner?.toString ? company.owner.toString() : String(company.owner);
    if (req.user.role !== 'admin' && ownerId !== requesterId) {
      return res.status(403).json({ message: 'Forbidden - not company owner' });
    }

    Object.assign(company, req.body);
    await company.save();
    res.json({ company });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const requesterId = req.user?.id?.toString ? req.user.id.toString() : String(req.user?.id);
    const ownerId = company.owner?.toString ? company.owner.toString() : String(company.owner);
    if (req.user.role !== 'admin' && ownerId !== requesterId) {
      return res.status(403).json({ message: 'Forbidden - not company owner' });
    }

    await company.deleteOne();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const verifyCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.verified = true;
    company.verifiedAt = new Date();
    await company.save();
    res.json({ company });
  } catch (error) {
    next(error);
  }
};

export default { listCompanies, getCompany, createCompany, updateCompany, deleteCompany, verifyCompany };
