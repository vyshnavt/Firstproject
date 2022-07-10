
function addToCart(proId) {
console.log("777777777777777777");
    $.ajax({
        url: '/add-tocart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)
                swal("Added to cart")
            }else if(response.user){
                location.href="/login"
            }

        }
    })
}

function addTowishlist(proId) {
    $.ajax({
        url: '/add-wishlist/'+proId,
        method: 'get',
        success: (response) => {
            console.log(response);
            let count = $('#wishlistcount').html()
           if(response.login){
            location.href='/login'
           }else if(response.status){
            count = parseInt(count) + 1
            
            
                $("#wishlistcount").html(count)
                document.getElementById("a"+proId).style.backgroundColor = "rgb(225 68 64)";
                document.getElementById("b"+proId).style.backgroundColor = "red";
           }
           else{
            count = parseInt(count) - 1
            
                $("#wishlistcount").html(count)
                document.getElementById("a"+proId).style.backgroundColor = "#828bb2"
           }

        }
    })
}

function changeQuantity(cartId, ProId, PriceId, price, count) {
    let quantity = parseInt(document.getElementById(ProId).value)
    count = parseInt(count)
    $.ajax({
        url: '/change-product-quantity',
        data: {
            cart: cartId,
            product: ProId,
            count: count,
            quantity: quantity

        },
        method: 'post',
        success: (response) => {
            if (response.remove) {
                swal("Product Removed From Cart.").then((value) => {
                    location.reload()
                });
            } else {
                console.log(response);
                document.getElementById('total').innerHTML = "₹"+ response.total
                document.getElementById('offertotal').innerHTML = "- ₹"+ response.offertotal
                document.getElementById('subtotal').innerHTML = response.total-response.offertotal-response.coupon
                document.getElementById(ProId).value = quantity + count
                document.getElementById(PriceId).innerHTML = "₹"+ price * (quantity + count)
            }
        }
    })
}

function blockUser(usrId, userName) {
    swal({
        title: "Are you sure?",
        text: "You want to block " + userName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((val) => {
        if (val) {
            $.ajax({
                url: '/admin/block-user/' + usrId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(userName + " has been Blocked").then((value) => {
                            location.reload()
                           // document.getElementById(usrId).innerHTML="Unblock"
                        });
                    }

                }
            })
        }
    });

}

function unblockUser(usrId, userName) {
    swal({
        title: "Are you sure?",
        text: "You want to Unblock " + userName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({

                url: '/admin/unblock-user/' + usrId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(userName + " has been Unblocked").then((value) => {
                            location.reload()
                        });
                    }

                }
            })
        }
    });

}

function deleteAdmin(adminId,adminName){
    swal({
        title: "Are you sure?",
        text: "You want to Delete " + adminName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/delete-admin/'+adminId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(adminName + " has been Deleted").then((value) => {
                            location.reload()
                        });
                    }

                }
            })
        }
    });
}

function blockAdmin(adminId,adminName){
    swal({
        title: "Are you sure?",
        text: "You want to block "+adminName,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((value) => {
        if (value) {
            $.ajax({
                url:'/admin/block-admin/'+adminId,
                method:'post',
                success:(responce)=>{
                    swal(adminName+" has been blocked!").then((val)=>{
                        location.reload()
                    })
                }
            })
        } 
      });
}

function unblockAdmin(adminId,adminName){
    swal({
        title: "Are you sure?",
        text: "You want to unblock "+adminName,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((value) => {
        if (value) {
            $.ajax({
                url:'/admin/unblock-admin/'+adminId,
                method:'get',
                success:(responce)=>{
                    swal(adminName+" has been unblocked!").then((val)=>{
                        location.reload()
                    })
                }
            })
        } 
      });
}
 

function deleteUser(UserName,UserId){
    swal({
        title: "Are you sure?",
        text: "You want to Delete " + UserName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/delete-user/'+UserId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(UserName + " has been Deleted").then((value) => {
                            location.reload()
                        });
                    }

                }
            })
        }
    });

}

function logout() {
    swal({
        title: "Are you sure?",
        text: "You want LogOut",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url: '/admin/logout',
                method: 'get',
                success: (responce) => {
                    location.reload()
                }
            })
        }
    });

}

function addCategory() {
    swal("Write something here:", {
        content: "input",
        button: "Add"
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/add-category',
                data: {
                    name: value,
                    status:true
                },
                method: 'post',
                success: (responce) => {
                    if(responce.already){
                        swal(`${value} Already existed`);  
                    }else{                      
                            swal(`${value} Category added`).then((val) => {
                                location.reload()
                            })
                    }
                   
                }
            })
        } else {
            swal(` Cannot be empty`)
        }
    });
}

function blockCategory(catId,catName){
    swal({
        title: "Are you sure?",
        text: "You want to block " + catName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/block-category/'+ catId+"/"+catName,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(catName + " has been Blocked").then((value) => {
                            location.reload()
                        });
                    }

                }
            })
        }
    });

}

