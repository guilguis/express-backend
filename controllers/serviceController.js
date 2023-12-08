const { Service: ServiceModel } = require("../models/Service");
const _ = require('lodash')

const serviceController = {

    create: async(req, res) => {
        try {
            const service = {
                name: req.body.name,
                description:req.body.description,
                price:req.body.price,
                image:req.body.image
            }

            const response = await ServiceModel.create(service)
            res.status(201).json({response, msg: 'Service created.'})

        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    detail: async(req, res) => {
        try {
            const response = await ServiceModel.findById(req.params.id)

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
        const { name, description, priceMin, priceMax, createdAtMin, createdAtMax, updatedAtMin, updatedAtMax, limit, skip, sort } = req.query
        // get filters
        const filters = {
            $and: [
                name ? { name: { $regex: name } } : {},
                description ? { description: { $regex: description } } : {},
                priceMin ? { price: { $gte: parseFloat(priceMin) } } : {},
                priceMax ? { price: { $lte: parseFloat(priceMax) } } : {},
                createdAtMin ? {createdAt : { $gte: createdAtMin } }: {},
                createdAtMax ? {createdAt : { $lte: createdAtMax } }: {},
                updatedAtMin ? {updatedAt : { $gte: updatedAtMin } }: {},
                updatedAtMax ? {updatedAt : { $lte: updatedAtMax } }: {}
            ]
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
            const response = await ServiceModel.find(filters, {}, {...paginationOptions}).sort(sortBy)
            return res.json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    select: async(req, res) => {
         // execute query
        try {
            const response = await ServiceModel.find({}, 'name')
            return res.json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    update: async(req, res) => {

        try {
            var response = await ServiceModel.findByIdAndUpdate(req.params.id, req.body, {new: true})
            
            if(!response) {
                res.status(404).json({msg: "Não encontrado"})
                return
            }
            res.json({response, msg:'updated'})
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    delete: async(req, res) => {
        try {
            const response = await ServiceModel.findByIdAndDelete(req.params.id)
            
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

module.exports = serviceController