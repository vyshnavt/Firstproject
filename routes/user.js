var express = require('express');
var router = express.Router();
let userhelper = require('../helpers/user-helper')
let config = require('../config/otp');
const adminHelper = require('../helpers/admin-helper');
const e = require('express');
require('dotenv').config()
const SSID=process.env.ServiceId
const ASID=process.env.AccountSID
const AUID=process.env.AuthToken
// const {Db} = require('mongodb');
// const {cartCount} = require('../helpers/user-helper');
const async = require('hbs/lib/async');
const userHelper = require('../helpers/user-helper');
//const {json} = require('express');
let client = require('twilio')(ASID, AUID)
 
const paypal = require('paypal-rest-sdk');
//const {getOrder} = require('../helpers/user-helper');


paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': 'AdoshTYjiNRmSkqcfYrzvnzPd-Xr2CRNFD-qEmRxb4AI42_vSXqfpdguf0HfoowSCxR0DDi_bhFAOEJc',
    'client_secret': 'EHzlnY1ZsBXQP62ltfgkb9DXISE_tTpOgiVfZpk7cPu6oqyHtN9txhdNvlPu1MiGbT0If3v29HEiMIlX'
});

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
        let wishlistcount = await userHelper.getWhishlistCount(req.session.user._id)
        req.session.count = cartcount
        req.session.wishcount = wishlistcount
        next()
    } else {
        next()
    }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
    let bannerproducts = await adminHelper.getBanner()
    let banner = await userHelper.getBanner()
    bannerproducts = bannerproducts.slice(1)
    let commingProducts = await adminHelper.getCommingsoon()
    if (req.session.loggedin) {
        let user = req.session.user
        let wishview = await userHelper.getWishlistcheck(req.session.user._id)
        let cartcount = await userhelper.cartCount(req.session.user._id)
        let wishlistcount = await userHelper.getWhishlistCount(req.session.user._id)
        console.log(wishview);
        adminHelper.getproducts().then((product) => {
            products = product.slice(0, 8)
            if(wishview){
            let k = 0
            for (i of products) {
                let a = i._id.toString()
                for (j of wishview.products) {
                    let b = j.toString()
                    if (a == b) {
                        products[k].wishview = true
                    }
                }
                k++;
            }
        }
            res.render('user/index', {
                products,
                value: true,
                user,
                cartcount,
                banner,
                bannerproducts,
                commingProducts,
                wishlistcount
            });
        }).catch(() => {
            res.redirect('/error')
        })

    } else {
        adminHelper.getproducts().then((product) => {
            products = product.slice(0, 8)
            res.render('user/index', {
                products,
                value: true,
                banner,
                bannerproducts,
                commingProducts
            })
        }).catch(() => {
            res.redirect('/error')
        })
    }
});

// router.get('/shopcatego',async(req,res)=>{
// let catproducts=await adminHelper.getproducts()
// req.session.CategoryProducts=catproducts
// res.redirect('/shop')
// })
// router.get('/pagination/:id',async(req,res)=>{
//     console.log(req.params.id);
//     let n=parseInt(req.params.id)
//     console.log(n);
//     let m=12
//      userHelper.getProductpagination(req.params.id).then((products)=>{
//         console.log("222525252");
//         res.render('user/category',{products,value:true,m})
//     })
// })


router.get('/shopcategory/:name/:num', carCount, async (req, res) => {
    try {
        let skipno = parseInt(req.params.num)
        let category = await adminHelper.getCategoryuser()
        let count = 0
        if (req.params.name == "all") {
            products = await adminHelper.getproducts(skipno)
            count = await adminHelper.getProductCount()
        } else {
            count = await userHelper.getCategoryProductsCount(req.params.name)
            products = await userhelper.getCategoryProducts(req.params.name, skipno)
        }
        if (req.session.loggedin) {
            let wishview = await userHelper.getWishlistcheck(req.session.user._id)
            if(wishview){
            let k = 0
            for (i of products) {
                let a = i._id
                for (j of wishview.products) {
                    let b = j.toString()
                    if (a == b) {
                        products[k].wishview = true
                    }
                }
                k++;
            }
        }
            res.render('user/category', {
                products,
                shop: true,
                user: true,
                cartcount: req.session.count,
                wishlistcount: req.session.wishcount,
                category,
                count
            })
        } else {
            res.render('user/category', {
                products,
                shop: true,
                category,
                count
            })
        }
    } catch (e) {
        res.redirect('error')
    }
})


