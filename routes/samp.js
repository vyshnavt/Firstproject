var express = require('express');
var router = express.Router();
let swal=require('sweetalert')


router.get('/', function(req, res, next) {
    console.log("lllllllll");
    res.render('samp/samp',{admin:true})
  });

  router.get('/exam', function(req, res, next) {
      console.log("kkkkkkkkkkkkk");
      
      res.render('samp/exam')
  });




module.exports = router;