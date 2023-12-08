const { Party: PartyModel} = require("../models/Party");
const { Service: ServiceModel } = require("../models/Service");
const _ = require('lodash');
const { User: UserModel } = require("../models/User");
const { select } = require("./userController");

const partyController = {
    create: async(req, res) => {
        try {
            var author = await UserModel.findById(req.body.author)
            if (!author) return res.status(403).json({msg: "Invalid Author"})
            
            const party = {
                title: req.body.title,
                author: author.id,
                description: req.body.description,
                budget: req.body.budget,
                image: req.body.image,
                services: req.body.services
            }

            var newParty = await PartyModel.create(party)
            author.parties.push(newParty.id)
            
            res.status(201).json({newParty, msg: 'Party created.'})

        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    detail: async(req, res) => {
        try {
            const response = await PartyModel.findById(req.params.id)
                .populate('services', ['name', 'price'])
                .populate('author', ['email', 'phone', 'fullName'])

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
        const { title, author, services, budgetMin, budgetMax, createdAtMin, createdAtMax, updatedAtMin, updatedAtMax, sort } = req.query
        // get filters
        var serviceQuery = []
        if (services)
            serviceQuery = _.map(services.split(','), (s) => { return {services: s} })
        
        const filters = {
            $and: [
                title ? { title: { $regex: title, $options: 'i' } } : {},
                author ? { author: { $regex: author, $options: 'i' } } : {},
                budgetMin ? { budget: { $gte: parseFloat(budgetMin) } } : {},
                budgetMax ? { budget: { $lte: parseFloat(budgetMax) } } : {},
                createdAtMin ? {createdAt : { $gte: createdAtMin } }: {},
                createdAtMax ? {createdAt : { $lte: createdAtMax } }: {},
                updatedAtMin ? {updatedAt : { $gte: updatedAtMin } }: {},
                updatedAtMax ? {updatedAt : { $lte: updatedAtMax } }: {},
                services ? {$or: serviceQuery} : {}
            ]
        }
        
        // get sorting
        var sortBy = {}
        if(sort){
            var desc = _.includes(sort, '-')
            var field = sort.replace('-', '')
            sortBy = { [field]: desc ? -1 : 1 }
        }
        
        // execute query
        try {
            const response = await PartyModel.find(filters).sort(sortBy)
            return res.json(response)
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    update: async(req, res) => {

        try {
            var response = await PartyModel.findByIdAndUpdate(req.params.id, req.body, {new: true})
            
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
            const response = await PartyModel.findByIdAndDelete(req.params.id)
            
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

    addService: async(req, res) => {

        try {
            var party = await PartyModel.findById(req.params.id)
            var service = await ServiceModel.findById(req.body.serviceId)
            if(!party) {
                res.status(404).json({msg: "Evento não encontrada"})
                return
            }
            if(!service) {
                res.status(404).json({msg: "Serviço não encontrado"})
                return
            }

            if(party.services.includes(req.body.serviceId)) {
                res.status(404).json({msg: "Serviço já existe no Evento"})
                return
            }
            
            party.services.push(service)
            await party.save()

            await party.populate('services')
            
            res.json({party, msg:'updated'})
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },
}

module.exports = partyController