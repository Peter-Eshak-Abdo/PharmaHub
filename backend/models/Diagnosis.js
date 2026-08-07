const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Diagnosis name is required'],
            unique: true,
            trim: true,
        },
        icdCode: {
            type: String,
            required: [true, 'ICD code is required'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Diagnosis', diagnosisSchema);