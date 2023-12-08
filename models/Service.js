const { Schema, model, Types } = require('mongoose');

const serviceSchema = new Schema({
    name: {
        type: String,
        required:true,
    },
    description: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    image: {
        type: String,
    },
    company: {
        type: Types.ObjectId,
        ref: 'Company',
        required: true
    },
},{
    timestamps: true
});

const Service = model('Service', serviceSchema);

module.exports = {
    Service,
    serviceSchema
}