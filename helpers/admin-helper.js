// const { reject, promise } = require('bcrypt/promises')
//const { promise } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const db=require('../config/connection')
const constants=require('../config/constants')
let objectid=require('mongodb').ObjectId

module.exports={
    checkAdmin:(adminadata)=>{
        let adminresponce={}
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(constants.ADMIN).findOne({name:adminadata.name})
            if(user){
                if(user.password==adminadata.password){
                    adminresponce.status=true
                    adminresponce.admin=user
                    resolve(adminresponce)
                }else{
                    adminresponce.status=false
                    resolve(adminresponce)
                }
            }else{
                adminresponce.status=false
                resolve(adminresponce)
            }
        })
    },
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await  db.get().collection(constants.USERDATA).find().toArray()
            resolve(users)
        })
    },

    blockuser:(userid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.USERDATA).updateOne({_id:objectid(userid)},{$set:{status:false}}).then((data)=>{
                resolve(data)
            })
        })
    },

    Unblockuser:(userid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.USERDATA).updateOne({_id:objectid(userid)},{$set:{status:true}}).then((data)=>{
                resolve(data)
            })
        })
    },

    
    deleteuser:(userid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.USERDATA).deleteOne({_id:objectid(userid)}).then(()=>{
                resolve()
            })
        })
    },

    addProduct:(Productdata)=>{
         return new Promise((resolve,reject)=>{
            Productdata.price=parseInt(Productdata.price)
            Productdata.amount=parseInt(Productdata.amount)
            Productdata.quantity=parseInt(Productdata.quantity)
             db.get().collection(constants.PRODUCTDATA).insertOne(Productdata).then((data)=>{
                db.get().collection(constants.PRODUCTDATA).updateOne({_id:data.insertedId},{$set:{status:true}})
                resolve(data.insertedId)
             })
         })
    },

    getproducts:()=>{
        return new Promise(async(resolve,reject)=>{
          let produtcs=await db.get().collection(constants.PRODUCTDATA).find({status:true}).toArray()
               resolve(produtcs)       
        })
    },

    getproductsAdmin:()=>{
        return new Promise(async(resolve,reject)=>{
          let produtcs=await db.get().collection(constants.PRODUCTDATA).find().toArray()
               resolve(produtcs)       
        })
    },

    getproduct:(productid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.PRODUCTDATA).findOne({_id:objectid(productid)}).then((data)=>{
                resolve(produtcs) 
            })
                       
          })
    },

    editproduct:(productid)=>{
        return new Promise((resolve,reject)=>{
         db.get().collection(constants.PRODUCTDATA).findOne({_id:objectid(productid)}).then((data)=>{
             resolve(data)
         })
        })
    },

    updateproduct:(productid,productdetail)=>{
        return new Promise((resolve,reject)=>{
            productdetail.price=parseInt(productdetail.price)
            productdetail.amount=parseInt(productdetail.amount)
            productdetail.quantity=parseInt(productdetail.quantity)
            db.get().collection(constants.PRODUCTDATA).updateOne({_id:objectid(productid)},{
                $set:{name:productdetail.name,
                    size:productdetail.size,
                    price:productdetail.price,
                    amount:productdetail.amount,
                    quantity:productdetail.quantity,
                    catagory:productdetail.catagory
                }}).then((data)=>{
                    resolve(data)
                })
        })
    },

    deleteproduct:(productid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.PRODUCTDATA).remove({_id:objectid(productid)}).then(()=>{
                resolve()
            })
        })
    },

    

    addCategory:(categorydata)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.CATEGORYDATA).insertOne(categorydata).then(()=>{
                resolve()
            })
        })
    },

    getCategory:()=>{
        return new Promise(async(resolve,reject)=>{
           let catagory=await db.get().collection(constants.CATEGORYDATA).find().toArray()               
                resolve(catagory)          
        })
    },

    getCategoryuser:()=>{
        return new Promise(async(resolve,reject)=>{
           let catagory=await db.get().collection(constants.CATEGORYDATA).find({status:"true"}).toArray()          
                resolve(catagory)          
        })
    },

    blockCategory:(categoryid,categoryname)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.CATEGORYDATA).update({_id:objectid(categoryid)},{$set:{status:false}}).then(()=>{
                db.get().collection(constants.PRODUCTDATA).update({catagory:categoryname},{$set:{status:false}}).then(()=>{
                    resolve()
                })               
            })
        })
    },

    unblockCategory:(categoryid,categoryname)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.CATEGORYDATA).update({_id:objectid(categoryid)},{$set:{status:"true"}}).then(()=>{
                db.get().collection(constants.PRODUCTDATA).update({catagory:categoryname},{$set:{status:true}}).then(()=>{
                    resolve()
                })               
            })
        })
    },

    CheckCategory:(categorydata)=>{
        return new Promise(async(resolve,reject)=>{
            let check=[]
            let category=await db.get().collection(constants.CATEGORYDATA).findOne({name:categorydata.name})
            if(category){
                check.status=true
                resolve(check)
            }else{
                check.status=false
                resolve(check)
            }
        })
    },

    editCategory:(categoryid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.CATEGORYDATA).findOne({_id:objectid(categoryid)}).then((data)=>{
                resolve(data)
            })
        })
    },

    updateCategory:(category,categoryid)=>{
        return new Promise(async(resolve,reject)=>{
            let catego=await db.get().collection(constants.CATEGORYDATA).findOne({name:category.name})
            if(catego){
                resolve(0)
            }else{
                db.get().collection(constants.CATEGORYDATA).updateOne({_id:objectid(categoryid)},{
                    $set:{name:category.name}}).then((data)=>{
                        resolve(data)
                    })
            }    
        })
    },

    addAdimn:(admindata)=>{
        return new Promise(async(resolve,reject)=>{
            let admin=await db.get().collection(constants.ADMIN).findOne({name:admindata.name})
            if(!admin){
                db.get().collection(constants.ADMIN).insertOne(admindata)
                resolve({status:true})
            }else{
                resolve({status:false})
            }
            
        })
        
    },

    editAdimn:(admindata,adminId)=>{
        return new Promise(async(resolve,reject)=>{
            let admin=await db.get().collection(constants.ADMIN).findOne({name:admindata.name})
            if(!admin){
                db.get().collection(constants.ADMIN).updateOne({_id:objectid(adminId)},{$set:{name:admindata.name}}).then(()=>{
                    resolve({status:true})
                })
            }else{
                resolve({status:false})
            }
            
        })
        
    },

    getAdmin:()=>{
        return new Promise(async(resolve,reject)=>{
          let admindata=await db.get().collection(constants.ADMIN).find({admin:'admin'}).toArray()
          resolve(admindata)
        })
    },
    
    deleteAdmin:(adminId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.ADMIN).deleteOne({_id:objectid(adminId)}).then(()=>{
                resolve()
            })
        })
    },

    blockAdmin:(adminId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.ADMIN).updateOne({_id:objectid(adminId)},{$set:{status:false}}).then((data)=>{
                resolve(data)
            })
        })
    },

    unblockAdmin:(adminId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.ADMIN).updateOne({_id:objectid(adminId)},{$set:{status:true}}).then((data)=>{
                resolve(data)
            })
        })
    },

    getOrds:()=>{
        return new Promise(async(resolve,reject)=>{
        let data=await db.get().collection(constants.ORDER).find().toArray()
        resolve(data)
        })
    },

    getOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            
            let orderDetail= await db.get().collection(constants.ORDER).aggregate([
                //  {
                //      $project:{
                //         user:'$user',
                //          item:'$products.item',
                //          quanti:'$products.quantity',
                //          status:'$status',
                //          date:'$date',
                //          deliveryDetails:'$deliveryDetails',
                //          address:'$deliveryDetails.address',
                //          mobile:'$mobile',
                //          payment:'$paymentMethod',
                //          total:'$total'
                //      }
                //  },
                 {
                     $lookup:{
                         from:constants.PRODUCTDATA,
                         localField:'products.item',
                         foreignField:'_id',
                         as:'product'
                     }
                 },
                 {
                    $lookup:{
                        from:constants.USERDATA,
                        localField:'user',
                        foreignField:'_id',
                        as:'prod'
                    }
                 }
                 
                //  {
                //      $project:{
                //          item:1,quanti:1,status:1,prod:1,deliveryDetails:1,total:1,payment:1,address:1,mobile:1,date:1,product:1
                //      }
                //  },
                
             ]).toArray()
             resolve(orderDetail)
            
        })
    },

    cancelOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.ORDER).updateOne({_id:objectid(orderId)},{$set:{status:'cancelled'}}).then(()=>{
                resolve()
            })
        })
    },

   
}