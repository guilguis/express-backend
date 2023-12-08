const socialsSchema = {
    facebook: {
        type: String,
      },
    twitter: {
        type: String,
    },
    instagram: {
        type: String,
    },
    whatsapp: {
        type: String,
    },
}

const locationSchema = {
    address: {
        type: String,
    },
    city: {
        type: String
    },
    gps: {
        lt: {
            type: String
        },
        lg: {
            type: String
        }
    },
}

module.exports = {
    socialsSchema,
    locationSchema
}