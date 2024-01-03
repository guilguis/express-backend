const { Schema, model, Types } = require('mongoose');
const { locationSchema, socialsSchema } = require('./CoreSchemas');

const companySchema = new Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    phone: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:false
    },
    categories: {
        type: [{
            type:Types.ObjectId,
            ref: 'Category'
        }]
    },
    socials: socialsSchema,
    location: locationSchema,
    website: {
        type: String,
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

const Company = model('Company', companySchema);

module.exports = {
    Company,
    companySchema
}