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

    addProduct:(Productdata)=>{
         return new Promise((resolve,reject)=>{
            Productdata.price=parseInt(Productdata.price)
            Productdata.amount=parseInt(Productdata.amount)
            Productdata.quantity=parseInt(Productdata.quantity)
             db.get().collection(constants.PRODUCTDATA).insertOne(Productdata).then((data)=>{
                resolve(data.insertedId)
             })
         })
    },

    getproducts:()=>{
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

    deleteCategory:(categoryid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.CATEGORYDATA).remove({_id:objectid(categoryid)}).then(()=>{
                resolve()
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
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.CATEGORYDATA).updateOne({_id:objectid(categoryid)},{
                $set:{name:category.name}}).then(()=>{
                    resolve()
                })
        })
    }

   
}