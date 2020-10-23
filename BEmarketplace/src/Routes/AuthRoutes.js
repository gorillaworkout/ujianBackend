const Router=require('express').Router()
const {AuthControllers}=require('../controllers')

Router.post('/hireme',AuthControllers.Hire)
Router.post('/login',AuthControllers.Login)
Router.post('/register',AuthControllers.Register)

Router.post('/verified',AuthControllers.verified)
Router.post('/sendverify',AuthControllers.sendverified)


Router.get('/pendapatan',AuthControllers.Pendapatan)
Router.get('/bestpen',AuthControllers.bestPenjual)
Router.get('/penjualnotpembeli',AuthControllers.penjualbknPembeli)
Router.get('/bestProduct',AuthControllers.bestProduct)
Router.get('/bestcat',AuthControllers.bestCategory)
module.exports=Router