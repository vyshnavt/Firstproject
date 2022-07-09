var express = require('express');
var router = express.Router();
let swal=require('sweetalert')

router.get('/',(req,res)=>{

  res.render('samp/exam')
})


module.exports = router;