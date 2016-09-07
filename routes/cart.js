var express = require('express'),
    Products = require('./../models/product.js');
    path = require('path');
var Order =require('./../models/order.js');
var router = express.Router();
var Cart = require('./../models/cart.js');

router.use(express.static(path.join(__dirname, '/../public')));

router.get('/products/:id', function(req, res, next) {

    var productId=req.params.id;
    var cart =new Cart(req.session.cart ? req.session.cart: {items: {}});

    Products.findById(productId, function(err,products){
    if(err){
        return res.redirect('/');
      }

        cart.add(products, products.id);
        req.session.cart = cart;

        console.log(req.session.cart);
        res.redirect('/products');

    });
});

router.get('/shopping-cart', function(req,res,next){
    if(!req.session.cart){
        return res.redirect('/');
    }

    var cart = new Cart(req.session.cart);
    console.log("in the shopping cart");
    //res.json({products:cart.generateArray(),totalPrice:cart.totalPrice});
    res.render('shoppingCart.ejs', {products: cart.generateArray(), totalPrice: cart.totalPrice,  user: req.user});
});

router.get('/reduce/:id', function(req,res,next){
  var productId=req.params.id;
  var cart =new Cart(req.session.cart ? req.session.cart:{});
  cart.reduceByOne(productId);
  req.session.cart=cart;
  console.log("product deleted");
  res.redirect('/add-to-cart/shopping-cart');  
});


router.get('/checkout',function(req,res,next){
    if(!req.session.cart){
        return res.redirect('/shopping-cart');
    }

    var cart = new Cart(req.session.cart);
    //res.json({total:cart.totalPrice});
     res.render('checkout.ejs', {totalPrice: cart.totalPrice,  user: req.user});

     
});

router.post('/checkout',function(req,res,next){
    if(!req.session.cart){
        return res.redirect('/');
    }

 var cart = new Cart(req.session.cart);
    
var order = new Order({
       user: req.user,
       cart: cart,
       address: req.body.address,
       name: req.body.name
  });
    order.save(function(err,result){
       req.flash('success', 'successly bought product');

       req.session.cart =null;
       res.render('order.ejs', {order: order, user: req.user});
   });
});
module.exports = router;
