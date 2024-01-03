const _ = require('lodash')
const { Company: CompanyModel } = require('../models/Company')

const companyController = {
    
    create: async(req, res) => {
        try {
            const company = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                socials: req.body.socials,
                location: req.body.location,
                website: req.body.website,
                services: req.body.services
            }
            const response = await CompanyModel.create(company)
            res.status(201).json({response, msg: 'company created.'})

        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    detail: async(req, res) => {
        try {
            const response = await CompanyModel.findById(req.params.id)

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
                // name ? { name: { $regex: name } } : {},
                // description ? { description: { $regex: description } } : {},
                // priceMin ? { price: { $gte: parseFloat(priceMin) } } : {},
                // priceMax ? { price: { $lte: parseFloat(priceMax) } } : {},
                // createdAtMin ? {createdAt : { $gte: createdAtMin } }: {},
                // createdAtMax ? {createdAt : { $lte: createdAtMax } }: {},
                // updatedAtMin ? {updatedAt : { $gte: updatedAtMin } }: {},
                // updatedAtMax ? {updatedAt : { $lte: updatedAtMax } }: {}
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
            // const response = await CompanyModel.find(filters, {}, {...paginationOptions}).sort(sortBy)
            const query = await CompanyModel.aggregate(
              [{  $facet: {
                    'data': [
                    { $match: filters},
                    { $skip: paginationOptions.skip },
                    { $limit: paginationOptions.limit },
                    ],
                    'count': [
                    { $count: 'count' }
                    ]
                }}]
            )
            const response = {results: query[0].data, count:query[0].count[0].count}
            return res.json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    select: async(req, res) => {
         // execute query
        try {
            const response = await CompanyModel.find({}, 'name')
            return res.json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    update: async(req, res) => {

        try {
            var response = await CompanyModel.findByIdAndUpdate(req.params.id, req.body, {new: true})
            
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
            const response = await CompanyModel.findByIdAndDelete(req.params.id)
            
            if(!response) {
                res.status(404).json({msg: "Não encontrado"})
                return
            }
            res.status(204).json()
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    }
}

module.exports = companyController