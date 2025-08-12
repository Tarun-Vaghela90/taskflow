// Controller
const { ProjectMembers } = require('../models/');

exports.addMultipleMembers = async (req, res) => {
  try {
    const { projectId, userIds } = req.body; // userIds = array of user IDs

    if (!projectId || !userIds || !userIds.length) {
      return res.status(400).json({ message: "Project ID and at least one user ID are required" });
    }

    // Prepare data for bulk insert
    const membersData = userIds.map(userId => ({
      projectId,
      userId
    }));

    // Bulk insert
    await ProjectMembers.bulkCreate(membersData, { ignoreDuplicates: true });

    res.status(201).json({ message: "Members added successfully" });
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
