const express = require('express')
const router = express.Router()

router.get('/',(req, res, next)=>{
    res.json({message: 'get users'})
})

router.post('/',(req, res, next)=>{
    res.json({message: 'post users'})
})

router.get('/:id',(req, res, next)=>{
    res.json({message: `get users ${req.params.id}`})
})

router.put('/:id',(req,res,next)=>{
    res.json({message: `put users ${req.params.id}`})
})

module.exports = router