// router.get('/shopcateg',async(req,res)=>{
// let catproducts=await userhelper.getCategoryProducts(req.params.name)
// req.session.CategoryProducts=catproducts
// res.redirect('/shop')
// })

router.get('/contact', carCount, (req, res) => {
    if (req.session.loggedin) {
        adminHelper.getCartoffersum(req.session.user._id)
        res.render('user/contact', {
            contact: true,
            user: true,
            cartcount: req.session.count
        })
    } else {
        res.render('user/contact', {contact: true})
    }
})

router.get('/wishlist', verifyuser, carCount, async (req, res) => {
    let product = await userhelper.getWishlist(req.session.user._id)
    res.render('user/wishlist', {
        wishlist: true,
        cartcount: req.session.count,
        user: true,
        wishlistcount: req.session.wishcount,
        product
    })
})

router.get('/add-wishlist/:id', carCount, async (req, res) => {
    if (req.session.loggedin) {
        userhelper.addTowishlist(req.session.user._id, req.params.id).then((data) => {
            res.json(data)
        })
    } else {
        loguser = {
            login: true
        }
        res.json(loguser)
    }

})

router.get('/remove-wishlist/:id', verifyuser, carCount, async (req, res) => {
    userhelper.removeFromwishlist(req.session.user._id, req.params.id).then(() => {
        res.json({status: true})
    })
})

router.get('/login', verify, (req, res) => {
    console.log("jjjj");
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
                req.session.loguserid = req.session.user._id
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
    }).catch(() => {
        res.redirect('/error')
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
        } else { // userhelper.usersignup(req.body).then((responce) => {
            var number = req.body.mobile
            req.session.mob = req.body.mobile
            req.session.userdata = req.body
            client.verify.services(SSID).verifications.create({to: `+91${number}`, channel: "sms"}).then((data) => {
                res.redirect('/otpverify')
                // })
            })
        }
    }).catch(() => {
        res.redirect('/error')
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
    client.verify.services(SSID).verificationChecks.create({to: `+91${number}`, code: otp}).then((data) => {
        if (data.status == "approved") {
            userhelper.usersignup(req.session.userdata).then(() => {
                console.log("121212");
                res.redirect("/login");
            }).catch(() => {
                res.redirect('/error')
            })
        } else {
            req.session.errorotp = "Invalid OTP"
            res.redirect("/otpverify")
        }
    });
});


router.get('/checkout', verifyuser, async (req, res) => {
    try {
        let cartproduct = await userhelper.getCart(req.session.user._id)
        let couponval
        if (cartproduct[0]) {
            couponval = cartproduct[0].coupon
        }
        let address = await userHelper.getAddress(req.session.user._id)
        let total = await userhelper.getTotalAmount(req.session.user._id)
        let offertotal = await adminHelper.getCartoffersum(req.session.user._id)
        let subtotal = total - offertotal - couponval
        if (total == 0) {
            res.redirect('/cart')
        } else {
            res.render('user/checkout', {
                login: true,
                cartproduct,
                total,
                user: req.session.user,
                offertotal,
                subtotal,
                address,
                couponval
            })
        }
    } catch (e) {
        res.redirect('/error')
    }
})

// router.get('/product-detail/:id', carCount, (req, res) => {
//     //if (req.session.user) {
//         adminHelper.editproduct(req.params.id).then((product) => {
//             res.render('user/product-detail', {
//                 product,
//                 cartcount: req.session.count,
//                 user: true
//             })
//         }).catch((error)=>{
//             res.render('user/pagenotfound')
//         })
//     // } else {
//     //     adminHelper.editproduct(req.params.id).then((product) => {
//     //         res.render('user/product-detail', {product, cartcount: req.session.count})
//     //     }).catch((error)=>{
//     //         res.render('user/pagenotfound')
//     //     })
//     // }
// })

