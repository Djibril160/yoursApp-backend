const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTION_MDB, { connectTimeoutMS: 2000 })
.then(() => console.log('=> Well connected tonton („• ᴗ •„)'))
.catch(error => console.error(error))
