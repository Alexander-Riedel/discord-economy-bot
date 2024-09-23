const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userId: { type: String, require: true, unique: true },
    serverId: { type: String, require: true },
    balance: { type: Number, default: 0 },
    dailyLastUsed: { type: Number, default: 0 },
    workLastUsed: { type: Number, default: 0 },
    claimed: { type: Boolean, default: false },
    atWork: { type: Boolean, default: false },
});

const model = mongoose.model("g4m3-economy", profileSchema);

module.exports = model;