const express = require('express');
const { body, validationResult } = require('express-validator');
const ProjectMembers = require('../models/projectMembers');
const {  deleteTable, getAll, getById } = require('../controllers/handlerFactory');
const { fetch_user } = require('../middlewares/fetch_user');
const { sendNotification } = require('../utils/notify');

const router = express.Router();

const validateProjectMemberFields = [
  body("members").isArray({ min: 1 }).withMessage("Members must be an array"),
  body("members.*.userId").notEmpty().withMessage("User ID is required"),
  body("members.*.projectId").notEmpty().withMessage("Project ID is required")
];

router.post('/', validateProjectMemberFields, fetch_user, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const members = req.body.members;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Members array is required" });
    }

    const restoredMembers = [];
    const addedMembers = [];

    for (const member of members) {
      const existing = await ProjectMembers.findOne({
        where: { projectId: member.projectId, userId: member.userId },
        paranoid: false // include soft-deleted rows
      });

      if (existing) {
       if (existing.deletedAt) {
  await existing.restore(); // This automatically sets deletedAt = NULL
}

      } else {
        await ProjectMembers.create({
          ...member,
          addedBy: req.id
        });
        addedMembers.push(member.userId);
      }

      await sendNotification(req, "You Added Into Project", member.userId, member.projectId);
    }

    res.status(201).json({
      message: "Members processed successfully",
      restored: restoredMembers,
      added: addedMembers
    });

  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.use('/', fetch_user)
router.get('/', (req, res) => getAll(res, ProjectMembers));
router.get('/:id', (req, res) => getById(res, ProjectMembers, { id: req.params.id }));
router.delete('/:userId', (req, res) => {
  const whereCondition = {
    userId: req.params.userId,
    projectId: req.body.projectId
  };

  deleteTable(res, ProjectMembers, whereCondition);
});


module.exports = router;
