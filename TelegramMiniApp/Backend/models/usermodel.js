const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  portfolios: {
    type: Array,
  },
});

module.exports = mongoose.model("User", userSchema);
