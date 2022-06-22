const db = require('../config/connection')
const constants = require('../config/constants')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
let objectid = require('mongodb').ObjectId
// const { reject, promise } = require('bcrypt/promises')
const Razorpay = require('razorpay');
//const { options } = require('../routes/user')
var instance = new Razorpay({
    key_id: 'rzp_test_5uPpdrMxeSFhjj',
    key_secret: '31x9YumqgWID2IKajNcbZUQe',
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
        })
    },

    addTocart: (userId, productId) => {
        let prodObj={
            item:objectid(productId),
            quantity:1
        }
        return new Promise(async (resolve, reject) => {
            let usercart = await db.get().collection(constants.CARTDATA).findOne({user: objectid(userId)})
            if (usercart) {
                let prodcheck=usercart.product.findIndex(prodct=> prodct.item==productId)
                if(prodcheck!==-1){
                    db.get().collection(constants.CARTDATA)
                    .updateOne({user:objectid(userId),'product.item':objectid(productId)},
                    {
                        $inc:{'product.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve({status:false})
                    })
                }else{
                db.get().collection(constants.CARTDATA).updateOne({
                    user: objectid(userId)
                }, {
                    $push: {
                        product:prodObj
                    }
                }).then(() => {
                    resolve({status:true})
                })
            }
            } else {
                let cartobj = {
                    user: objectid(userId),
                    product: [prodObj]
                }
                db.get().collection(constants.CARTDATA).insertOne(cartobj).then(() => {
                    resolve({status:true})
                })
            }
        })
    },

    getCart:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            let cartdata= await db.get().collection(constants.CARTDATA).aggregate([
               { 
                   $match:{user:objectid(userId) }
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:constants.PRODUCTDATA,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                }
                ,
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}   
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:1,total:{$sum:{$multiply:['$quantity','$product.price']}}
                    }

                }
            ]).toArray()
            console.log("hhhhhhhhhhhhhhhhhhhhhhh");
            console.log(cartdata);
            resolve(cartdata)
        })
       
    },

    cartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(constants.CARTDATA).findOne({user:objectid(userId)})
            if(cart){
            count=cart.product.length
            resolve(count)
            }else{
                count=0;
                resolve(count)
            }
        })
    },

    changeProductQuantity:(details)=>{
        quantity=details.quantity
        count=parseInt(details.count)
        return new Promise((resolve,reject)=>{
            if(count==-1&&quantity==1){
                db.get().collection(constants.CARTDATA)
                .updateOne({_id:objectid(details.cart)},
                {
                    $pull:{product:{item:objectid(details.product)}}
                }).then((data)=>{
                    resolve({remove:true})
                })
            }else{
                db.get().collection(constants.CARTDATA)
            .updateOne({_id:objectid(details.cart),'product.item':objectid(details.product)},
            {
                $inc:{'product.$.quantity':count}
            }
            ).then((res)=>{
                resolve({status:true})
            })
            }
            
        })
    },

    removeFromCart:(cartId,productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.CARTDATA)
            .updateOne({_id:objectid(cartId)},
            {
                $pull:{product:{item:objectid(productId)}}
            }).then((data)=>{
                resolve()
            })
        })
    },

    getTotalAmount:(userId)=>{
        return new Promise (async(resolve,reject)=>{

            let total= await db.get().collection(constants.CARTDATA).aggregate([
                { 
                    $match:{user:objectid(userId) }
                 },
                 {
                     $unwind:'$product'
                 },
                 {
                     $project:{
                         item:'$product.item',
                         quantity:'$product.quantity'
                     }
                 },
                 {
                     $lookup:{
                         from:constants.PRODUCTDATA,
                         localField:'item',
                         foreignField:'_id',
                         as:'product'
                     }
                 }
                 ,
                 {
                     $project:{
                         item:1,quantity:1,product:{$arrayElemAt:['$product',0]}   
                     }
                 },
                 {
                     $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}}
                     }
 
                 }
             ]).toArray()
             if(!total[0]){
                resolve(0)
             }else{
                resolve(total[0].total)
             }
             
        })
    },

  

    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(constants.CARTDATA).findOne({user:objectid(userId)})
            resolve(cart.product)
        })
    },

    deleteCart:(userId)=>{
        return new Promise((resolve,reject)=>{
             db.get().collection(constants.CARTDATA).deleteOne({user:objectid(userId)})
             resolve()
        })
    },

    placeOrder:(order,products,totalPrice,userId)=>{
        return new Promise((resolve,reject)=>{
            let status=order.paymentMethod==='COD'?'placed':'pending'
            userId=objectid(userId)
           let date=new Date()
           let month=date.getMonth()+1
           let day=date.getDate()
           let year=date.getFullYear()
            let orderObj={
                user:userId,
                deliveryDetails:{
                    name:order.name,
                    lastname:order.lastname,
                    mobile:order.mobile,
                    address:{
                        address1:order.address,
                        place:order.city,
                        pincode:order.pincode,
                        city:order.city
                    }
                },
                    userId:objectid(order.userId),
                    paymentMethod:order.paymentMethod,
                    products:products,
                    status:status,
                    total:totalPrice,
                    date:day+"-"+month+"-"+year
            }
           
            db.get().collection(constants.ORDER).insertOne(orderObj).then((data)=>{
                resolve(data.insertedId)
            })
        })

    },

    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options ={
                amount:total*100,
                currency:"INR",
                receipt:""+orderId
            }
            instance.orders.create(options,function(err,order){
                resolve(order)
                })
        })  
    },

    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256','31x9YumqgWID2IKajNcbZUQe')

            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },

    changePayementStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.ORDER).updateOne({_id:objectid(orderId)},{$set:{status:'placed'}}).then(()=>{
                resolve()
            })
        })
    },

    getOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartdata= await db.get().collection(constants.ORDER).aggregate([
                { 
                    $match:{_id:objectid(orderId) }
                 },
                 {
                     $unwind:'$products'
                 },
                 {
                     $project:{
                         item:'$products.item',
                         quantity:'$products.quantity',
                         status:'$status',
                         date:'$date',
                         deliveryDetails:'$deliveryDetails',
                         address:'$deliveryDetails.address',
                         mobile:'$mobile',
                         payment:'$paymentMethod',
                         total:'$total'
                     }
                 },
                 {
                     $lookup:{
                         from:constants.PRODUCTDATA,
                         localField:'item',
                         foreignField:'_id',
                         as:'product'
                     }
                 }
                 ,
                 {
                     $project:{
                         item:1,quantity:1,status:1,deliveryDetails:1,total:1,payment:1,address:1,mobile:1,date:1,product:{$arrayElemAt:['$product',0]}   
                     }
                 },
                 {
                     $project:{
                         item:1,quantity:1,product:1,status:1,date:1,payment:1,deliveryDetails:1,address:1,mobile:1,total:1,producttotal:{$sum:{$multiply:['$quantity','$product.price']}}
                     }
 
                 }
             ]).toArray()
             resolve(cartdata)
        })
    },

    getOrdercon:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.ORDER).findOne({_id:objectid(orderId)}).then((data)=>{
                resolve(data)
            })
        })
    },

    getAllOrder1:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let data=await db.get().collection(constants.ORDER).find({user:userId}).toArray()
                resolve(data)
            
        })
    },

    getAllOrder:(userId)=>{
        return new Promise(async(resolve,reject)=>{           
            let orderDetail= await db.get().collection(constants.ORDER).aggregate([
                { 
                    $match:{user:objectid(userId)}
                 },
                 {
                     $project:{
                         item:'$products.item',
                         quanti:'$products.quantity',
                         status:'$status',
                         date:'$date',
                         deliveryDetails:'$deliveryDetails',
                         address:'$deliveryDetails.address',
                         mobile:'$mobile',
                         payment:'$paymentMethod',
                         total:'$total'
                     }
                 },
                 {
                     $lookup:{
                         from:constants.PRODUCTDATA,
                         localField:'item',
                         foreignField:'_id',
                         as:'product'
                     }
                 }
                 ,
                 {
                     $project:{
                         item:1,quanti:1,status:1,deliveryDetails:1,total:1,payment:1,address:1,mobile:1,date:1,product:1
                     }
                 },
                
             ]).sort({date:-1}).toArray()
             resolve(orderDetail)           
        })
    },

    Updatepassword:(userId,changeData)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(constants.USERDATA).findOne({_id:objectid(userId)})
            bcrypt.compare(changeData.currentPassword, user.password).then((result) => {
                if (result) {
                    db.get().collection(constants.USERDATA).updateOne({_id:objectid(userId)},{$set:{password:changeData.newPassword}}).then(()=>{
                        resolve({status:true})
                    })                   
                } else {
                    resolve({sataus:false})
                }

            
        })
    })
       
    },

    getCategoryProducts:(catname)=>{
        return new Promise(async(resolve,reject)=>{
           let prodata=await db.get().collection(constants.PRODUCTDATA).find({catagory:catname}).toArray()
           resolve(prodata)
        })
    },

    addTowishlist:(userId,ProductId)=>{
        return new Promise(async(resolve,reject)=>{
            let wish=await db.get().collection(constants.WISHLIST).findOne({user:objectid(userId)})

            if(wish){
                let checkproduct=wish.products.findIndex(product=> product==ProductId)
                console.log(checkproduct);
                if(checkproduct==-1){
                    db.get().collection(constants.WISHLIST).updateOne({user:objectid(userId)},{$push:{products:objectid(ProductId)}})
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            }else{
                wishdata={
                    user:objectid(userId),
                    products:[objectid(ProductId)]
                }
                db.get().collection(constants.WISHLIST).insertOne(wishdata).then(()=>{
                    resolve({status:true})
                })
            }
            
        })
    },

    getWishlist:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let wishproductList=await db.get().collection(constants.WISHLIST).aggregate([
            {
                $match:{user:objectid(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    product:'$products'
                }
            },
            {
                $lookup:{
                    from:constants.PRODUCTDATA,
                    localField:'product',
                    foreignField:'_id',
                    as:'wishproduct'
                }
            },
            {
                $project:{
                    wishproduct:{$arrayElemAt:['$wishproduct',0]}
                }
            }
           ]).toArray()
           resolve(wishproductList)
        })
    },
    
    removeFromwishlist:(userId,productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.WISHLIST)
            .updateOne({user:objectid(userId)},
            {
                $pull:{products:objectid(productId)}
            }).then((data)=>{
                console.log(data);
                resolve()
            })
        })
       

    }   

}



