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

const homecontroller= function(req, res, next) {
  res.render('admin/index',{admin:true,super:req.session.super}) 
}

router.get('/index',verify,homecontroller);

router.post('/index', function(req, res, next) {
    adminHelper.checkAdmin(req.body).then((responce)=>{
      if(responce.status){
        if(responce.admin.admin=="super"){
          req.session.adminlogedin=true;
          req.body.adminlog=true;
          req.session.super=true;
          res.redirect('/admin/index')
        }else{
          req.session.adminlogedin=true;
          req.body.adminlog=true;
          res.redirect('/admin/index')
        }
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

router.get('/products',verify, async function(req, res, next) {
  let category= await adminHelper.getCategoryuser()
  console.log(category.name);
  adminhelper.getproductsAdmin().then((data)=>{
    res.render('admin/products',{admin:true,data,super:req.session.super,category})
  })
  
});

router.get('/add-product',verify, function(req, res, next) {
  res.render('admin/add-product',{admin:true})
});

router.post('/add-product', function(req, res) {
  console.log("kkkkk");
  console.log(req.body);
  adminhelper.addProduct(req.body).then((data)=>{
    let image=req.files.image
    image.mv('./public/proimg/'+data+'.jpg',(err,data)=>{
      if(err){
        console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm");
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
  res.render('admin/edit-product',{admin:true,product:req.session.value,super:req.session.super})
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
   console.log(data);
    res.render('admin/user',{data,admin:true,super:req.session.super})
  })  
});

router.get('/block-user/:id',verify, function(req, res) {
  
  let userid=req.params.id
  if(userid==req.session.loguserid){
    req.session.loggedin = false
  }
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

router.get('/delete-user/:id',verify, function(req, res) {
  console.log(req.params.id);
  let userid=req.params.id
  if(userid==req.session.loguserid){
    req.session.loggedin = false
  }
  adminhelper.deleteuser(req.params.id).then(()=>{
    console.log("hhhh");
    res.json({status:true})
  })
});

router.get('/category',verify, function(req, res) {
  adminHelper.getCategory().then((category)=>{
    res.render('admin/catagory',{admin:true,category,super:req.session.super,already: req.session.editcategory})
    req.session.editcategory=false
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
    res.render('admin/edit-category',{admin:true,data,super:req.session.super})
  })
});

router.get('/block-category/:id/:idc',verify, function(req, res) { 
  adminHelper.blockCategory(req.params.id,req.params.idc).then(()=>{
    res.json({status:true})
  })
});

router.get('/unblock-category/:id/:idc',verify, function(req, res) { 
  adminHelper.unblockCategory(req.params.id,req.params.idc).then(()=>{
    res.json({status:true})
  })
});

router.post('/edit-category/:id',verify, function(req, res) { 
  adminHelper.updateCategory(req.body,req.params.id).then((data)=>{ 
    if(data==0){
      req.session.editcategory="category Already Existed!"
      res.redirect('/admin/category')
    }else{
      res.redirect('/admin/category')
    }
  })
});

router.get('/admins',verify,(req,res)=>{
  adminHelper.getAdmin().then((admindata)=>{
    res.render('admin/admins',{admin:true,admindata,already:req.session.addadmin,super:req.session.super})
    req.session.addadmin=false
  })
    
})

router.post('/add-admin',(req,res)=>{
  adminHelper.addAdimn(req.body).then((status)=>{
    if(status.status){
      res.redirect('/admin/admins')
    }else{
      req.session.addadmin="Admin Already Existed!"
      res.redirect('/admin/admins')
    }
  })
})

router.post('/edit-admin/:id',(req,res)=>{
  adminHelper.editAdimn(req.body,req.params.id).then((status)=>{
    if(status.status){
      res.redirect('/admin/admins')
    }else{
      req.session.addadmin="Admin Already Existed!"
      res.redirect('/admin/admins')
    }
  })
})

router.get('/delete-admin/:id',verify,(req,res)=>{
  adminHelper.deleteAdmin(req.params.id).then(()=>{
    res.json({status:true})
  })
})

router.post('/block-admin/:id',(req,res)=>{
  adminHelper.blockAdmin(req.params.id).then((responce)=>{
    res.json(responce)
  })
})

router.get('/unblock-admin/:id',verify,(req,res)=>{
  adminHelper.unblockAdmin(req.params.id).then((responce)=>{
    res.json(responce)
  })
})

router.get('/orders',verify,(req,res)=>{
  adminHelper.getOrders().then((data)=>{
    console.log("hbhbhbhbhbhbhhb");
    console.log(data);
    res.render('admin/orders',{admin:true,data,super:req.session.super})
  })
  
})


router.get('/cancel-order/:id',verify,(req,res)=>{
  adminHelper.cancelOrder(req.params.id).then((data)=>{
    res.json({status:true})
  })
  
})

router.get('/logout',(req,res)=>{
  req.session.adminlogedin=false
  req.session.super=false
  req.body.adminlog=false
   res.redirect('/admin')
   res.json({status:true})
})

module.exports = router;
