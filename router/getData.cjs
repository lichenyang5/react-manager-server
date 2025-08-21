const express = require('express')
const router = express.Router()
const cityData = require('../models/piecitydata.cjs')
const agecityData =require('../models/pieagedata.cjs')
const reportData =require('../models/reportdata.cjs')
const lineData=require('../models/linedatas.cjs')
const radarData =require('../models/radardata.cjs')
router.use((req,res,next)=>{
    if(req.user){
        next()
    }else{
        res.status(201).send({
            code:500001,
            data:{

            },
            msg:'token失效了'
        })
    }
    
})
router.get('/dashboard/getReportData',async(req,res)=>{
        const data = await reportData.findOne({_id:'68a547d25413ed173c14a276'})
        res.send({code:0,msg:'',data:data})
})
router.get('/dashboard/getLineData',async(req,res)=>{
        const data = await lineData.findOne({_id:'68a548cc5413ed173c14a281'})
        res.send({code:0,msg:'',data:data})
})
router.get('/dashboard/getPieCityData',async(req,res)=>{
        const data = await cityData.find({})
        res.send({code:0,msg:'',data:data})
})
router.get('/dashboard/getPieAgeData',async(req,res)=>{
        const data = await agecityData.find({})
        res.send({code:0,msg:'',data:data})
})
router.get('/dashboard/getRadarData',async(req,res)=>{
        const data = await radarData.findOne({_id:'68a549515413ed173c14a283'})
        res.send({code:0,msg:'',data:data})
})
module.exports =router