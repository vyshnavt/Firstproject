var express = require('express');
const async = require('hbs/lib/async');
//const {Db} = require('mongodb');
const adminHelper = require('../helpers/admin-helper');
var router = express.Router();
var adminhelper = require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');
let fs = require('fs');

const verify = (req, res, next) => {
    if (req.session.adminlogedin) {
        next()
    } else {
        res.redirect('/admin')
    }
} 

router.get('/', (req, res) => {
    if (req.session.adminlogedin) {
        res.redirect('/admin/index')
    } else {
        res.render('admin/login', {
            adminlog: true,
            value: req.session.adminvalue
        })
        req.session.adminvalue = false
    }

})

const homecontroller = async function (req, res, next) {
    let dayreport= await adminHelper.getDailyReport()
    let monthreport = await adminHelper.getMonthlyReport()
    console.log(monthreport);
    adminHelper.getReportPayment().then((report) => {
        let monarray = []
        let a = 0;
        for (let i = 1; i <= 12; i++) {
            if (monthreport[a]) {
                if (i == monthreport[a]._id) {
                    monarray[i - 1] = monthreport[a].total
                    a++
                } else {
                    monarray[i - 1] = 0
                }
            } else {
                monarray[i - 1] = 0
            }
        }
        
        console.log(monarray);

        let [...monarra] = monarray
        let paypal = 0
        let razor = 0
        let cod = 0
        for (let i of report) {
            if (i._id == 'paypal') {
                paypal = i.total
            } else if (i._id == 'online') {
                razor = i.total
            } else if (i._id == 'COD') {
                cod = i.total
            }
        }
        res.render('admin/index', {
            admin: true,
            super: req.session.super,
            paypal,
            razor,
            cod,
            monarra
        })
    })
}

router.get('/index', verify, homecontroller);

router.post('/index', function (req, res, next) {
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
});

router.get('/products', verify, async function (req, res, next) {
    let category = await adminHelper.getCategoryuser()
    adminhelper.getproductsAdmin().then((data) => {
        res.render('admin/products', {
            admin: true,
            data,
            super: req.session.super,
            category
        })
    })

});

router.get('/add-product', verify, function (req, res, next) {
    res.render('admin/add-product', {admin: true})
});

router.post('/add-product', function (req, res) {
    adminhelper.addProduct(req.body).then((data) => {
        let image = req.files.image
        image.mv('./public/proimg/' + data + '.jpg', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/admin/products')
            }
        })
    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/edit-product/:id', verify, async (req, res, next) => {
    let productid = req.params.id
    let product = await adminHelper.editproduct(productid)
    req.session.value = product
    res.render('admin/edit-product', {
        admin: true,
        product: req.session.value,
        super: req.session.super
    })
});

router.post('/update-product/:id', (req, res, next) => {
    adminHelper.updateproduct(req.params.id, req.body).then((data) => {
        if (req.files != null) {
            let image = req.files.image;
            image.mv('./public/proimg/' + req.params.id + '.jpg')
            res.redirect('/admin/products')
        } else {
            res.redirect('/admin/products')
        }
    })

});

router.get('/delete-product/:id', verify, (req, res, next) => {
    adminHelper.deleteproduct(req.params.id).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })

});

router.get('/user', verify, function (req, res) {
    adminhelper.getUsers().then((data) => {
        res.render('admin/user', {
            data,
            admin: true,
            super: req.session.super
        })
    })
});

