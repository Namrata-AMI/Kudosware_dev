const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    name: String,
    email: String,
    resumeUrl: String,
    skills: [String],
    experience: String,
    preferences: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Employee", employeeSchema);
