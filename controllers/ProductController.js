const path = require('path');
const ProductModel = require('../models/ProductModels');

// Display all products on homepage (using async/await)
const displayProducts = async (req, res) => {
    const userId = req.params.userId;
    try {
        const products = await ProductModel.getAllProducts();
        res.render('homepage', { products, userId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Add product to cart (using async/await)
const addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.body.user_id;

    try {
        // Validate the user ID
     

        // Insert the product into the cart
        await ProductModel.addProductToCart(product_id, user_id, parseInt(quantity));

        // Redirect to the cart view
        res.redirect(`/cart/${user_id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};





// Display products in the user's cart (using async/await)
const displayCart = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch products from the cart based on the userId
        const cartProducts = await ProductModel.getCartProducts(userId);
        
        // Render the cart.ejs file and pass the cartProducts and userId
        res.render('cart', { cartProducts, userId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


// Add new product with image upload (using async/await with multer)
const multer = require('multer');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
}).single('Picture');

// Add new product handler (using async/await)
const addProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.json({ message: err });
        }
        if (!req.file) {
            return res.json({ message: 'No file selected!' });
        }
        
        const productData = {
            ProductName: req.body.ProductName,
            Picture: req.file.filename,
            Price: req.body.Price,
            NumberOfStock: req.body.NumberOfStock,
            Description: req.body.Description,
            Category: req.body.Category,
            Status: req.body.Status
        };

        try {
            await ProductModel.addNewProduct(productData);
            res.redirect(`/products/${req.body.userId}`);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
};
const getHomePage = async (req, res) => {
    const userId = req.params.userId;  // Get userId from the URL

    try {
        const products = await ProductModel.getAllProducts();  // Fetch all products
        res.render('homepage', { products, userId });  // Pass userId to the view
    } catch (error) {
        console.error(error);  // Log any error for debugging
        res.status(500).send('Error loading homepage');  // Send error response
    }
};
const getProductDetails = async (req, res) => {
    const productId = req.params.productId; // Get productId from the URL
    const userId = req.params.userId;       // Get userId from the URL or session
    
    try {
        const product = await ProductModel.getProductById(productId); // Fetch product by productId
        if (product) {
            res.render('productDetails', { product, userId }); // Pass product and userId to view
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product details');
    }
};


const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Authenticate user with provided credentials
        const user = await ProductModel.authenticateUser(username, password);
        
        if (user) {
            req.session.userId = user.Id; 
            // If user is found, redirect to home page with userId
            res.redirect(`/homepage/${user.Id}`);
        } else {
            // If user is not found, send an error message
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error during login');
    }
};

const checkoutSelected = async (req, res) => {
    const userId = req.session.userId; // Assuming user ID is stored in the session
    const selectedProductIds = req.body.selectedProducts; // Array of selected product IDs
    const orderID = generateOrderId(); // You can implement a function to generate or retrieve the order ID

    try {
        for (const productId of selectedProductIds) {
            const product = await ProductModel.getProductById(productId); // Retrieve product details if needed
            const quantity = req.body.quantity; // If you want to allow different quantities for each product
            const price = product.Price; // Assuming you retrieve the price from the product details

            // Insert into tblreceipt
            await ProductModel.addToReceipt(productId, quantity, price, userId, orderID);
        }
        res.redirect('/thank-you'); // Redirect to a thank you or confirmation page
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
const placeOrder = async (req, res) => {
    const { product_id, quantity, user_id } = req.body;
    
    try {
        // Add order to the tblorders table
        await ProductModel.addOrder(product_id, user_id, parseInt(quantity));
        
        // Retrieve all orders for the user
        const orders = await ProductModel.getOrdersByUser(user_id);
        
        // Redirect to the order confirmation page, passing order details
        res.render('orderConfirmation', { orders, userId: user_id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


const checkoutAllItems = (req, res) => {
    const userId = req.session.userId; // Assuming userId is stored in the session
    ProductModel.transferCartToReceipt(userId, (err, result) => {
        if (err) {
            return res.status(500).send('Error processing checkout for all items.');
        }
        res.redirect('/confirmation'); // Redirect to a confirmation page
    });
};

const checkoutSelectedItems = async (req, res) => {
    const userId = req.params.userId;
    let selectedProductIds = req.body.selectedItems || [];

    // Remove empty or invalid values from selectedProductIds
    selectedProductIds = selectedProductIds.filter(id => id && id.trim() !== '');

    console.log('Filtered Product IDs:', selectedProductIds); // Should log only valid IDs

    
    if (selectedProductIds.length === 0) {
        return res.status(400).send('No products selected for checkout.');
    }

    try {
        await ProductModel.transferSelectedCartItemsToReceipt(userId, selectedProductIds);
        const receiptItems = await ProductModel.getReceiptItems(userId);
        res.render('confirmation', { userId, receiptItems });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error processing checkout or retrieving receipt items.');
    }
};






const getUserReceipt = (req, res) => {
    
    const userId = req.session.userId;  // Assuming userId is stored in the session

    ProductModel.getReceiptItems(userId, (err, orders) => {
        if (err) {
            res.status(500).send('Server Error');
        } else {
            // Pass both orders and userId to the EJS template
            res.render('confirmation', { orders, userId });
        }
    });
};
const getOrderConfirmation = async (req, res) => {
    const { product_id, quantity, user_id } = req.body;

    console.log('Request Body:', req.body); // Log the incoming request body

    // Check if quantity is present and is a number
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        console.log('Invalid Quantity:', quantity);
        return res.status(400).send('Invalid quantity');
    }

    try {
        await ProductModel.addOrder(product_id, user_id, parseInt(quantity));
        const orders = await ProductModel.getOrdersByUser(user_id);
        res.render('orderConfirmation', { orders, userId: user_id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


const displayOrder = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch products from the cart based on the userId
        const orderProducts = await ProductModel.getOrdersByUser(userId);
        
        // Render the cart.ejs file and pass the cartProducts and userId
        res.render('userOrder', {  orderProducts, userId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};



module.exports = {
    displayProducts,
    addToCart,
    displayCart,
    addProduct,
    getHomePage,
    getProductDetails,
    login,
    checkoutSelected,
    placeOrder,
    displayOrder,
    checkoutAllItems,
    checkoutSelectedItems,
    getUserReceipt,

    getOrderConfirmation

  
};
