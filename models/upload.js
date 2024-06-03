const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
    link: {
        type: String,
    },
    filename: {
        type: String,
    }
})

const Uploads = mongoose.model("Uploads", uploadSchema);

module.exports = Uploads;