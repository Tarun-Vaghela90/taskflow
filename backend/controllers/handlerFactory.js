const { where,create } = require('sequelize');

// ✅ Insert new record
exports.insertTable = async (res, model, data) => {
  try {
    const record = await model.create(data);
    res.json({
      status: "success",
      data: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};

// ✅ Update existing record
exports.updateTable = async (res, model, data, whereCondition) => {
  try {
    const [affectedRows] = await model.update(data, { where: whereCondition });

    if (affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "No rows updated" });
    }

    // Now fetch the updated record
    const updatedData = await model.findOne({ where: whereCondition });

    res.json({
      status: "success",
      updatedRows: affectedRows,
      updatedData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};


// ✅ Delete record(s)
exports.deleteTable = async (res, model, whereCondition) => {
  try {
    const result = await model.destroy({ where: whereCondition });
    res.json({
      status: "success",
      deletedRows: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};

// ✅ Get all records
exports.getAll = async (res, model, include = []) => {
  try {
    const records = await model.findAll({ include });
    res.json({
      status: "success",
      data: records
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};

// ✅ Get one record by ID or condition
exports.getById = async (res, model, whereCondition, include = []) => {
  try {
    const record = await model.findOne({ where: whereCondition, include });
    if (!record) {
      return res.status(404).json({ status: "error", error: "Record not found" });
    }
    res.json({
      status: "success",
      data: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};
