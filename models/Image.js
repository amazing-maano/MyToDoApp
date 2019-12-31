const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: {type: String},
    path: {type: String},
    originalname: {type: String},
    mimetype: {type: String},
    size: { type: Number},
    user: {
        type: String,
        required: true
      },
    created_at: {type: Date, default: Date.now()}
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
