const express = require('express')
const app = express();
const cors = require('cors');

app.use(express.json())
app.use(cors());
app.options('*', cors());
const port = 5000;
const MONGO_URI = 'mongodb://localhost:27017';

const { MongoClient } = require('mongodb');

const client = new MongoClient(MONGO_URI);

async function main() {
    client.connect().then(
        r => {
            console.log("Successfully connected to mongodb..");
        },
        e => {
            console.log("Didn't connect to mongodb: " + e);
        }
    );
}
main();

app.get('/api/users', (req, res) => {
    let cursor = client.db("dbank").collection("accounts").find();
    cursor.toArray().then(accounts => {
        res.json(accounts);
    });
});

app.get('/api/users/:address', (req, res) => {
    client.db("dbank").collection("accounts").findOne({ address: req.params.address })
    .then(user => {
        res.json(user);
    })
});

app.post('/api/users/:address/txs', (req, res) => {
    client.db("dbank").collection("accounts").updateOne(
        { address: req.params.address },
        { 
            $push: {
                transactions: req.body.hash,
            }
        }
    ).then(result => res.json(result));
});

app.get('/api/users/:address/txs', (req, res) => {
    const query = { address: req.params.address };
    const options = { projection: { _id: 0, transactions: 1 } };
    client.db("dbank").collection("accounts").findOne(query)
	.then(result => res.json(result));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});
