const async = require('hbs/lib/async')
const db = require('../config/connection');
const constants = require('../config/constants')
let objectid = require('mongodb').ObjectId


function toUpper(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return word[0].toUpperCase() + word.substr(1);
    }).join(' ');
}  

module.exports = {
    checkAdmin: (adminadata) => {
        let adminresponce = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(constants.ADMIN).findOne({name: adminadata.name})
            if (user) {
                if (user.password == adminadata.password) {
                    adminresponce.status = true
                    adminresponce.admin = user
                    resolve(adminresponce)
                } else {
                    adminresponce.status = false
                    resolve(adminresponce)
                }
            } else {
                adminresponce.status = false
                resolve(adminresponce)
            }
        })
    },

    getUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(constants.USERDATA).find().toArray()
            resolve(users)
        })
    },

    blockuser: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.USERDATA).updateOne({
                _id: objectid(userid)
            }, {
                $set: {
                    status: false
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    Unblockuser: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.USERDATA).updateOne({
                _id: objectid(userid)
            }, {
                $set: {
                    status: true
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },


    deleteuser: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.USERDATA).deleteOne({_id: objectid(userid)}).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    addProduct: (Productdata) => {
        return new Promise((resolve, reject) => {
            Productdata.name = Productdata.name.toUpperCase()
            Productdata.price = parseInt(Productdata.price)
            Productdata.quantity = parseInt(Productdata.quantity)
            db.get().collection(constants.PRODUCTDATA).insertOne(Productdata).then((data) => {
                db.get().collection(constants.PRODUCTDATA).updateOne({
                    _id: data.insertedId
                }, {
                    $set: {
                        status: true
                    }
                }).then(()=>{
                    resolve(data.insertedId)
                })
            }).catch(() => {
                reject()
            })
        })
    },

    getproducts: (skipno) => {
            return new Promise((resolve, reject) => {
                skipno = parseInt(skipno) * 9
                if (skipno < 0) {
                    skipno = 0
                }
                db.get().collection(constants.PRODUCTDATA).find({status: true}).skip(skipno).limit(9).toArray().then((products) => {
                    resolve(products)
                }).catch(() => {
                    reject()
                })
            })
    },

    getProductCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(constants.PRODUCTDATA).find({status: true}).count()
            resolve(count)
        })
    },

    getproductsAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let produtcs = await db.get().collection(constants.PRODUCTDATA).find().toArray()
            resolve(produtcs)
        })
    },

    editproduct: (checkname, productid) => {
        return new Promise((resolve, reject) => {

            if (checkname == "comming") {
                db.get().collection(constants.COMMINGSOON).findOne({_id: objectid(productid)}).then((data) => {
                    resolve(data)
                }).catch(() => {
                    reject(error)
                })
            } else {
                db.get().collection(constants.PRODUCTDATA).findOne({_id: objectid(productid)}).then((data) => {
                    resolve(data)
                }).catch(() => {
                    reject(error)
                })
            }
        })
    },

    updateproduct: (productid, productdetail) => {
        return new Promise((resolve, reject) => {
            productdetail.name = productdetail.name.toUpperCase()
            productdetail.price = parseInt(productdetail.price)
            productdetail.quantity = parseInt(productdetail.quantity)
            db.get().collection(constants.PRODUCTDATA).updateOne({
                _id: objectid(productid)
            }, {
                $set: {
                    name: productdetail.name,
                    size: productdetail.size,
                    price: productdetail.price,
                    quantity: productdetail.quantity,
                    catagory: productdetail.catagory
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    deleteproduct: (productid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.PRODUCTDATA).remove({_id: objectid(productid)}).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    addCategory: (categorydata) => {
        return new Promise((resolve, reject) => {
            categorydata.name = toUpper(categorydata.name)
            db.get().collection(constants.CATEGORYDATA).insertOne(categorydata).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let catagory = await db.get().collection(constants.CATEGORYDATA).find().toArray()
            resolve(catagory)
        })
    },

    getCategoryuser: () => {
        return new Promise(async (resolve, reject) => {
            let catagory = await db.get().collection(constants.CATEGORYDATA).find({status: "true"}).toArray()
            resolve(catagory)
        })
    },

    blockCategory: (categoryid, categoryname) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.CATEGORYDATA).update({
                _id: objectid(categoryid)
            }, {
                $set: {
                    status: false
                }
            }).then(() => {
                db.get().collection(constants.PRODUCTDATA).update({
                    catagory: categoryname
                }, {
                    $set: {
                        status: false
                    }
                }).then(() => {
                    resolve()
                })
            }).catch(() => {
                reject()
            })
        })
    },

    unblockCategory: (categoryid, categoryname) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.CATEGORYDATA).update({
                _id: objectid(categoryid)
            }, {
                $set: {
                    status: "true"
                }
            }).then(() => {
                db.get().collection(constants.PRODUCTDATA).update({
                    catagory: categoryname
                }, {
                    $set: {
                        status: true
                    }
                }).then(() => {
                    resolve()
                })
            }).catch(() => {
                reject()
            })
        })
    },

    CheckCategory: (categorydata) => {
        return new Promise(async (resolve, reject) => {
            let check = []
            let category = await db.get().collection(constants.CATEGORYDATA).findOne({name: categorydata.name})
            if (category) {
                check.status = true
                resolve(check)
            } else {
                check.status = false
                resolve(check)
            }
        })
    },

    editCategory: (categoryid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.CATEGORYDATA).findOne({_id: objectid(categoryid)}).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    updateCategory: (category, categoryid) => {
        return new Promise(async (resolve, reject) => {
            category.name = toUpper(category.name)
            let catego = await db.get().collection(constants.CATEGORYDATA).findOne({name: category.name})
            if (catego) {
                resolve(0)
            } else {
                db.get().collection(constants.CATEGORYDATA).updateOne({
                    _id: objectid(categoryid)
                }, {
                    $set: {
                        name: category.name
                    }
                }).then((data) => {
                    resolve(data)
                }).catch(() => {
                    reject()
                })
            }
        })
    },

    addAdimn: (admindata) => {
        return new Promise(async (resolve, reject) => {
            admindata.name = toUpper(admindata.name)
            let admin = await db.get().collection(constants.ADMIN).findOne({name: admindata.name})
            if (! admin) {
                db.get().collection(constants.ADMIN).insertOne(admindata)
                resolve({status: true})
            } else {
                resolve({status: false})
            }

        })

    },

    editAdimn: (admindata, adminId) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(constants.ADMIN).findOne({name: admindata.name})
            admindata.name = toUpper(admindata.name)
            if (! admin) {
                db.get().collection(constants.ADMIN).updateOne({
                    _id: objectid(adminId)
                }, {
                    $set: {
                        name: admindata.name
                    }
                }).then(() => {
                    resolve({status: true})
                }).catch(() => {
                    reject()
                })
            } else {
                resolve({status: false})
            }

        })

    },

    getAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let admindata = await db.get().collection(constants.ADMIN).find({admin: 'admin'}).sort({_id: -1}).toArray()
            resolve(admindata)
        })
    },

    deleteAdmin: (adminId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.ADMIN).deleteOne({_id: objectid(adminId)}).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    blockAdmin: (adminId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.ADMIN).updateOne({
                _id: objectid(adminId)
            }, {
                $set: {
                    status: false
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    unblockAdmin: (adminId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.ADMIN).updateOne({
                _id: objectid(adminId)
            }, {
                $set: {
                    status: true
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    getOrds: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(constants.ORDER).find().toArray()
            resolve(data)
        })
    },

    getOrders: () => {
        return new Promise(async (resolve, reject) => {

            let orderDetail = await db.get().collection(constants.ORDER).aggregate([
                {
                    $lookup: {
                        from: constants.PRODUCTDATA,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $lookup: {
                        from: constants.USERDATA,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'prod'
                    }
                }
            ]).toArray()
            resolve(orderDetail)

        })
    },

    changeOrderstatus: (details) => {
        return new Promise((resolve, reject) => {
            let {selected, orderId} = details
            db.get().collection(constants.ORDER).updateOne({
                _id: objectid(orderId)
            }, {
                $set: {
                    status: selected
                }
            }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },


    addBanner: (details) => {
        return new Promise((resolve, reject) => {
            details.name = details.name.toUpperCase()
            details.price = parseInt(details.price)
            details.quantity = parseInt(details.quantity)
            db.get().collection(constants.PRODUCTDATA).insertOne(details).then((data) => { 
                resolve(data.insertedId)
            }).catch(() => {
                reject()
            })
        })
    },

    RemoveFromBanner: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.PRODUCTDATA).updateOne({
                _id: objectid(productId)
            }, {
                $unset: {
                    banner: "true"
                }
            }).then((data) => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(constants.PRODUCTDATA).find({banner: "true"}).toArray()
            resolve(data)
        })
    },


    addCommingSoon: (productdetail) => {
        return new Promise(async (resolve, reject) => {
            productdetail.name = productdetail.name.toUpperCase()
            productdetail.price = parseInt(productdetail.price)
            productdetail.quantity = parseInt(productdetail.quantity)
            productdetail.status = true
            let collection = await db.get().collection(constants.COMMINGSOON).findOne()
            if (! collection) {
                let c = await db.get().createCollection(constants.COMMINGSOON, {
                    "capped": true,
                    "size": 5000000,
                    "max": 8
                })
            }
            db.get().collection(constants.COMMINGSOON).insertOne(productdetail).then((data) => {
                resolve(data.insertedId)
            }).catch(() => {
                reject()
            })

        })
    },

    updateCommingProducts: (productid, productdetail) => {
        return new Promise((resolve, reject) => {
            productdetail.name = productdetail.name.toUpperCase()
            productdetail.price = parseInt(productdetail.price)
            productdetail.quantity = parseInt(productdetail.quantity)
            db.get().collection(constants.COMMINGSOON).updateOne({
                _id: objectid(productid)
            }, {
                $set: {
                    name: productdetail.name,
                    size: productdetail.size,
                    price: productdetail.price,
                    quantity: productdetail.quantity,
                    catagory: productdetail.catagory
                }
            }).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject()
            })
        })
    },

    getCommingsoon: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(constants.COMMINGSOON).find().sort({_id: -1}).toArray()
            resolve(data)
        })
    },

    deleteCommingproduct: (productid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.COMMINGSOON).remove({_id: objectid(productid)}).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    moveCommingproduct: (productid) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(constants.COMMINGSOON).findOne({_id: objectid(productid)})
            db.get().collection(constants.PRODUCTDATA).insertOne(product).then(() => {
                db.get().collection(constants.COMMINGSOON).remove({_id: objectid(productid)}).then(() => {
                    resolve()
                })
            }).catch(() => {
               reject()
            })
        })
    },

    addOffers: (offerdata) => {
        return new Promise((resolve, reject) => {
            offerdata.percentage = toUpper(offerdata.percentage)
            offerdata.percentage = parseInt(offerdata.percentage)
            db.get().collection(constants.OFFERS).insertOne(offerdata).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    removeOffer: (offerdata) => {
        return new Promise(async (resolve, reject) => {
            let offer = await db.get().collection(constants.PRODUCTDATA).findOne({offerid: offerdata})
            if (offer) {
                resolve({status: false})
            } else {
                db.get().collection(constants.OFFERS).deleteOne({_id: objectid(offerdata)}).then(() => {
                    resolve({status: true})
                }).catch(() => {
                    reject()
                })
            }

        })
    },

    getOffers: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.OFFERS).find().sort({_id: -1}).toArray().then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    addOfferToProduct: (productId, offerId) => {
        return new Promise(async (resolve, reject) => {
            let Product = await db.get().collection(constants.PRODUCTDATA).findOne({_id: objectid(productId)})
            let offer = await db.get().collection(constants.OFFERS).findOne({
                _id: objectid(offerId.offerid)
            })
            offerPrice = (Product.price * offer.percentage) / 100
            priceoffer = Product.price - offerPrice
            db.get().collection(constants.PRODUCTDATA).updateOne({
                _id: objectid(productId)
            }, {
                $set: {
                    offer: offerPrice,
                    offerpercentage: offer.percentage,
                    offerstatus: true,
                    discountPrice: priceoffer,
                    offerid: offerId.offerid
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    removeOfferFromProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(constants.PRODUCTDATA).updateOne({
                _id: objectid(productId)
            }, {
                $set: {
                    offer: 0,
                    offerpercentage: 0,
                    offerstatus: false,
                    offerid: 0
                }
            }).then((data) => {
                resolve()
            }).catch(() => {
               reject()
            })
        })
    },

    getCartoffersum: (userId) => {
        return new Promise(async (resolve, reject) => {
            let offertotal = await db.get().collection(constants.CARTDATA).aggregate([
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
                        offertotal: {
                            $sum: {
                                $multiply: ['$quantity', '$product.offer']
                            }
                        }
                    }
                },
            ]).toArray()
            if (! offertotal[0]) {
                resolve(0)
            } else {
                resolve(offertotal[0].offertotal)
            }

        })
    },

    addCoupon: (couponData) => {
        return new Promise(async (resolve, reject) => {
            couponData.name = toUpper(couponData.name)
            couponData.price = parseInt(couponData.price)
            couponData.expiredate = new Date(couponData.expiredate)
            let coupon = await db.get().collection(constants.COUPON).findOne({name: couponData.name})
            if (coupon) {
                resolve({status: false})
            } else {
                db.get().collection(constants.COUPON).insertOne(couponData).then(() => {
                    resolve({status: true})
                }).catch(() => {
                    reject()
                })
            }

        })
    },

    getCoupon: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.COUPON).find().sort({_id: -1}).toArray().then((data) => {
                resolve(data)
            }).catch(() => {
                reject()
            })
        })
    },

    removeCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.COUPON).deleteOne({_id: objectid(couponId)}).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },

    getReportPayment: () => {
        return new Promise(async (resolve, reject) => {
            let report = await db.get().collection(constants.ORDER).aggregate([
                {
                    $project: {
                        subtotal: '$subtotal',
                        paymentMethod: '$paymentMethod'
                    }
                }, {
                    $group: {
                        _id: "$paymentMethod",
                        total: {
                            $sum: "$subtotal"
                        }
                    }
                }
            ]).sort({_id: -1}).toArray()
            resolve(report)

        })
    },

    getReport: (details) => {
        return new Promise(async (resolve, reject) => {
            let startdate = new Date(details.startdate)
            let enddate = new Date(details.enddate)
            let orders = await db.get().collection(constants.ORDER).aggregate([
                {
                    $match: {
                        time: {
                            $gte: startdate,
                            $lte: enddate
                        }
                    }
                }, {
                    $lookup: {
                        from: constants.USERDATA,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userdetail'
                    }
                }, {
                    $lookup: {
                        from: constants.PRODUCTDATA,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'productdetail'
                    }
                }, {
                    $project: {
                        paymentMethod: 1,
                        status: 1,
                        subtotal: 1,
                        date: 1,
                        productdetail: 1,
                        userdetail: {
                            $arrayElemAt: ['$userdetail', 0]
                        }
                    }
                }
            ]).toArray()
            resolve(orders)
        })
    },

    getMonthlyReport: () => {
        return new Promise(async (resolve, reject) => {
            let curentdate = new Date()
            let year = curentdate.getFullYear()
            let monthreport = await db.get().collection(constants.ORDER).aggregate([
                {
                    $project: {
                        year: {
                            $year: '$time'
                        },
                        subtotal: 1,
                        time: 1
                    }
                }, {
                    $match: {
                        year: year
                    }
                }, {
                    $project: {
                        subtotal: 1,
                        year: 1,
                        month: {
                            $month: '$time'
                        }
                    }
                }, {
                    $group: {
                        _id: '$month',
                        total: {
                            $sum: '$subtotal'
                        }
                    }
                }
            ]).sort({_id: 1}).toArray()
            resolve(monthreport)
        })
    }


}
