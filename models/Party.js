const { Schema, model, Types } = require('mongoose');
const { userSchema } = require('./User');


const partySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type:Types.ObjectId,
        ref: 'User',
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    services: {
        type: [{
            type:Types.ObjectId,
            ref: 'Service'
        }]
    },
},{
    timestamps: true,
});

const Party = model('Party', partySchema);

module.exports = {
    Party,
    partySchema
}