function unblockCategory(catId,catName){
    swal({
        title: "Are you sure?",
        text: "You want to unblock " + catName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/unblock-category/'+ catId+"/"+catName,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(catName + " has been unblocked").then((value) => {
                            location.reload()
                        });
                    }

                }
            })
        }
    });

}

function deleteProduct(prodName,prodId){
    swal({
        title: "Are you sure?",
        text: "You want to delete " + prodName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/delete-product/'+prodId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(prodName + " has been Deleted").then((value) => {
                            location.reload()
                        });
                    }

                }
            })
        }
    });

}

function userLogout() {
    swal({
        title: "Are you sure?",
        text: "You want LogOut",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url: '/logout',
                method: 'get',
                success: (responce) => {
                    location.reload()
                }
            })
        }
    });

}

$("#checkOut-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/place-order-btn',
        method:'post',
        data:$('#checkOut-form').serialize(),
        success:(response)=>{
            if(response.success){
                location.href="/conformation/"+response.id
            }else if(response.paypal){
                location.href=response.link
            }else{              
                razorpayPayment(response)
            }
        }

    })
})

function razorpayPayment(order){
    var options = {
        "key": "rzp_test_5uPpdrMxeSFhjj", // Enter the Key ID generated from the Dashboard
        "amount":order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Brandsho",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id":order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
        
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                location.href="/conformation/"+order.receipt
            }else{
                swal("payment failed")
                
            }
        }
    })
}

function cancelOrder(orderId){
    console.log("lllllllllllllllllll");
    swal({
        title: "Are you sure?",
        text: "You want to cancel order!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((value) => {
        if (value) {
            $.ajax({
                url:'/admin/cancel-order/'+orderId,
                method:'get',
                success:(responce)=>{
                    swal("order has been canceled!").then((val)=>{
                        document.getElementById(orderId).innerHTML=""
                    })
                }
            })
        } 
      });
}

function removeFromwishlist(prodId){
    swal({
        title: "Are you sure?",
        text: "You want to Remove",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/remove-wishlist/'+prodId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                            location.reload()                       
                    }

                }
            })
        }
    });

}

function removeFromcart(cartId,prodId){
    swal({
        title: "Are you sure?",
        text: "You want to Remove",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/product-delete/'+cartId+'/'+prodId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                            location.reload()                       
                    }

                }
            })
        }
    });

}

function cancelOrder(orderId){
    swal({
        title: "Are you sure?",
        text: "You want to cancel the order ",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((value) => {
        if (value) {
            $.ajax({
                url:'/cancel-order/'+orderId,
                method:'get',
                success:(responce)=>{
                    swal(" has been cancelled!").then((val)=>{
                        document.getElementById(orderId).innerHTML="cancelled"
                    })
                }
            })
        } 
      });
}

$("#changeUserPassword-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/change-password',
        method:'post',
        data:$('#changeUserPassword-form').serialize(),
        success:(response)=>{
            if(response.status){
                swal("Password Changed!")
                location.reload()
            }else{
                swal("Invalid current password")
            }   
        }

    })
})

function deleteOffer(prodId){
    swal({
        title: "Are you sure?",
        text: "You want to delete this offer",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/delete-offer/'+prodId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal("Deleted").then((value) => {
                            location.reload()
                        });
                    }else{
                        swal("This Offer is in use, Can't be deleted").then((value) => {
                        });
                    }

                }
            })
        }
    });

}

function removeOffer(ProdId){
    swal({
        title: "Are you sure?",
        text: "You want to remove this offer",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((value) => {
        if (value) {
            $.ajax({
                url:'/admin/remove-offer-product/'+ProdId,
                method:'get',
                success:(responce)=>{
                    swal("Offer Removed!").then(()=>{
                        location.reload()
                    })
                    
                }
            })
        } 
      });
}

function removeFromBanner(productId) {
    swal({
        title: "Are you sure?",
        text: "You want to remove this product from Banner ",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({

                url: '/admin/remove-from-banner/' +productId,
                method: 'get',
                success: (response) => {
                        swal("Moved to Products").then((value) => {
                            location.reload()
                        });
                }
            })
        }
    });

}


function deleteCoupon(couponId) {
    swal({
        title: "Are you sure?",
        text: "You want to delete the coupon",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({

                url: '/admin/delete-coupon/'+couponId,
                method: 'get',
                success: (response) => {
                        swal("Coupon deleted").then((value) => {
                            location.reload()
                        });
                }
            })
        }
    });

}

function chanStatus(selected,orderId) {
    swal({
        title: "Are you sure?",
        text: "You want to Change status to " +selected,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({

                url: '/admin/change-status',
                data:{
                    selected,
                    orderId
                },
                method: 'post',
                success: (response) => {
                    if(response){
                        location.reload()
                    }
                }
            })
        }
    });

}

function deleteAddress(addressId) {
    swal({
        title: "Are you sure?",
        text: "You want to remove this Address",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({

                url: '/delete-address/'+addressId,
                method: 'get',
                success: (response) => {
                        location.reload()
                }
            })
        }
    });

}