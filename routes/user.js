var express = require('express');
var router = express.Router();
let userhelper = require('../helpers/user-helper')
let config = require('../config/otp');
const adminHelper = require('../helpers/admin-helper');
const e = require('express');
//const {Db} = require('mongodb');
//const {cartCount} = require('../helpers/user-helper');
const async = require('hbs/lib/async');
const userHelper = require('../helpers/user-helper');
const { json } = require('express');
let client = require('twilio')(config.AccountSID, config.AuthToken)


let verifyuser = (req, res, next) => {
    if (req.session.loggedin) {
        next()
    } else {
        res.redirect('/login')
    }
}

let verify = (req, res, next) => {
    if (req.session.loggedin) {
        res.redirect('/')
    } else {
        next()
    }
}

let carCount = async (req, res, next) => {
    if (req.session.loggedin) {
        let cartcount = await userhelper.cartCount(req.session.user._id)
        req.session.count = cartcount
        next()
    } else {
        next()
    }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
    if (req.session.loggedin) {
        let user = req.session.user
        let cartcount = await userhelper.cartCount(req.session.user._id)
        adminHelper.getproducts().then((product) => {
            products=product.slice(0,8)
            res.render('user/index', {
                products,
                value: true,
                user,
                cartcount
            });
        })

    } else {
        adminHelper.getproducts().then((product) => {
            products=product.slice(0,8)
            res.render('user/index', {products, value: true})
        })

    }
});

router.get('/shopcategory',async(req,res)=>{
  let catproducts=await adminHelper.getproducts()
  req.session.CategoryProducts=catproducts
  res.redirect('/shop')
})


router.get('/shop', carCount,async (req, res) => {
  let category=await adminHelper.getCategoryuser()
  let products=req.session.CategoryProducts
        if (req.session.loggedin) {
            res.render('user/category', {
                products,
                shop: true,
                user: true,
                cartcount: req.session.count,
                category
            })
        } else {
            res.render('user/category', {products, shop: true,category})
        }
})

router.get('/shopcategory/:id',async(req,res)=>{
  let catproducts=await userhelper.getCategoryProducts(req.params.id)
  req.session.CategoryProducts=catproducts
  res.redirect('/shop')
})

router.get('/contact', carCount, (req, res) => {
    if (req.session.loggedin) {
        res.render('user/contact', {
            contact: true,
            user: true,
            cartcount: req.session.count
        })
    } else {
        res.render('user/contact', {contact: true})
    }
})

router.get('/wishlist', verifyuser, carCount, async(req, res) => {
    let product=await userhelper.getWishlist(req.session.user._id)
    console.log("nnnnnnnnnnnnnnnnnn");
    console.log(product);
    res.render('user/wishlist', {
        wishlist: true,
        cartcount: req.session.count,
        user: true,product
    })
})

router.get('/add-wishlist/:id', verifyuser, carCount, async(req, res) => {
  userhelper.addTowishlist(req.session.user._id,req.params.id).then((data)=>{
    res.json(data)
  })
})

router.get('/remove-wishlist/:id', verifyuser, carCount, async(req, res) => {
    userhelper.removeFromwishlist(req.session.user._id,req.params.id).then(()=>{
        res.json({status:true})
    })
})

router.get('/login', verify, (req, res) => {
    res.render('user/login', {
        login: true,
        variable: req.session.variable
    })
    req.session.variable = false
})

router.post('/login', (req, res) => {
    userhelper.userlogin(req.body).then((responce) => {
        if (responce.status) {
            if (responce.user.status) {
                req.session.user = responce.user
                req.session.loguserid=req.session.user._id
                req.session.loggedin = true
                res.redirect('/')
            } else {
                req.session.variable = "You Accound Is Blocked"
                res.redirect('/login')
            }

        } else {
            req.session.variable = "Invalid email or password"
            res.redirect('/login')
        }
    })

})

router.get('/signup', verify, (req, res) => {
    res.render('user/signup', {
        login: true,
        variable: req.session.variable
    })
    req.session.variable = false
})

router.post('/signup', (req, res) => {
    userhelper.checkuser(req.body).then((responce) => {
        if (responce.status) {
            req.session.variable = "email already existed"
            res.redirect('/signup')
        } else {
            //userhelper.usersignup(req.body).then((responce) => {
                var number = req.body.mobile
                req.session.mob = req.body.mobile
                req.session.userdata = req.body
                client.verify.services(config.ServiceId).verifications.create({to: `+91${number}`, channel: "sms"}).then((data) => {
                    res.redirect('/otpverify')
               // })
            })
        }
    })
})


router.get('/otpverify', (req, res) => {
    var num = req.session.mob
    res.render('user/otpverify', {num, error: req.session.errorotp})
    req.session.errorotp = false
})

