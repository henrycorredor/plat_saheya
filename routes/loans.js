const express = require('express')
const router = express.Router()

router.get('/',(req,res,next)=>{
    res.json({
        message: "Probando la seccion de prestamos"
    })
})

module.exports = router