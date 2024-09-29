// models/AdminModels.js
const db = require('../config/db');

const addProduct = (productData) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tblproduct SET ?';
        db.query(query, productData, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};




const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT `ProductID`, `ProductName`, `Price`, `NumberOfStock`, `Description`, `Picture`, `Category`, `Status` FROM `tblproduct` WHERE 1';
        db.query(query, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


const getProductById = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tblproduct WHERE ProductID = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]); // Return the product object
        });
    });
};
const updateProduct = (id, productData) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tblproduct SET ? WHERE ProductID = ?';
        
        // Log the query and data to be executed
        console.log("Executing query:", query, productData, id);

        db.query(query, [productData, id], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
};





// Function to delete a product
const deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM tblproduct WHERE ProductID = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

const updateProductStock = (ProductName, Quantity, Status) => {
    let updateQuery;
    
    if (Status === "Sale") {
        updateQuery = `
        UPDATE tblproduct 
        SET NumberOfStock = NumberOfStock - ?
        WHERE ProductName = ?
    `;
    } else if (Status === "Restock") {
        updateQuery = `
        UPDATE tblproduct 
        SET NumberOfStock = NumberOfStock + ?
        WHERE ProductName = ?
    `;
    } else if (Status === "Refund") {
        updateQuery = `
        UPDATE tblproduct 
        SET NumberOfStock = NumberOfStock + ?
        WHERE ProductName = ?
    `;
    }

    return new Promise((resolve, reject) => {
        db.query(updateQuery, [Quantity, ProductName], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};




const getOrders = (Status) => {
    const query = `
        SELECT 
            o.OrderID, 
            o.Quantity, 
            CONCAT(u.FirstName, ' ', u.MiddleName, ' ', u.LastName, ' ', u.Suffix) AS FullName,
            u.Email, 
            u.ContactNumber, 
            CONCAT(u.Province, ', ', u.City, ', ', u.Barangay, ', ', u.Street) AS Location,
            p.ProductName, 
            CAST(p.Price AS DECIMAL(10, 2)) AS Price,  -- Convert Price to a number
            (o.Quantity * CAST(p.Price AS DECIMAL(10, 2))) AS TotalPrice, 
            o.Status
        FROM 
            tblorders o
        JOIN 
            tableuser u ON o.\`FK-IdNum\` = u.Id
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.Status = ?;
    `;

    return new Promise((resolve, reject) => {
        // Pass Status as a parameter to the query
        db.query(query, [Status], (err, results) => {
            if (err) {
                console.error('SQL error:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};


const updateOrderStatus = (orderID, Status) => {
    const updateQuery = `UPDATE tblorders SET Status = ? WHERE OrderID = ?`;
    
    return new Promise((resolve, reject) => {
        db.query(updateQuery, [Status, orderID], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

const getOrderDetails = (orderID) => {
    const query = `
        SELECT 
            o.OrderID, 
            o.Quantity, 
            CONCAT(u.FirstName, ' ', u.MiddleName, ' ', u.LastName, ' ', u.Suffix) AS FullName,
            u.Email, 
            u.ContactNumber, 
            CONCAT(u.Province, ', ', u.City, ', ', u.Barangay, ', ', u.Street) AS Location,
            p.ProductName, 
            CAST(p.Price AS DECIMAL(10, 2)) AS Price,  
            (o.Quantity * CAST(p.Price AS DECIMAL(10, 2))) AS TotalPrice, 
            o.Status
        FROM 
            tblorders o
        JOIN 
            tableuser u ON o.\`FK-IdNum\` = u.Id
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.OrderID = ?;`;

    return new Promise((resolve, reject) => {
        db.query(query, [orderID], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return resolve(null); // No order found
            }
            resolve(results[0]); // Return the first result
        });
    });
};






const getinvetDetails = (orderID) => {
    const query = `
        SELECT 
            p.ProductName, 
            o.Quantity
        FROM 
            tblorders o
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.OrderID = ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [orderID], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0]);
        });
    });
};

const insertIntoInventory = ({ ProductName, Quantity, Changes_type, Date }) => {
    const insertQuery = `
        INSERT INTO tblprodinv (ProductName, Quantity, Changes_type, Date) 
        VALUES (?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
        db.query(insertQuery, [ProductName, Quantity, Changes_type, Date], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};





const getREfundStatus = (Status) => {
    const query = `
        SELECT 
            o.OrderID, 
            o.Quantity, 
            CONCAT(u.FirstName, ' ', u.MiddleName, ' ', u.LastName, ' ', u.Suffix) AS FullName,
            u.Email, 
            u.ContactNumber, 
            CONCAT(u.Province, ', ', u.City, ', ', u.Barangay, ', ', u.Street) AS Location,
            p.ProductName, 
            CAST(p.Price AS DECIMAL(10, 2)) AS Price,  -- Convert Price to a number
            (o.Quantity * CAST(p.Price AS DECIMAL(10, 2))) AS TotalPrice, 
            o.Status
        FROM 
            tblorders o
        JOIN 
            tableuser u ON o.\`FK-IdNum\` = u.Id
        JOIN 
            tblproduct p ON o.\`FK-ProductID\` = p.ProductID
        WHERE 
            o.Status = "Refund" OR o.Status = "Cancel";
    `;

    return new Promise((resolve, reject) => {
        // Pass Status as a parameter to the query
        db.query(query, [Status], (err, results) => {
            if (err) {
                console.error('SQL error:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};


const getInventory = (searchQuery) => {
    const query = `
        SELECT InventoryID, ProductName, Quantity, Changes_type, Date
        FROM tblprodinv
        WHERE ProductName LIKE ?
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [`%${searchQuery}%`], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Model to download inventory
// In your Product model
const downloadInventory = (searchQuery) => {
    const query = `
        SELECT InventoryID, ProductName, Quantity, Changes_type, Date
        FROM tblprodinv
        WHERE ProductName LIKE ? OR Changes_type LIKE ?
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};


    // Model to clear inventory
    const clearInventory = () => {
        const query = `DELETE FROM tblprodinv WHERE 1`;
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    };


const getSalesData = (callback) => {
    const sql = "SELECT `ProductName`, `Quantity`, `Date` FROM `tblprodinv` WHERE `Changes_type` = 'Sale'";
    db.query(sql, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};
    
module.exports = { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct, updateProductStock,
    insertIntoInventory, updateOrderStatus, getOrderDetails, 
    getinvetDetails, getOrders, getREfundStatus,getInventory, downloadInventory, clearInventory, getSalesData};