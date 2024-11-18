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
    console.log(cartCount);


});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});