const _ = require('lodash')
const crypto = require('crypto')
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User: UserModel, userSchema } = require('../models/User');
const { transporter } = require('../email/config');
const authController = require('./authController');
const { persistLogin } = require('./authUtils');

const userController = {
    
    create: async(req, res) => {
        try {
            const user = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                picture: req.body.picture,
            }
            
            var existingUser = await UserModel.findOne({email: user.email})
            if(existingUser){
                return res.status(403).json({msg: 'Email already in use.'})
            }

            var newUser = await UserModel.create(user)
            newUser.setPassword(newUser.password)
            
            // Generate Verification Token and send email with token in the link.
            const token = newUser.generateEmailToken()
            const validationLink = `http://localhost:8000/validateEmail/${token}`
            const mailData = {
                from: process.env.EMAIL_USERNAME,  // sender address
                to: newUser.email,   // list of receivers
                subject: 'Email Confirmation',
                text: `Please  click the following link to confirm your email address: ${validationLink}`,
                html: `<b>Hey there ${newUser.fullName}! </b>
                       <br> Please  click the following link to confirm your email address: <br/>
                       <a href="${validationLink}"> Confirm Email </a>`,
            };
            
            transporter.sendMail(mailData, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
             });

            res.status(201).json({msg: 'user created.'})

        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    detail: async(req, res) => {
        try {
            const response = await UserModel.findById(req.params.id, ['-password', '-salt'])

            if(!response) {
                res.status(404).json({msg: "Não encontrado"})
                return
            }
            res.status(200).json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    list: async(req, res) => {
        const { limit, skip, sort } = req.query
        // get filters
        const filters = {
            // $and: [
            //     name ? { name: { $regex: name } } : {},
            //     description ? { description: { $regex: description } } : {},
            //     priceMin ? { price: { $gte: parseFloat(priceMin) } } : {},
            //     priceMax ? { price: { $lte: parseFloat(priceMax) } } : {},
            //     createdAtMin ? {createdAt : { $gte: createdAtMin } }: {},
            //     createdAtMax ? {createdAt : { $lte: createdAtMax } }: {},
            //     updatedAtMin ? {updatedAt : { $gte: updatedAtMin } }: {},
            //     updatedAtMax ? {updatedAt : { $lte: updatedAtMax } }: {}
            // ]
        }
        
        // get sorting
        var sortBy = {}
        if(sort){
            var desc = _.includes(sort, '-')
            var field = sort.replace('-', '')
            sortBy = { [field]: desc ? -1 : 1 }
        }

        // pagination
        const paginationOptions = {
            skip: parseInt(skip),
            limit: parseInt(limit)
        }
        
        // execute query
        try {
            const response = await UserModel.find(filters, {}, {...paginationOptions}).sort(sortBy)
            return res.json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    select: async(req, res) => {
         // execute query
        try {
            const response = await UserModel.find({}, 'name')
            return res.json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    update: async(req, res) => {
        try {
            if(req.file) {
                req.body.picture = req.file.path.replace(/\\/g, "/").replace(process.env.PROFILE_MEDIA_ROOT, '')
            }

            var user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {new:true}) //findByIdAndUpdate

            if(!user) {
                res.status(404).json({msg: "Não encontrado"})
                return
            }
            user = persistLogin(req, res, user)
            
            res.json({user, msg:'updated'})
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    delete: async(req, res) => {
        try {
            const response = await UserModel.findByIdAndDelete(req.params.id)
            
            if(!response) {
                res.status(404).json({msg: "Não encontrado"})
                return
            }
            res.status(204).json()
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

}

module.exports = userController