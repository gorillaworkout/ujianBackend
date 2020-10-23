const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors=require('cors')
const bearerToken=require('express-bearer-token')
require('dotenv').config()

const PORT =  8001

app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('public'))


app.get('/',(req,res)=>{
    var dataku={
        name:'dino'
    }
    res.send('<h1>selamat datang di API Market Place</h1>')
})
// const {ProductRoutes,karyawanRoutes,usersRoutes,MongoRoutes,MongooseRouters,SocketRoutes} = require('./Routes')
const {AuthRoutes } = require('./src/Routes')

app.use('/auth',AuthRoutes)

// app.listen(5000,()=>console.log('port active'))
app.listen(PORT,()=>console.log('port server active' + PORT))