router.get('/block-user/:id', verify, function (req, res) {
    let userid = req.params.id
    if (userid == req.session.loguserid) {
        req.session.loggedin = false
    }
    adminhelper.blockuser(userid).then((data) => {
        res.json({status: true})

    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/unblock-user/:id', verify, function (req, res) {
    adminhelper.Unblockuser(req.params.id).then((data) => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/delete-user/:id', verify, function (req, res) {
    let userid = req.params.id
    if (userid == req.session.loguserid) {
        req.session.loggedin = false
    }
    adminhelper.deleteuser(req.params.id).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/category', verify, function (req, res) {
    adminHelper.getCategory().then((category) => {
        res.render('admin/catagory', {
            admin: true,
            category,
            super: req.session.super,
            already: req.session.editcategory
        })
        req.session.editcategory = false
    })
});

router.post('/add-category', function (req, res) {
    adminHelper.CheckCategory(req.body).then((check) => {
        if (check.status) {
            res.json({already: true})
        } else {
            adminHelper.addCategory(req.body).then(() => { 
                res.json({status: true})
            }).catch(() => {
                res.redirect('/error')
            })
        }
    })
});

router.get('/edit-category/:id', verify, function (req, res) {
    adminHelper.editCategory(req.params.id).then((data) => {
        res.render('admin/edit-category', {
            admin: true,
            data,
            super: req.session.super
        })
    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/block-category/:id/:idc', verify, function (req, res) {
    adminHelper.blockCategory(req.params.id, req.params.idc).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/unblock-category/:id/:idc', verify, function (req, res) {
    adminHelper.unblockCategory(req.params.id, req.params.idc).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
});

router.post('/edit-category/:id', verify, function (req, res) {
    adminHelper.updateCategory(req.body, req.params.id).then((data) => {
        if (data == 0) {
            req.session.editcategory = "category Already Existed!"
            res.redirect('/admin/category')
        } else {
            res.redirect('/admin/category')
        }
    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/admins', verify, (req, res) => {
    adminHelper.getAdmin().then((admindata) => {
        res.render('admin/admins', {
            admin: true,
            admindata,
            already: req.session.addadmin,
            super: req.session.super
        })
        req.session.addadmin = false
    })

})

router.post('/add-admin', (req, res) => {
    adminHelper.addAdimn(req.body).then((status) => {
        if (status.status) {
            res.redirect('/admin/admins')
        } else {
            req.session.addadmin = "Admin Already Existed!"
            res.redirect('/admin/admins')
        }
    })
})

router.post('/edit-admin/:id', (req, res) => {
    adminHelper.editAdimn(req.body, req.params.id).then((status) => {
        if (status.status) {
            res.redirect('/admin/admins')
        } else {
            req.session.addadmin = "Admin Already Existed!"
            res.redirect('/admin/admins')
        }
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/delete-admin/:id', verify, (req, res) => {
    adminHelper.deleteAdmin(req.params.id).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
})

router.post('/block-admin/:id', (req, res) => {
    adminHelper.blockAdmin(req.params.id).then((responce) => {
        res.json(responce)
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/unblock-admin/:id', verify, (req, res) => {
    adminHelper.unblockAdmin(req.params.id).then((responce) => {
        res.json(responce)
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/orders', verify, (req, res) => {
    adminHelper.getOrders().then((data) => {
        res.render('admin/orders', {
            admin: true,
            data,
            super: req.session.super
        })
    })

})

router.post('/change-status', (req, res) => {
    adminHelper.changeOrderstatus(req.body).then((data) => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
})

router.post('/add-banner', verify, (req, res) => {
    adminHelper.addBanner(req.body).then((data) => {
        let image = req.files.image
        image.mv('./public/proimg/' + data + '.jpg', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/admin/banner')
            }
        })
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/remove-from-banner/:id', verify, (req, res) => {
    adminHelper.RemoveFromBanner(req.params.id).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/banner', verify, (req, res) => {
    adminHelper.getBanner().then(async (data) => {
        let category = await adminHelper.getCategoryuser()
        res.render('admin/banner', {
            admin: true,
            data,
            super: req.session.super,
            category
        })
    })
})


router.post('/add-commingsoon', verify, (req, res) => {
  adminHelper.addCommingSoon(req.body).then((data) => {
      let image = req.files.image
      image.mv('./public/proimg/' + data + '.jpg', (err, data) => {
          if (err) {
              console.log(err);
          } else {
              res.redirect('/admin/commingsoon')
          }
      })
  }).catch(() => {
    res.redirect('/error')
})
})


router.post('/update-Comming-product/:id', verify, (req, res) => {
    adminHelper.updateCommingProducts(req.params.id, req.body).then((data) => {
        if (req.files != null) {
            let image = req.files.image
            image.mv('./public/proimg/' + data + '.jpg', (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/admin/commingsoon')
                }
            })
        }
        res.redirect('/admin/commingsoon')
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/commingsoon', verify, async (req, res) => {
    let category = await adminHelper.getCategoryuser()
    adminHelper.getCommingsoon().then((data) => {
        res.render('admin/commingsoon', {
            admin: true,
            data,
            super: req.session.super,
            category
        })
    })
})

router.get('/delete-comming-product/:id', verify, (req, res, next) => {
    let productid = req.params.id
    adminHelper.deleteCommingproduct(productid).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })

});

router.get('/move-comming-products/:id', verify, (req, res, next) => {
    adminHelper.moveCommingproduct(req.params.id).then((data) => {
        res.redirect('/admin/commingsoon')
    }).catch(() => {
        res.redirect('/error')
    })
});

router.get('/offers', verify, async (req, res) => {
    adminHelper.getOffers().then((offer) => {
        adminHelper.getproducts().then((data) => {
            res.render('admin/offers', {
                admin: true,
                data,
                offer,
                super: req.session.super
            })
        })
    }).catch(() => {
        res.redirect('/error')
    })

})

router.post('/add-offers', (req, res) => {
    adminHelper.addOffers(req.body).then(() => {
        res.redirect('/admin/offers')
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/delete-offer/:id', verify, (req, res) => {
    adminHelper.removeOffer(req.params.id).then((data) => {
        if (data.status) {
            res.json({status: true})
        } else {
            res.json({status: false})
        }

    }).catch(() => {
        res.redirect('/error')
    })
})

router.post('/add-offer-to-product/:pid', (req, res) => {
    adminHelper.addOfferToProduct(req.params.pid, req.body).then(() => {
        res.redirect('/admin/offers')
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/remove-offer-product/:id', verify, (req, res) => {
    adminHelper.removeOfferFromProduct(req.params.id).then(() => {
        res.json({status: true})
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/coupon', verify, async (req, res) => {
    adminHelper.getCoupon().then((coupon) => {
        for (i of coupon) {
            let l = i.expiredate.toDateString()
            i.expiredate = i.expiredate.toDateString()
        }
        res.render('admin/coupon', {
            admin: true,
            coupon,
            already: req.session.coupon,
            super: req.session.super
        })
        req.session.coupon = false
    }).catch(() => {
        res.redirect('/error')
    })
})

router.post('/add-coupon', (req, res) => {
    adminHelper.addCoupon(req.body).then((data) => {
        if (data) {
            res.redirect('/admin/coupon')
        } else {
            req.session.coupon = "coupon allready Existed"
            res.redirect('/admin/coupon')
        }

    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/delete-coupon/:id', (req, res) => {
    adminHelper.removeCoupon(req.params.id).then(() => {
        res.redirect('/admin/coupon')
    }).catch(() => {
        res.redirect('/error')
    })
})

router.get('/report', verify, (req, res) => {
    res.render('admin/report', {
        admin: true,
        data: req.session.report,
        reporttotal: req.session.reporttotal,
        super: req.session.super
    })
})

router.post('/report', (req, res) => {
    adminHelper.getReport(req.body).then((data) => {
        let payment = {
            cod: 0,
            paypal: 0,
            razor: 0,
            total: 0
        }
        for (i of data) {
            if (i.paymentMethod == 'COD') {
                payment.cod = payment.cod + i.subtotal
            } else if (i.paymentMethod == 'paypal') {
                payment.paypal = payment.paypal + i.subtotal
            } else if (i.paymentMethod == 'razor') {
                payment.razor = payment.razor + i.subtotal
            }
            payment.total = payment.total + i.subtotal
        }
        req.session.report = data
        req.session.reporttotal = payment
        res.redirect('/admin/report')
    })
})

router.get('/logout', (req, res) => {
    req.session.adminlogedin = false
    req.session.super = false
    req.body.adminlog = false
    res.redirect('/admin')
    res.json({status: true})
})

module.exports = router;
