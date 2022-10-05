const mongoose = require("mongoose");

const User = new mongoose.Schema({
	username: { type: String },
	log: { type: [{ description: String, duration: Number, date: Date }], default: [] },
});

module.exports = mongoose.model("User", User);
