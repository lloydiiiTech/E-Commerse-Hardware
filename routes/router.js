const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// Route for displaying products


router.get('/products/:userId', ProductController.displayProducts);

// Route for adding product to the cart
router.post('/cart/add', ProductController.addToCart);


// Route for displaying user's cart
router.get('/cart/:userId', ProductController.displayCart);

router.post('/checkout', ProductController.checkoutSelected);


// Route for adding a new product (with image upload)
router.post('/product/add', ProductController.addProduct);

// Route for displaying the homepage with products
router.get('/', (req, res) => {
    res.redirect('/homepage');
});
router.get('/homepage/:userId', ProductController.getHomePage);  // Handle dynamic userId


// Route for displaying product details
router.get('/product/:productId/:userId', ProductController.getProductDetails); // Make sure to pass userId


router.post('/login', ProductController.login);

router.get('/login', (req, res) => {
    res.render('login'); // Renders login.ejs (or the equivalent view)
});
router.post('/order', ProductController.placeOrder);

router.get('/userOrder/:userId', ProductController.displayOrder); 


 
// Route for displaying product details
router.get('/orderConfimation/:userId', ProductController.getProductDetails); // Make sure to pass userId

router.get('/confirmation/:userId', ProductController.getUserReceipt);

// Route for checking out selected items
router.post('/checkout-selected/:userId', ProductController.checkoutSelectedItems);
router.get('/orderConfirmation/:userId', ProductController.placeOrder);

router.get('/confirmation/', (req, res) => {
    res.render('confirmation'); // Make sure you have a confirmation.ejs file
});
module.exports = router;
