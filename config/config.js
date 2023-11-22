const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTION_MDB, { connectTimeoutMS: 2000 })
.then(() => console.log('=> Well connected dude („• ᴗ •„)'))
.catch(error => console.error(error))
