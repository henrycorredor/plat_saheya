const express = require('express')
const router = express.Router()

router.get('/',(req,res,next)=>{
    res.send("hola pecueca")
})



router.put('/:cuoteId',(req,res,next)=>{
    res.send('hola pecuecas')
})

module.exports = router