router.post('/otpverify', verify, (req, res) => {
    var otp = req.body.otp;
    var number = req.session.mob;
    client.verify.services(config.ServiceId).verificationChecks.create({to: `+91${number}`, code: otp}).then((data) => {
        if (data.status == "approved") {
            userhelper.usersignup(req.session.userdata).then((response) => {
                res.redirect("/login");
            });
        } else {
            req.session.errorotp = "Invalid OTP"
            res.redirect("/otpverify")
        }
    });
});


router.get('/checkout', verifyuser, async (req, res) => {
    let cartproduct = await userhelper.getCart(req.session.user._id)
    let total = await userhelper.getTotalAmount(req.session.user._id)
    if (total == 0) {
        res.redirect('/cart')
    } else {
        res.render('user/checkout', {
            login: true,
            cartproduct,
            total,
            user: req.session.user
        })
    }
})

router.get('/product-detail/:id', carCount, (req, res) => {
    if (req.session.user) {
        adminHelper.editproduct(req.params.id).then((product) => {
            res.render('user/product-detail', {
                product,
                cartcount: req.session.count,
                user: true
            })
        })
    } else {
        adminHelper.editproduct(req.params.id).then((product) => {
            res.render('user/product-detail', {product, cartcount: req.session.count})
        })
    }
})

router.get('/add-tocart/:id', verifyuser, (req, res) => {
  
    userhelper.addTocart(req.session.user._id, req.params.id).then((data) => {
        res.json(data)
    })
})

router.get('/cart', verifyuser, async (req, res) => {
    let cartproduct = await userhelper.getCart(req.session.user._id)
    let total = await userhelper.getTotalAmount(req.session.user._id)
    res.render('user/cart', {
        cart: true,
        cartproduct,
        total,
        user: true
    })
})

router.post('/change-product-quantity', (req, res) => {
    userhelper.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userhelper.getTotalAmount(req.session.user._id)
        res.json(response)
    })
})

router.get('/product-delete/:id/:idp', verifyuser, (req, res) => {
    userhelper.removeFromCart(req.params.id, req.params.idp).then(() => {
        res.json({status:true})
    })
})

router.post('/place-order-btn', async (req, res) => {
    let products = await userhelper.getCartProductList(req.body.userId)
    let totalPrice = await userhelper.getTotalAmount(req.session.user._id)
    userhelper.placeOrder(req.body, products, totalPrice,req.session.user._id).then((data) => {
        if(req.body['paymentMethod']=='COD'){
            payment={
                id:data,
                success:true
            }
            userhelper.deleteCart(req.session.user._id).then(()=>{
                res.json(payment)
                })
            
        }else{
            userhelper.generateRazorpay(data,totalPrice).then((response)=>{
                res.json(response)
            })
        }
    })
})

router.post('/verify-payment',(req,res)=>{
    console.log(req.body);
    userhelper.verifyPayment(req.body).then(()=>{
        userHelper.changePayementStatus(req.body['order[receipt]']).then(()=>{
            userhelper.deleteCart(req.session.user._id).then(()=>{
                res.json({status:true})
                })
            
        })

    }).catch((err)=>{
        console.log(err);
        res.json({status:"payment failed"})
    })
})

router.get('/conformation/:id', verifyuser, async (req, res) => {
    let order = await userhelper.getOrdercon(req.params.id)
    userhelper.getOrder(req.params.id).then((cartproduct) => {
      let pro=cartproduct.slice(0,1)
        res.render('user/confirmation', {cartproduct,pro,user: true})
    })

})

router.get('/user-profile', verifyuser,(req,res)=>{
  userhelper.getAllOrder(req.session.user._id).then((datas)=>{
    let data=datas.slice(0,1)
    res.render('user/userprofile',{datas,data,user:req.session.user})
  })
  
})

router.post('/change-password',(req,res)=>{
    userHelper.Updatepassword(req.session.user._id,req.body).then((data)=>{
        if(data.status){
            res.json({status:true})
            // req.session.changepassword="password changed"
            // res.redirect('/user-profile')
        }else{
            res.json({status:false})
            // req.session.changepassword="password incorrect"
            // res.redirect('/user-profile')
        }
    })
  })

router.get('/category',(req,res)=>{
  adminHelper.getCategory().then((category)=>{

  }) 
})

router.get('/cancel-order/:id', verifyuser,(req,res)=>{
  adminHelper.cancelOrder(req.params.id).then(()=>{
   res.json({status:true})
  }) 
  })


router.get('/logout', (req, res) => { 
    req.session.loggedin = false
    req.session.count = false
    res.redirect('/')
})

module.exports = router;
