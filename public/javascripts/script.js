

function addToCart(proId) {

    $.ajax({
        url: '/add-tocart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)
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
                document.getElementById('total').innerHTML = response.total
                document.getElementById(ProId).value = quantity + count
                document.getElementById(PriceId).innerHTML = price * (quantity + count)
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
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({

                url: '/admin/block-user/' + usrId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(userName + " has been Blocked").then((value) => {
                            location.reload()
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
                    name: value
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

function deleteCategory(catId,catName){
    swal({
        title: "Are you sure?",
        text: "You want to block " + catName,
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((value) => {
        if (value) {
            $.ajax({
                url: '/admin/delete-category/'+ catId,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        swal(catName + " has been Deleted").then((value) => {
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
        text: "You want to block " + prodName,
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
    console.log("ddddddddddddddddddddddddddd");
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkOut-form').serialize(),
        success:(response)=>{
            location.href="/conformation/"+response.id
            
        }

    })
})
