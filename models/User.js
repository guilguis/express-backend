const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const { Schema, model, Types } = require('mongoose');

const userSchema = new Schema({
    name: {
        first: {
            type: String,
            required: true  
        },
        last: {
            type: String
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true 
    },
    salt: {
        type: String,
    },
    phone: {
        type: String
    },
    picture: {
        type: String
    },
    parties: {
        type: [{
            type:Types.ObjectId,
            ref: 'Party'
        }]
    },
    company: {
        type: Types.ObjectId,
        ref: 'Company'
    },
    active: {
        type: Boolean,
        default: true
    },

    config: {
        twoFactor: {
            secret: {
                type: String,
                default:''
            },
            enabled: {
                type: Boolean,
                default: false
            },
            confirmed: {
                type: Boolean,
                default: false
            },
            qrCode: {
                type: String,
                default:''
            },
        },
        email: {
            verified: {
                type: Boolean,
                default: false
            },
            token: {
                type: String,
                default: ''
            },
        }
    }
}, {
    timestamps: true,
    virtuals: {
        fullName: {
            get() {
                return this.name.last ? this.name.first + ' ' + this.name.last : this.name.first
            },
        }
    },
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
    methods: {
        async setPassword(password) { 
            // Creating a unique salt
            this.salt = crypto.randomBytes(16).toString('hex'); 
            
            // Hashing user's salt and password 
            this.password = crypto.pbkdf2Sync(password, this.salt,  
            1000, 64, `sha512`).toString(`hex`); 

            await this.save()
        },
        validatePassword(password) { 
            var password = crypto.pbkdf2Sync(password,  
            this.salt, 1000, 64, `sha512`).toString(`hex`); 
            return this.password === password; 
        },
        async generateEmailToken() {
            const hash = crypto.randomBytes(16).toString('hex')
            this.config.email.token = hash
            await this.save()
            return jwt.sign({token: hash}, process.env.SECRET_KEY, { expiresIn: 600 })
        }
    }
});

const User = model('User', userSchema);

module.exports = {
    User,
    userSchema
}