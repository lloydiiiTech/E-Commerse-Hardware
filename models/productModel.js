const db = require('../config/db.js');

const ProductModel = {
    
    getAllProducts: (callback) => {
        const query = 'SELECT `ProductID`, `ProductName`, `Price`, `NumberOfStock`, `Description`, `Picture`, `Category` FROM `tblproduct`';
        db.query(query, callback);
    },

    
    addToCart: (cartData, callback) => {
        const query = `INSERT INTO tblcart (Quantity, IdNum, ProductID) VALUES (?, ?, ?)`; 
        db.query(query, [cartData.Quantity, cartData.IdNum, cartData.ProductID], callback);
    },

    
    getProductCart: (userId, callback) => {
        const query = `
            SELECT 
                c.CartID, 
                c.Quantity, 
                p.ProductID, 
                p.ProductName, 
                p.Price, 
                p.Picture 
            FROM 
                tblcart c 
            JOIN 
                tblproduct p ON c.ProductID = p.ProductID 
            WHERE 
                c.IdNum = ?`;
        db.query(query, [userId], callback);
    },

    
    deleteCartItem: (cartId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM tblcart WHERE CartID = ?', [cartId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    },

   




    updateCartQuantity: (productId, quantity, userId) => {
        console.log(`Updating Cart: ProductID=${productId}, Quantity=${quantity}, UserID=${userId}`);
        
        return new Promise((resolve, reject) => {
            db.query('UPDATE tblcart SET Quantity = ? WHERE IdNum = ? AND CartID = ?', [quantity, userId, productId], (error, results) => {
                if (error) {
                    console.error('Error updating tblcart:', error); // Log the error
                    return reject(error);
                }
                console.log('Update Results:', results); // Log the results
                if (results.affectedRows === 0) {
                    console.log('No rows updated. Check if the IdNum and ProductID are correct.');
                }
                resolve(results);
            });
        });
    },
    
    getProductIdByCartId: async (cartId) => {
        const query = `
            SELECT ProductID 
            FROM tblcart 
            WHERE CartID = ?`;
        
        try {
            const [results] = await db.promise().query(query, [cartId]);
            return results.length > 0 ? results[0].ProductID : null; // Return the ProductID or null if not found
        } catch (error) {
            throw new Error('Error fetching product ID by cart ID: ' + error.message);
        }
    },
    
    insertReceipt: (productId, quantity, userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO tblreceipt (ProductID, Quantity, UserID) VALUES (?, ?, ?)';
            db.query(sql, [productId, quantity, userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    getAllReceipts: async () => {
        const query = `
            SELECT 
                r.ReceiptID, r.ProductID, r.Quantity, r.UserID, r.OrderID,
                u.Id, u.FirstName, u.MiddleName, u.LastName, u.Suffix, 
                u.Email, u.ContactNumber, u.Province, u.City, u.Barangay, u.Street 
            FROM tblreceipt r
            LEFT JOIN tableuser u ON r.UserID = u.Id
            WHERE 1
        `;

        // Execute the query using a promise with await
        try {
            const [results] = await db.promise().query(query);
            console.log("Fetched Receipts: ", results); // Add this line for debugging
            return results;
        } catch (error) {
            throw new Error('Error fetching receipts: ' + error.message);
        }
    },

    getProductDetailsById: async (productId) => {
        const query = `
            SELECT ProductName, Price 
            FROM tblproduct 
            WHERE ProductID = ?`;
        
        try {
            const [results] = await db.promise().query(query, [productId]);
            if (results.length === 0) {
                console.log(`No product found for ProductID: ${productId}`); // Debugging line
                return null; // Return null if no product is found
            }
            return results[0]; // Return the first result
        } catch (error) {
            throw new Error('Error fetching product details: ' + error.message);
        }
    },

    placeOrder: (quantity, productId, userId) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO tblorders (Quantity, IdNum, ProductID, Status, UserID) VALUES (?, ?, ?, "Pending", ?)`;
            const values = [quantity, userId, productId, userId]; // Adjust order of values correctly
    
            // Execute the query
            db.query(query, values, (error, results) => {
                if (error) {
                    console.error('Error placing order:', error);
                    return reject(error);
                }
                resolve(results);
            });
        });
    },
    
    // In your ProductModel
    clearReceipt: () => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM tblreceipt';
            db.query(sql, (error, results) => {
                if (error) {
                    console.error('Error clearing receipt:', error);
                    return reject(error);
                }
                resolve(results);
            });
        });
    }

    
    

};

module.exports = ProductModel;