router.get('/product-detail/:id/:id1', carCount, (req, res) => {
    if (req.params.id == "comming") {
        detail = false
    } else {
        detail = true
    } adminHelper.editproduct(req.params.id, req.params.id1).then((product) => {
        res.render('user/product-detail', {
            product,
            cartcount: req.session.count,
            wishlistcount: req.session.wishcount,
            user: true,
            detail
        })
    }).catch((error) => {
        res.redirect('/error')
    })
})


router.get('/add-tocart/:id', (req, res) => {
    if (req.session.loggedin) {
        userhelper.addTocart(req.session.user._id, req.params.id).then((data) => {
            res.json(data)
        }).catch(() => {
            res.redirect('error')
        })
    } else {
        let login = {
            user: true
        }
        res.json(login)
    }
})

router.get('/cart', verifyuser, carCount, async (req, res) => {
    try {
        let cartproduct = await userhelper.getCart(req.session.user._id)
        let cartcoupon = await userhelper.getCartCoupon(req.session.user._id)
        let couponval = 0
        if (cartcoupon) {
            couponval = cartcoupon.coupon
            console.log("kkkkkkkkkkkkkkkkk");
        }
        let total = await userhelper.getTotalAmount(req.session.user._id)
        let offertotal = await adminHelper.getCartoffersum(req.session.user._id)
        let subtotal = total - offertotal - couponval
        res.render('user/cart', {
            cart: true,
            cartproduct,
            total,
            offertotal,
            subtotal,
            user: true,
            coupon: req.session.coup,
            couponval,
            wishlistcount: req.session.wishcount,
            cartcount: req.session.count
        })
        req.session.coup = false
    } catch (e) {
        res.redirect('/error')
    }
})

router.post('/change-product-quantity', (req, res) => {
    userhelper.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userhelper.getTotalAmount(req.session.user._id)
        response.offertotal = await adminHelper.getCartoffersum(req.session.user._id)
        let cart = await userHelper.getCartCoupon(req.session.user._id)
        response.coupon = cart.coupon
        res.json(response)
    }).catch(() => {
        res.redirect('error')
    })
})

router.get('/product-delete/:id/:idp', verifyuser, (req, res) => {
    userhelper.removeFromCart(req.params.id, req.params.idp).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
})

router.post('/place-order-btn', async (req, res) => {
    if (req.body.name != '' && req.body.saveaddress) {
        userHelper.addAddress1(req.body, req.session.user._id)
    }
    addredetail = req.body
    if (req.body.add != 0) {
        addredetail = await userHelper.getAddressForOrder(req.body.add)
    }
    let cartcoupon = await userhelper.getCartCoupon(req.session.user._id)
    let couponval = 0
    if (cartcoupon) {
        couponval = cartcoupon.coupon
    }
    let products = await userhelper.getCartProductList(req.body.userId)
    let totalPrice = await userhelper.getTotalAmount(req.session.user._id)
    let offertotal = await adminHelper.getCartoffersum(req.session.user._id)
    let subtotal = totalPrice - offertotal - couponval
    userhelper.placeOrder(addredetail, req.body, products, totalPrice, req.session.user._id, offertotal, subtotal, couponval).then((orderId) => {
        req.session.orderid = orderId
        if (req.body['paymentMethod'] == 'COD') {
            let payment = {
                id: orderId,
                success: true
            }
            res.json(payment)
        } else if (req.body['paymentMethod'] == 'paypal') {
            userHelper.generatePaypal(orderId, subtotal).then((data) => {
                let paypaal = {
                    paypal: true,
                    link: data
                }
                res.json(paypaal)
            })
        } else {
            userhelper.generateRazorpay(orderId, subtotal).then((response) => {
                res.json(response)
            })
        }
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/success', async (req, res) => {
    let order = await userhelper.getOrdercon(req.session.orderid)
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [
            {
                "amount": {
                    "currency": "USD",
                    "total": order.subtotal
                }
            }
        ]

    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            userHelper.changePayementStatus(req.session.orderid).then(() => {
                res.redirect('/conformation/' + req.session.orderid)
            }).catch(() => {
                res.redirect('/error')
            })

        }
    });
});

