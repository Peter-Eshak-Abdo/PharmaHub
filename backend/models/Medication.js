const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Medication name is required'],
            unique: true,
            trim: true,
        },
        genericName: {
            type: String,
            default: null,
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Medication type is required'],
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Medication', medicationSchema);