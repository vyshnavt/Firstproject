var express = require('express');
const async = require('hbs/lib/async');
const adminHelper = require('../helpers/admin-helper');
var router = express.Router();
var adminhelper=require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');

/* GET users listing. */
const verify=(req,res,next)=>{
  if(req.session.adminlogedin){
    next()
  }else{
    res.redirect('/admin')
  }
}


router.get('/',(req,res)=>{
  if(req.session.adminlogedin){
   res.redirect('/admin/index')
  }else{
    res.render('admin/login',{adminlog:true,value:req.session.adminvalue})
    req.session.adminvalue=false
  }
  
})

router.get('/index',verify, function(req, res, next) {
  res.render('admin/index',{admin:true})
});

router.post('/index', function(req, res, next) {
    adminHelper.checkAdmin(req.body).then((responce)=>{
      if(responce.status){
        req.session.adminlogedin=true;
    req.body.adminlog=true;
    res.redirect('/admin/index')
      }else{
        req.session.adminvalue="Invalid  Admin name or password"
    res.redirect('/admin')
      }
    })
  //   console.log(req.body);
  //    if(req.body.name==""&&req.body.password==""){
  //   req.session.adminlogedin=true;
  //   req.body.adminlog=true;
  //   res.redirect('/admin/index')
  // }else{
  //   req.session.adminvalue="Invalid  Admin name or password"
  //   res.redirect('/admin')
  // }
});

router.get('/products',verify, function(req, res, next) {
  adminhelper.getproducts().then((data)=>{

    res.render('admin/products',{admin:true,data})
  })
  
});

router.get('/add-product',verify, function(req, res, next) {
  res.render('admin/add-product',{admin:true})
});

router.post('/add-product', function(req, res) {
  adminhelper.addProduct(req.body).then((data)=>{
    let image=req.files.image
    image.mv('./public/proimg/'+data+'.jpg',(err,data)=>{
      if(err){
        console.log(err);
      }
      else{
        res.redirect('/admin/products')
      }
    })
  })
});

router.get('/edit-product/:id',verify, async(req, res, next)=> {
  let productid=req.params.id
  let product= await adminHelper.editproduct(productid)
  req.session.value=product
  res.render('admin/edit-product',{admin:true,product:req.session.value})
});

router.post('/update-product/:id',(req, res, next)=> {
  let productid=req.params.id
  adminHelper.updateproduct(productid,req.body).then((data)=>{
      if(req.files!=null){
        let image=req.files.image;
        image.mv('./public/proimg/'+productid+'.jpg')
        res.redirect('/admin/products')
      }else{
      res.redirect('/admin/products')
      }
  })

});

router.get('/delete-product/:id',verify,(req, res, next)=> {
  let productid=req.params.id
  adminHelper.deleteproduct(productid).then(()=>{
    res.json({status:true})
  })

});

router.get('/user',verify, function(req, res) {
  adminhelper.getUsers().then((data)=>{
    res.render('admin/user',{data,admin:true})
  })  
});

router.get('/block-user/:id',verify, function(req, res) {
  
  let userid=req.params.id
  adminhelper.blockuser(userid).then((data)=>{
    res.json({status:true})
    
  })
});

router.get('/unblock-user/:id',verify, function(req, res) {
  let userid=req.params.id
  adminhelper.Unblockuser(userid).then((data)=>{
    res.json({status:true})
  })
});

router.get('/category',verify, function(req, res) {
  adminHelper.getCategory().then((category)=>{
    res.render('admin/catagory',{admin:true,category})
  })  
});

// router.get('/add-category',verify, function(req, res) { 
//   res.json({status:true})
// });

router.post('/add-category', function(req, res) {
  adminHelper.CheckCategory(req.body).then((check)=>{
    if(check.status){
     // req.session.adminvalue="category already exist"
     //res.redirect('/admin/add-category')
     res.json({already:true})
    }else{
      adminHelper.addCategory(req.body).then(()=>{
        //res.redirect('/admin/category')
        res.json({status:true})
      })
    }
  }) 
});

router.get('/edit-category/:id',verify, function(req, res) { 
  adminHelper.editCategory(req.params.id).then((data)=>{
    res.render('admin/edit-category',{admin:true,data})
  })
});

router.get('/delete-category/:id',verify, function(req, res) { 
  adminHelper.deleteCategory(req.params.id).then(()=>{
    res.json({status:true})
  })
});

router.post('/edit-category/:id',verify, function(req, res) { 
  adminHelper.updateCategory(req.body,req.params.id).then(()=>{ 
   res.redirect('/admin/category')
  })
});




router.get('/logout',(req,res)=>{
  req.session.adminlogedin=false
  req.body.adminlog=false
   res.redirect('/admin')
   res.json({status:true})
})



module.exports = router;
