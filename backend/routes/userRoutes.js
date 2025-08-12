const express = require("express")
const router = express.Router()

const { fetch_user } = require("../middlewares/fetch_user");
const { is_Admin } = require("../middlewares/is_Admin");
const { deleteUser, userProfile, updateUser, login, createUser, forgotPassword, resetPassword, getUsers, updateUserByAdmin } = require("../controllers/userController");
const { body } = require('express-validator');
const validateUserFields = [
    body('fullName')
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Full name must be between 3 and 50 characters'),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('isAdmin')
        .optional() // not required, but if provided:
        .isBoolean().withMessage('isAdmin must be true or false')
];
const validateLoginFields = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
const fs = require('fs');

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users/');
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.post('/signup', upload.single('profilePhoto'), validateUserFields, createUser);

router.post('/login', validateLoginFields, login);

router.delete('/:id',fetch_user, deleteUser);

router.get('/me', fetch_user, userProfile);
router.put(
  '/update',
  upload.single('profilePhoto'), // <--- handle photo upload
  body('fullName')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Full name must be between 3 and 50 characters'),
  fetch_user,
  updateUser
);
router.put('/updateUser/:id',fetch_user,is_Admin,updateUserByAdmin)


router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/',fetch_user, getUsers);


module.exports = router