router.get('/cancel', (req, res) => res.send('Cancelled'));

router.post('/verify-payment', (req, res) => {
    userhelper.verifyPayment(req.body).then(() => {
        userHelper.changePayementStatus(req.body['order[receipt]']).then(() => {
            res.json({status: true})
        })

    }).catch((err) => {
        res.json({status: "payment failed"})
    })
})

router.get('/conformation/:id', verifyuser, async (req, res) => {
    let order = await userhelper.getOrdercon(req.params.id)
    let cart = await userHelper.getCart(req.session.user._id)
    if(cart[0]){
    if (cart[0].couponid) {
        userHelper.addCouponTouser(req.session.user._id, cart[0].couponid).then(() => {}).catch(() => {
            res.redirect('/error')
        })
    }
    }

    userhelper.getOrder(req.params.id).then((cartproduct) => {
        userhelper.deleteCart(req.session.user._id)
        let pro = cartproduct.slice(0, 1)
        res.render('user/confirmation', {
            cartproduct,
            pro,
            user: true,
            order
        })
    }).catch(() => {
        res.redirect('/error')
    })

})

router.get('/user-profile', verifyuser, carCount, (req, res) => {
    userhelper.getAllOrder(req.session.user._id).then(async (datas) => {
        let data = datas.slice(0, 1)
        let address = await userHelper.getAddress(req.session.user._id)
        res.render('user/userprofile', {
            datas,
            data,
            user: req.session.user,
            address,
            wishlistcount: req.session.wishcount,
            cartcount: req.session.count
        })
    })

})

router.post('/change-password', (req, res) => {
    userHelper.Updatepassword(req.session.user._id, req.body).then((data) => {
        if (data.status) {
            res.json({status: true})
        } else {
            res.json({status: false})

        }
    })
})

router.get('/cancel-order/:id', verifyuser, (req, res) => {
    adminHelper.cancelOrder(req.params.id).then(() => {
        res.json({status: true})
    })
})

router.post('/add-address', (req, res) => {
    userHelper.addAddress(req.body).then(() => {
        res.redirect('/user-profile')
    })
})

router.post('/edit-address/:id', (req, res) => {
    userHelper.updateAddress(req.body, req.params.id).then(() => {
        res.redirect('/user-profile')
    })
})

router.get('/delete-address/:id', (req, res) => {
    userHelper.deleteAddress(req.params.id).then(() => {
        res.json({status: true})
    })
})

router.post('/apply-coupon', (req, res) => {
    userHelper.applyCoupon(req.body.couponname, req.session.user._id).then((responce) => {
        if (responce.one) {
            req.session.coup = "Only One Coupon can be Applied"
            res.redirect('/cart')
        } else if (responce.expire) {
            req.session.coup = "This coupon Expired"
            res.redirect('/cart')
        } else if (responce.already) {
            req.session.coup = "This coupon Already used"
            res.redirect('/cart')
        } else if (responce.not) {
            req.session.coup = "Coupon Does not Exist"
            res.redirect('/cart')
        } else {
            res.redirect('/cart')
        }
    })

})

router.post('/search', (req, res) => {
    userHelper.getSearch(req.body.searchname).then((data) => {
        req.session.searchdata = data
        res.redirect('/search')
    }).then(() => {
        res.render('error')
    })
})

router.get('/search', async (req, res) => {
    let category = await adminHelper.getCategoryuser()
    res.render('user/searchpage', {
        products: req.session.searchdata,
        category,
        value: true
    })
})

router.get('/error', (req, res) => {
    res.render('user/pagenotfound', {notfound: true})
})


router.get('/logout', (req, res) => {
    req.session.loggedin = false
    req.session.count = false
    res.redirect('/')
})

module.exports = router;
