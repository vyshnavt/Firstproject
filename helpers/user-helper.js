const db = require('../config/connection')
const constants = require('../config/constants')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
let objectid = require('mongodb').ObjectId
// const { reject, promise } = require('bcrypt/promises')
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');
const {resolve} = require('path')
// const { options } = require('../routes/user')
var instance = new Razorpay({key_id: 'rzp_test_5uPpdrMxeSFhjj', key_secret: '31x9YumqgWID2IKajNcbZUQe'});

function toUpper(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return word[0].toUpperCase() + word.substr(1);
    }).join(' ');
}

paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': 'AdoshTYjiNRmSkqcfYrzvnzPd-Xr2CRNFD-qEmRxb4AI42_vSXqfpdguf0HfoowSCxR0DDi_bhFAOEJc',
    'client_secret': 'EHzlnY1ZsBXQP62ltfgkb9DXISE_tTpOgiVfZpk7cPu6oqyHtN9txhdNvlPu1MiGbT0If3v29HEiMIlX'
});

module.exports = {
    usersignup: (userdata) => {

        return new Promise(async (resolve, reject) => {
            userdata.password = await bcrypt.hash(userdata.password, 10)
            userdata.repassword = await bcrypt.hash(userdata.repassword, 10)
            db.get().collection(constants.USERDATA).insertOne(userdata).then((data) => {
                db.get().collection(constants.USERDATA).updateOne({
                    name: userdata.name
                }, {
                    $set: {
                        status: true
                    }
                })
                resolve()
            })
        }).catch(() => {
            reject()
        })
    },

    userlogin: (logindata) => {

        return new Promise(async (resolve, reject) => {
            let responce = {}
            let user = await db.get().collection(constants.USERDATA).findOne({email: logindata.email})
            if (user) {
                bcrypt.compare(logindata.password, user.password).then((result) => {
                    if (result) {
                        responce.user = user
                        responce.status = true
                        resolve(responce)
                    } else {
                        responce.status = false
                        resolve(responce)
                    }
                })
            } else {
                responce.status = false
                resolve(responce)
            }
        }).catch(() => {
            reject()
        })
    },

    checkuser: (signupdata) => {
        return new Promise(async (resolve, reject) => {
            let check = []
            let user = await db.get().collection(constants.USERDATA).findOne({email: signupdata.email})
            if (user) {
                check.status = true
                resolve(check)
            } else {
                check.status = false
                resolve(check)
            }
        }).catch(() => {
            reject()
        })
    },

    addTocart: (userId, productId) => {
        return new Promise(async (resolve, reject) => {
            let prodObj = {
                item: objectid(productId),
                quantity: 1,
                coupon: 0
            }
            let usercart = await db.get().collection(constants.CARTDATA).findOne({user: objectid(userId)})
            if (usercart) {
                let prodcheck = usercart.product.findIndex(prodct => prodct.item == productId)
                if (prodcheck !== -1) {
                    db.get().collection(constants.CARTDATA).updateOne({
                        user: objectid(userId),
                        'product.item': objectid(productId)
                    }, {
                        $inc: {
                            'product.$.quantity': 1
                        }
                    }).then(() => {
                        resolve({status: false})
                    })
                } else {
                    db.get().collection(constants.CARTDATA).updateOne({
                        user: objectid(userId)
                    }, {
                        $push: {
                            product: prodObj
                        }
                    }).then(() => {
                        resolve({status: true})
                    })
                }
            } else {
                let cartobj = {
                    user: objectid(userId),
                    product: [prodObj],
                    coupon: 0
                }
                db.get().collection(constants.CARTDATA).insertOne(cartobj).then(() => {
                    resolve({status: true})
                })
            }
        }).catch(() => {
            reject()
        })
    },

    getCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartdata = await db.get().collection(constants.CARTDATA).aggregate([
                {
                    $match: {
                        user: objectid(userId)
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity',
                        coupon: '$coupon',
                        couponid: '$couponid'
                    }
                },
                {
                    $lookup: {
                        from: constants.PRODUCTDATA,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        coupon: 1,
                        couponid: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }, {
                    $project: {
                        item: 1,
                        coupon: 1,
                        couponid: 1,
                        quantity: 1,
                        product: 1,
                        total: {
                            $sum: {
                                $multiply: ['$quantity', '$product.price']
                            }
                        }
                    }

                }
            ]).toArray()
            resolve(cartdata)
        }).catch(() => {
            reject()
        })

    },

    getCartCoupon: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.CARTDATA).findOne({user: objectid(userId)}).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    cartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(constants.CARTDATA).findOne({user: objectid(userId)})
            if (cart) {
                count = cart.product.length
                resolve(count)
            } else {
                count = 0;
                resolve(count)
            }
        }).catch(() => {
            reject()
        })
    },

    changeProductQuantity: (details) => {
        quantity = details.quantity
        count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(constants.CARTDATA).updateOne({
                    _id: objectid(details.cart)
                }, {
                    $pull: {
                        product: {
                            item: objectid(details.product)
                        }
                    }
                }).then((data) => {
                    resolve({remove: true})
                })
            } else {
                db.get().collection(constants.CARTDATA).updateOne({
                    _id: objectid(details.cart),
                    'product.item': objectid(details.product)
                }, {
                    $inc: {
                        'product.$.quantity': count
                    }
                }).then((res) => {
                    resolve({status: true})
                })
            }

        }).catch(() => {
            reject()
        })
    },

    removeFromCart: (cartId, productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.CARTDATA).updateOne({
                _id: objectid(cartId)
            }, {
                $pull: {
                    product: {
                        item: objectid(productId)
                    }
                }
            }).then((data) => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(constants.CARTDATA).aggregate([
                {
                    $match: {
                        user: objectid(userId)
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: constants.PRODUCTDATA,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ['$quantity', '$product.price']
                            }
                        }
                    }

                }
            ]).toArray()
            if (! total[0]) {
                resolve(0)
            } else {
                resolve(total[0].total)
            }

        }).catch(() => {
            reject()
        })
    },


    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(constants.CARTDATA).findOne({user: objectid(userId)})
            resolve(cart.product)
        }).catch(() => {
            reject()
        })
    },

    deleteCart: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.CARTDATA).deleteOne({user: objectid(userId)})
            resolve()
        }).catch(() => {
            reject()
        })
    },

    placeOrder: (order, paym, products, totalPrice, userId, offertotal, subtotal, couponval) => {
        return new Promise((resolve, reject) => {
            let status = paym.paymentMethod == 'COD' ? 'placed' : 'pending'
            userId = objectid(userId)
            let time = new Date()
            let month = time.getMonth() + 1
            let day = time.getDate()
            let year = time.getFullYear()
            let orderObj = {
                user: userId,
                deliveryDetails: {
                    name: order.name,
                    lastname: order.lastname,
                    mobile: order.mobile,
                    address: {
                        address1: order.address,
                        place: order.city,
                        pincode: order.pincode,
                        city: order.city
                    }
                },
                userId: objectid(order.user),
                paymentMethod: paym.paymentMethod,
                products: products,
                status: status,
                total: totalPrice,
                offertotal: offertotal,
                coupon: couponval,
                subtotal: subtotal,
                date: day + "-" + month + "-" + year,
                time: time
            }

            db.get().collection(constants.ORDER).insertOne(orderObj).then((data) => {
                resolve(data.insertedId)
            }).catch(() => {
                reject()
            })
        })

    },

    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            }
            instance.orders.create(options, function (err, order) {
                resolve(order)
            })
        })
    },

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', '31x9YumqgWID2IKajNcbZUQe')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },

    generatePaypal: (orderId, total) => {
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [
                    {
                        "item_list": {
                            "items": [
                                {
                                    "name": "Red Sox Hat",
                                    "sku": "001",
                                    "price": total,
                                    "currency": "USD",
                                    "quantity": 1
                                }
                            ]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": total
                        },
                        "description": "Hat for the best team ever"
                    }
                ]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            resolve(payment.links[i].href)
                        }
                    }
                }
            });

        })


    },

    changePayementStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.ORDER).updateOne({
                _id: objectid(orderId)
            }, {
                $set: {
                    status: 'placed'
                }
            }).then(() => {
                resolve()
            }).catch(() => {})
        })
    },

    getOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let cartdata = await db.get().collection(constants.ORDER).aggregate([
                {
                    $match: {
                        _id: objectid(orderId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$status',
                        date: '$date',
                        deliveryDetails: '$deliveryDetails',
                        address: '$deliveryDetails.address',
                        mobile: '$mobile',
                        payment: '$paymentMethod',
                        total: '$subtotal',
                        coupon: '$coupon'
                    }
                },
                {
                    $lookup: {
                        from: constants.PRODUCTDATA,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        status: 1,
                        deliveryDetails: 1,
                        coupon: 1,
                        total: 1,
                        payment: 1,
                        address: 1,
                        mobile: 1,
                        date: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: 1,
                        status: 1,
                        coupon: 1,
                        date: 1,
                        payment: 1,
                        deliveryDetails: 1,
                        address: 1,
                        mobile: 1,
                        total: 1,
                        producttotal: {
                            $sum: {
                                $multiply: ['$quantity', '$product.price']
                            }
                        }
                    }

                }
            ]).toArray()
            resolve(cartdata)
        })
    },

    getOrdercon: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.ORDER).findOne({_id: objectid(orderId)}).then((data) => {
                resolve(data)
            })
        })
    },

    getAllOrder1: (userId) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(constants.ORDER).find({user: userId}).toArray().sort({time: 1})
            resolve(data)

        })
    },

    getAllOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderDetail = await db.get().collection(constants.ORDER).aggregate([
                {
                    $match: {
                        user: objectid(userId)
                    }
                }, {
                    $project: {
                        item: '$products.item',
                        quanti: '$products.quantity',
                        status: '$status',
                        date: '$date',
                        deliveryDetails: '$deliveryDetails',
                        address: '$deliveryDetails.address',
                        mobile: '$mobile',
                        payment: '$paymentMethod',
                        total: '$total',
                        time: '$time'

                    }
                }, {
                    $lookup: {
                        from: constants.PRODUCTDATA,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quanti: 1,
                        time: 1,
                        status: 1,
                        deliveryDetails: 1,
                        total: 1,
                        payment: 1,
                        address: 1,
                        mobile: 1,
                        date: 1,
                        product: 1
                    }
                },

            ]).sort({time: -1}).toArray()
            for (i of orderDetail) {
                let k = 0
                for (j of i.product) {
                    j.quantity = i.quanti[k]
                }
            }
            resolve(orderDetail)
        })
    },

    Updatepassword: (userId, changeData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(constants.USERDATA).findOne({_id: objectid(userId)})
            bcrypt.compare(changeData.currentPassword, user.password).then((result) => {
                if (result) {
                    db.get().collection(constants.USERDATA).updateOne({
                        _id: objectid(userId)
                    }, {
                        $set: {
                            password: changeData.newPassword
                        }
                    }).then(() => {
                        resolve({status: true})
                    })
                } else {
                    resolve({sataus: false})
                }
            })
        })

    },

    getCategoryProducts: (catname, skipno) => {
        return new Promise(async (resolve, reject) => {
            skipno = parseInt(skipno) * 9
            if (skipno < 0) {
                skipno = 0
            }
            let prodata = await db.get().collection(constants.PRODUCTDATA).find({catagory: catname}).skip(skipno).limit(9).toArray()
            resolve(prodata)
        }).catch(() => {
            reject()
        })
    },

    getCategoryProductsCount: (catname) => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(constants.PRODUCTDATA).find({catagory: catname}).count()
            resolve(count)
        })
    },

    addTowishlist: (userId, ProductId) => {
        return new Promise(async (resolve, reject) => {
            let wish = await db.get().collection(constants.WISHLIST).findOne({user: objectid(userId)})
            if (wish) {
                let checkproduct = wish.products.findIndex(product => product == ProductId)
                if (checkproduct == -1) {
                    db.get().collection(constants.WISHLIST).updateOne({
                        user: objectid(userId)
                    }, {
                        $push: {
                            products: objectid(ProductId)
                        }
                    }).then(() => {
                        resolve({status: true})
                    })
                } else {
                    db.get().collection(constants.WISHLIST).updateOne({
                        user: objectid(userId)
                    }, {
                        $pull: {
                            products: objectid(ProductId)
                        }
                    }).then(() => {
                        resolve({status: false})
                    })
                }
            } else {
                wishdata = {
                    user: objectid(userId),
                    products: [objectid(ProductId)]
                }
                db.get().collection(constants.WISHLIST).insertOne(wishdata).then(() => {
                    resolve({status: true})
                })
            }

        })
    },

    getWishlistcheck: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.WISHLIST).findOne({user: objectid(userId)}).then((data) => {
                resolve(data)
            })
        })
    },

    getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishproductList = await db.get().collection(constants.WISHLIST).aggregate([
                {
                    $match: {
                        user: objectid(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        product: '$products'
                    }
                },
                {
                    $lookup: {
                        from: constants.PRODUCTDATA,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'wishproduct'
                    }
                }, {
                    $project: {
                        wishproduct: {
                            $arrayElemAt: ['$wishproduct', 0]
                        }
                    }
                }
            ]).toArray()
            resolve(wishproductList)
        })
    },

    removeFromwishlist: (userId, productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.WISHLIST).updateOne({
                user: objectid(userId)
            }, {
                $pull: {
                    products: objectid(productId)
                }
            }).then((data) => {
                resolve()
            })
        })


    },

    getWhishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlist = await db.get().collection(constants.WISHLIST).findOne({user: objectid(userId)})
            if (wishlist) {
                count = wishlist.products.length
                resolve(count)
            } else {
                resolve(count)
            }
        })
    },

    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(constants.PRODUCTDATA).findOne({banner: "true"})
            resolve(data)
        })
    },

    addAddress: (details) => {
        return new Promise(async (resolve, reject) => {
            details.name = toUpper(details.name)
            db.get().collection(constants.ADDRESS).insertOne(details).then(() => {
                resolve()
            })
        })
    },

    updateAddress: (details, addressId) => {
        return new Promise(async (resolve, reject) => {
            details.name = toUpper(details.name)
            db.get().collection(constants.ADDRESS).replaceOne({
                _id: objectid(addressId)
            }, details).then(() => {
                resolve()
            })
        })
    },

    deleteAddress: (addressId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(constants.ADDRESS).deleteOne({_id: objectid(addressId)}).then(() => {
                resolve()
            })
        })
    },

    addAddress1: (details, userId) => {
        return new Promise(async (resolve, reject) => {
            let address = {
                name: details.name,
                lastname: details.lastname,
                mobile: details.mobile,
                email: details.email,
                address: details.address,
                city: details.city,
                pincode: details.pincode,
                user: userId
            }

            db.get().collection(constants.ADDRESS).insertOne(address).then(() => {
                resolve()
            })
        })
    },

    getAddress: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.ADDRESS).find({user: userId}).toArray().then((data) => {
                resolve(data)
            })
        })
    },

    getAddressForOrder: (addressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.ADDRESS).findOne({_id: objectid(addressId)}).then((data) => {
                resolve(data)
            })
        })
    },

    applyCoupon: (couponId, userId) => {
        return new Promise(async (resolve, reject) => {
                let coupRes = {}
                let user = await db.get().collection(constants.USERDATA).findOne({_id: objectid(userId), coupon: couponId})
                let cart = await db.get().collection(constants.CARTDATA).findOne({user: objectid(userId)})
                if (cart.coupon != 0) {
                    coupRes.one = true
                    resolve(coupRes)
                } else {
                    let coupon = await db.get().collection(constants.COUPON).findOne({name: couponId})
                    let date = new Date()
                    if (coupon) {
                        if (coupon.expiredate<date){
                        coupRes.expire=true
                        resolve(coupRes) 
                    }else if(user){
                        coupRes.already=true
                        resolve(coupRes)                   
                    }else{
                        db.get().collection(constants.CARTDATA).updateOne({user:objectid(userId)}, {$set:{coupon:coupon.price, couponid:couponId}}).then((data)=> {
                            coupRes.value = coupon.price 
                            resolve(coupRes)
                        }) 
                        
                    }
                } else {
                    coupRes.not = true
                    resolve(coupRes)
                }
            }}
    )
},

addCouponTouser : (userId, couponId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.get().collection(constants.USERDATA).findOne({_id: objectid(userId)})
        if (user.coupon) {
            db.get().collection(constants.USERDATA).updateOne({
                _id: objectid(userId)
            }, {
                $push: {
                    coupon: couponId
                }
            }).then(() => {
                resolve()
            })
        } else {
            let coupon = [couponId]
            db.get().collection(constants.USERDATA).updateOne({
                _id: objectid(userId)
            }, {
                $set: {
                    coupon: coupon
                }
            })
        }
    })
},

getSearch : (detail) => {
    return new Promise(async (resolve, reject) => {
        let data = await db.get().collection(constants.PRODUCTDATA).find({
            name: {
                $regex: detail,
                $options: "$i"
            }
        }).toArray()
        resolve(data)
    }).catch(() => {
        reject()
    })
}}
