var jwt = require('jsonwebtoken');
const { sequelize } = require("../db_connect")

const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const { where } = require("sequelize");
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/email');
const { getAll } = require('./handlerFactory');
const fs = require("fs");
const path = require("path");

// After creating the user



exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll(
    //   {
    //   attributes: ['fullName', 'isAdmin','id'] // Only fetch these two columns
    // }
  );

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};



exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { fullName, email, password, isAdmin } = req.body;

    // ✅ Handle uploaded file
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = req.file.path.replace(/\\/g, "/"); // normalize Windows paths
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const encPass = await bcrypt.hash(password, salt);

    // ✅ Create user with image path
    const user = await User.create({
      fullName,
      email,
      password: encPass,
      isAdmin,
      profilePhoto: profilePhotoPath, // save path in DB
    });

    const userInfo = {
      id: user.id,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(userInfo, "tarun", { expiresIn: "1h" });

    // ✅ Send welcome email
    await sendEmail(user.email, "create", {
      name: user.fullName,
      email: user.email,
      password, // be careful about sending plain passwords
    });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePhoto: profilePhotoPath,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const userId = req.id;
  let { fullName, email, password, isAdmin } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Build update payload dynamically
    const updateData = {};

    if (fullName && fullName !== user.fullName) updateData.fullName = fullName;

    if (email && email !== user.email) {
      // Check if email is already used by another user
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
      updateData.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (typeof isAdmin !== "undefined" && isAdmin !== user.isAdmin) {
      updateData.isAdmin = isAdmin;
    }

    // ✅ Handle profile image upload
    if (req.file) {
      if (user.profilePhoto && fs.existsSync(user.profilePhoto)) {
        fs.unlinkSync(user.profilePhoto);
      }
      updateData.profilePhoto = req.file.path.replace(/\\/g, "/");
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ status: "success", message: "No changes made" });
    }

    await user.update(updateData);

    res.status(200).json({
      status: "success",
      updatedUser: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};


exports.updateUserByAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
const id = req.params.id
  const userId = id;
  let { fullName, email, password, isAdmin } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Build update payload dynamically
    const updateData = {};

    if (fullName && fullName !== user.fullName) updateData.fullName = fullName;

    if (email && email !== user.email) {
      // Check if email is already used by another user
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
      updateData.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (typeof isAdmin !== "undefined" && isAdmin !== user.isAdmin) {
      updateData.isAdmin = isAdmin;
    }

    // ✅ Handle profile image upload
    if (req.file) {
      if (user.profilePhoto && fs.existsSync(user.profilePhoto)) {
        fs.unlinkSync(user.profilePhoto);
      }
      updateData.profilePhoto = req.file.path.replace(/\\/g, "/");
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ status: "success", message: "No changes made" });
    }

    await user.update(updateData);

    res.status(200).json({
      status: "success",
      updatedUser: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};




exports.userProfile = async (req, res) => {
    const id = req.id

    const user = await User.findOne({ where: { id: id } })

    res.status(200).json({ status: "Success", User: user })


}
exports.login = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const checkUser = await User.findOne({ where: { email: email } })


    const passwordCompare = await bcrypt.compare(password, checkUser.password);


    if (!passwordCompare) {
        return res.status(400).json({ message: "Fail", error: "Incorrect credentials" });
    }

    if (!checkUser) {
        return res.status(500).json("Could Not Found User")
    }
    const userInfo = {
        id: checkUser.id,
        isAdmin: checkUser.isAdmin
    }
    console.log(userInfo)
    const token = jwt.sign(userInfo, 'tarun', { expiresIn: '1h' })  // (id , jwt_secret)
    res.json({
        token: token
    })


}


exports.deleteUser = async (req, res) => {
    const id = req.params.id

    if (!id) {
        res.status(500).json("User ID Needed To Delete")
    }

    const deleteUser = await User.destroy({ where: { id: id },force: true })
    console.log(deleteUser)
    if (!deleteUser) {
        res.status(500).json("User Remove Failed")
    }

    res.status(200).json({ status: "success", message: "User Is Removed" })


}
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "No user found with this email." });

    const resetToken = jwt.sign({ id: user.id }, 'tarun', { expiresIn: '15m' });

    // Optional: store resetToken and expiry in DB
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail(user.email, 'reset', {
        name: user.fullName,
        password: resetToken // for email template — avoid if using link
    });

    res.json({ message: "Reset link sent to your email." });
};
exports.resetPassword = async (req, res) => {
    const { newPassword } = req.body;
    const token = req.params.token;

    try {
        const decoded = jwt.verify(token, 'tarun');
        const user = await User.findByPk(decoded.id);

        // Optional: validate token and expiry
        // if (user.resetToken !== token || Date.now() > user.resetTokenExpires)
        //   return res.status(400).json({ message: "Invalid or expired token." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.json({ message: "Password reset successful." });
    } catch (err) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};