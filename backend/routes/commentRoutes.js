const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment  = require('../models/commentModel');
const { insertTable, updateTable, deleteTable, getAll, getById } = require('../controllers/handlerFactory');
const { fetch_user } = require('../middlewares/fetch_user');

const router = express.Router();

const validateCommentFields = [
  body('comment').notEmpty().withMessage('Comment is required'),
  body('TaskId').notEmpty().withMessage('TaskId is required'),
  body('projectId').isInt().withMessage('ProjectId is required')
];
router.use('/',fetch_user)
router.post('/', validateCommentFields, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const commentData = {
    ...req.body,
    userId:req.id
  }
  insertTable(res, Comment, commentData);
});

router.get('/', (req, res) => getAll(res, Comment));
// router.get('/:id', (req, res) => getById(res, Comment, { id: req.params.id }));
router.get("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { taskId }
     
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.put('/:id', validateCommentFields, async (req, res) => updateTable(res, Comment, req.body, { id: req.params.id }));
router.delete('/:id', (req, res) => deleteTable(res, Comment, { id: req.params.id }));

module.exports = router;
