const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const cors = require('cors')
const path = require('path')
const {MongoClient, ObjectId} = require('mongodb')

const url = 'mongodb://127.0.0.1:27017'
const client = new MongoClient(url)

app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get('/rest-api', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
} )
async function getProducts(res, id = false) {
    try {
        await client.connect()
        if(id) {
            const data = await client.db('rest-api').collection('products').find({_id: new ObjectId(id)}).sort({'_id':-1}).toArray()
            res.send(data)
        } else {
            const data = await client.db('rest-api').collection('products').find({}).sort({'_id':-1}).toArray()
            res.send(data)
        }
    } finally {
        client.close()
    }
}
app.get('/rest-api/data', (req, res) => {
    getProducts(res)
})

app.post('/rest-api/insert', (req, res) => {
    const productData = req.body
    async function insertProduct(){
        try{
            await client.connect()
            await client.db('rest-api').collection('products').insertOne({product: productData.productName, category: productData.category, price: productData.price, qty: productData.qty})
            res.send('<h1>Data added to database</h1>')
        } finally {
            client.close()
        }
    }
    insertProduct()
})

app.get('/rest-api/products/:id', (req, res) => {
    let id = req.params.id
    getProducts(res, id)
})

app.post('/rest-api/products/update/:id', (req, res) => {
    const id = req.params.id
    const productData = req.body
    async function updateProduct(){
        try{
            await client.connect()
            await client.db('rest-api').collection('products').updateOne({_id: new ObjectId(id)}, {$set: {product: productData.newProductName, category: productData.newCategory, price: productData.newPrice, qty: productData.newQty}})
            res.send('<h1>Product Data is updated</h1>')
        } finally {
            client.close()
        }
    }
    updateProduct()
})

app.post('/rest-api/products/delete/:id', (req, res) => {
    const id = req.params.id
    async function deleteProduct(){
        try{
            await client.connect()
            await client.db('rest-api').collection('products').deleteOne({_id: new ObjectId(id)})
            res.send('<h1>Product Data is Deleted</h1>')
        } finally {
            client.close()
        }
    }
    deleteProduct()
})

app.listen(port, () => {
    console.log(`server listening on port ${port}`)
})