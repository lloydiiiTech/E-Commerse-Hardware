const db = require('../config/db');

// Get all products from tblproduct (Promise version)
const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tblproduct';
        db.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// Add product to cart from tblcart (Promise version)
const addProductToCart = (productId, userId, quantity) => {
    return new Promise((resolve, reject) => {
        const checkQuery = 'SELECT * FROM tblcart WHERE IdNum = ? AND ProductID = ?';
        db.query(checkQuery, [userId, productId], (err, results) => {
            if (err) return reject(err);

            if (results.length > 0) {
                // Product exists, update the quantity
                const existingQuantity = results[0].Quantity; // Get existing quantity
                const newQuantity = existingQuantity + quantity; // Increment quantity by the specified amount
                const updateQuery = 'UPDATE tblcart SET Quantity = ? WHERE CartID = ?';
                db.query(updateQuery, [newQuantity, results[0].CartID], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            } else {
                // Product does not exist, insert a new record
                const insertQuery = 'INSERT INTO tblcart (IdNum, ProductID, Quantity) VALUES (?, ?, ?)';
                db.query(insertQuery, [userId, productId, quantity], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
};


// Get products from the user's cart (Promise version)
const getCartProducts = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.CartID, p.ProductName, p.Picture, p.Price, c.Quantity
            FROM tblcart c
            JOIN tblproduct p ON c.ProductID = p.ProductID
            WHERE c.IdNum = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};


// Add new product to tblproduct (Promise version)
const addNewProduct = (productData) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tblproduct (ProductName, Picture, Price, NumberOfStock, Description, Category, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [
            productData.ProductName,
            productData.Picture,
            productData.Price,
            productData.NumberOfStock,
            productData.Description,
            productData.Category,
            productData.Status
        ], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};





const getProductById = (productId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tblproduct WHERE ProductID = ?';
        db.query(query, [productId], (err, results) => {
            if (err) reject(err);
            else if (results.length > 0) resolve(results[0]); // Return the first result (the product)
            else resolve(null); // Return null if no product found
        });
    });
};
const authenticateUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT Id, Username, Password FROM tableuser WHERE Username = ? AND Password = ?';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length > 0) {
                resolve(results[0]); // Return the first matched user
            } else {
                resolve(null); // No matching user found
            }
        });
    });
};

const addToReceipt = (productId, quantity, price, userId, orderID) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tblreceipt (ProductID, Quantity, Price, UserID, OrderID) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [productId, quantity, price, userId, orderID], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};
const addOrder = (productId, userId, quantity) => {
    return new Promise((resolve, reject) => {
        // Log the values for debugging
        console.log('Adding Order - Product ID:', productId, 'User ID:', userId, 'Quantity:', quantity);

        const checkQuery = 'SELECT Quantity FROM tblorders WHERE `FK-ProductID` = ? AND `FK-IdNum` = ? AND `Status` = "pending"';
        
        db.query(checkQuery, [productId, userId], (err, result) => {
            if (err) return reject(err);
            
            if (result.length > 0) {
                const existingQuantity = Number(result[0].Quantity); // Ensure it's a number
                const newQuantity = existingQuantity + Number(quantity); // Convert quantity to number and add
                
                const updateQuery = 'UPDATE tblorders SET Quantity = ? WHERE `FK-ProductID` = ? AND `FK-IdNum` = ? AND `Status` = "pending"';
                
                db.query(updateQuery, [newQuantity, productId, userId], (err, updateResult) => {
                    if (err) return reject(err);
                    resolve(updateResult);
                });
            } else {
                const insertQuery = 'INSERT INTO tblorders (`FK-ProductID`, `FK-IdNum`, `Quantity`, `Status`) VALUES (?, ?, ?, "pending")';
                
                // Ensure quantity is a valid number
                db.query(insertQuery, [productId, userId, Number(quantity)], (err, insertResult) => {
                    if (err) return reject(err);
                    resolve(insertResult);
                });
            }
        });
    });
};

const validateUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const checkUserQuery = 'SELECT * FROM tableuser WHERE Id = ?';
        db.query(checkUserQuery, [userId], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject(new Error('Invalid user ID'));
            resolve();
        });
    });
};


const transferSelectedCartItemsToReceipt = (userId, selectedProductIds, quantities) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
            return reject(new Error('No valid product IDs provided.'));
        }

        // Filter out empty or invalid product IDs
        const validProductIds = selectedProductIds.filter(id => id && id.trim() !== '');

        if (validProductIds.length === 0) {
            return reject(new Error('All product IDs are empty or invalid.'));
        }

        // Prepare placeholders for SQL query
        const placeholders = validProductIds.map(() => '?').join(', ');

        // SQL query to transfer items from cart to receipt
        const transferQuery = `
            INSERT INTO tblreceipt (UserID, ProductID, Quantity, Price)
            SELECT c.IdNum, c.ProductID, ?, p.Price
            FROM tblcart c
            JOIN tblproduct p ON c.ProductID = p.ProductID
            WHERE c.IdNum = ? AND c.ProductID IN (${placeholders});
        `;

        // Prepare parameters for the query
        const params = validProductIds.reduce((acc, productId) => {
            acc.push(quantities[productId], userId, productId); // Add quantity, userId, and productId
            return acc;
        }, []);

        // Begin transaction to ensure atomicity
        db.beginTransaction((err) => {
            if (err) {
                return reject(err);
            }

            // Execute the transfer query
            db.query(transferQuery, params, (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error transferring cart items:', err);
                        return reject(err);
                    });
                }

                // After successful insertion, delete items from the cart
                const deleteQuery = `DELETE FROM tblcart WHERE IdNum = ? AND ProductID IN (${placeholders});`;
                db.query(deleteQuery, [userId, ...validProductIds], (err, deleteResult) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error deleting cart items:', err);
                            return reject(err);
                        });
                    }

                    // Commit the transaction if both operations succeed
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Transaction commit failed:', err);
                                return reject(err);
                            });
                        }

                        console.log('Transaction completed successfully for selected items.');
                        resolve({ transferResult: result, deleteResult: deleteResult });
                    });
                });
            });
        });
    });
};


const getReceiptItems = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.ProductName, r.Quantity, p.Price
            FROM tblreceipt r
            JOIN tblproduct p ON r.ProductID = p.ProductID
            WHERE r.UserID = ?;
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

const getOrdersByUser = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT o.OrderID, p.ProductName, o.Quantity, p.Price, (o.Quantity * p.Price) AS total_price, o.Status
            FROM tblorders o
            JOIN tblproduct p ON o.\`FK-ProductID\` = p.ProductID
            WHERE o.\`FK-IdNum\` = ? AND o.Status = 'pending'
        `;
        db.query(query, [userId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};




module.exports = {
    getAllProducts,
    addProductToCart,
    getCartProducts,
    addNewProduct,
    getProductById,
    authenticateUser,
    addToReceipt,
    addOrder,
    validateUserId,
    getOrdersByUser,
   
    transferSelectedCartItemsToReceipt,
    getReceiptItems,
  
  
    


};
