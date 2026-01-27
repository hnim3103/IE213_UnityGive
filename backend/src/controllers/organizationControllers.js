import Organization from "../models/Organization.js";

export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.status(200).json(organizations);
  } catch (error) {
    console.error("Failed to execute getAllOrganizations", error);
    res.status(500).json({message: "An internal error occurred"});
  }
}

export const createOrganization = async (req, res) => {
  try {
    const organization = new Organization(req.body);

    const newOrganization = await organization.save();
    res.status(201).json(newOrganization);
  } catch (error) {
    console.error("Failed to execute createOrganization", error);
    res.status(500).json({message: "An internal error occurred"});
  }
};

export const updateOrganization = (req, res) => {
  res.status(200).json({message: "Organization updated successfully"});
};

export const deleteOrganization = (req, res) => {
  res.status(200).json({message: "Organization deleted successfully"});
};