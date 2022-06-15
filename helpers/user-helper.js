const db = require('../config/connection')
const constants = require('../config/constants')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
let objectid = require('mongodb').ObjectId
// const { reject, promise } = require('bcrypt/promises')


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
             console.log(total);
             if(!total[0]){
                resolve(0)
             }else{
                resolve(total[0].total)
             }
             
        })
    },

    placeOrder:(order,products,totalPrice)=>{
        return new Promise((resolve,reject)=>{
            let status=order.paymentMethod==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    name:order.name,
                    lastname:order.lastname,
                    mobile:order.mobile,
                    address:{
                        address1:order.address1,
                        place:order.place,
                        pincode:order.pincode,
                        city:order.city
                    }
                },
                    userId:objectid(order.userId),
                    paymentMethod:order.paymentMethod,
                    products:products,
                    status:status,
                    total:totalPrice,
                    date:new Date()
            }
           
            db.get().collection(constants.ORDER).insertOne(orderObj).then((data)=>{
             console.log(data.insertedId)
                resolve(data.insertedId)
            })
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

    getOrder:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.ORDER).findOne()
        })
    }


}



