export const getAllCampaigns = (req, res) => {
  res.status(200).send("Get campaigns");
}

export const createCampaign = (req, res) => {
  res.status(201).json({message: "New campaign added successfully"});
}

export const updateCampaign = (req, res) => {
  res.status(200).json({message: "Campaign updated successfully"});
}

export const deleteCampaign = (req, res) => {
  res.status(200).json({message: "Campaign deleted successfully"});
}