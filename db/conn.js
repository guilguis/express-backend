const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    try {
        await mongoose.connect(process.env.DBURI);
    } catch (error) {
        console.log(`Failed to connect: ${error}`);
        return
    }
    console.log("DB connected")
}

module.exports = main