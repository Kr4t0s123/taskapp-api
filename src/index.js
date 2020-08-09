const express = require('express')
//By requiring it ensures that file runs and connects to Database
const dotenv = require('dotenv');
dotenv.config();
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express() 
const PORT = process.env.PORT

//To parse incoming JSON to object

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)
app.listen(PORT , ()=>{
    console.log("Server is up and running on",PORT)
})

