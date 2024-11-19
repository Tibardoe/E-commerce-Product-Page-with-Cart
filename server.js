import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(express.json());

const db = new pg.Client({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});

db.connect();

app.get("/", async (req, res) => {
    const response = await db.query("SELECT * FROM product_listing");
    const result = response.rows;

    res.render("index.ejs", { products: result })
});

app.get("/product-details/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const response = await db.query("SELECT * FROM product_listing JOIN product_detail ON product_listing.id = product_id WHERE product_listing.id = $1", [id]);
        const result = response.rows;
        if (result.length > 0) {
            res.render("details page.ejs", {
                details: result[0]
            })
        } else {
            res.status(404).send("Product not found")
        }
    } catch (error) {
        console.log(`Error retrieving data: ${error}`)
        res.status(500).send("Internal Server Error");
    }

});

app.post("/add-item/:id", async (req, res) => {
    const productId = parseInt(req.params.id);
    const { cartCount } = req.body;


    if (isNaN(cartCount) || cartCount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid cart count" });
    }

    try {
        const productIncart = await db.query(
            "SELECT product_id, quantity, total_cost::numeric AS total_cost FROM cart WHERE product_id = $1",
            [productId]
        );
        if (productIncart.rows.length > 0) {
            const newQuantity = productIncart.rows[0].quantity + cartCount;
            const newTotalCost = newQuantity * productIncart.rows[0].total_cost / productIncart.rows[0].quantity;

            await db.query("UPDATE cart SET quantity = $1, total_cost = $2 WHERE product_id = $3", [newQuantity, newTotalCost, productId]);
        } else {
            const product = await db.query("SELECT price::numeric AS price from product_listing WHERE id = $1", [productId]);

            if (product.rows.length === 0) {
                return res.status(404).send("Product not found");
            }

            const price = product.rows[0].price;
            const totalCost = price * cartCount;

            await db.query("INSERT INTO cart (product_id, quantity, total_cost) VALUES ($1, $2, $3)", [productId, cartCount, totalCost]);

            res.status(200).json({ success: true, message: "Item added to cart" });
        };


    } catch (error) {
        console.error(`Error adding to cart: ${error}`);
        res.status(500).send("Internal Server Error");
    }

});

app.get("/cart", async (req, res) => {
    const response = await db.query(
        "SELECT cart.id AS cart_id, product_listing.product_name, cart.quantity, cart.total_cost, SUM(cart.total_cost) OVER() AS total_sum FROM cart JOIN product_listing ON cart.product_id = product_listing.id"
    );

    const result = response.rows;

    res.render("cart.ejs", {
        cart: result,
        totalCost: result[0]?.total_sum || 0
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});