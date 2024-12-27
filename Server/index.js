const express = require('express');
const cors = require('cors');

// redis setup -> 
const axios = require('axios');
const redis = require('redis');

require("dotenv").config();

const app = express();
const port = 3000;


app.use(cors());

// now create a new redis client and connect to our local redis instance 
const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: "redis-14362.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
        port: 14362
    }
});

//now we run the connect function on our redis client and if your see the log it means you are connected to redis  
try {
    redisClient.connect(
        console.log('Connected to Redis')
    )
} catch (error) {
    console.log(error)
}

app.get("/", (req, res) => {
    res.send("Hello World!")
})

//normal endpoint for showing the fetching part that takes time
app.get("/get-Products" , async (req,res)=>{
    let products = await axios.get('https://dummyjson.com/products');
    res.send(products.data)
})

//endpoint that firstly check that if the data is already present in the cache and if yes we will display it from 
// there and if not found we will get it from the regular fetching process
app.get("/get-Products-viaRedis" , async (req,res)=>{
    let products;
//we start by calling the isReady function on our redis client and checking if our redis client is ready then we make a get call to 
//the redis client with our key in it 
if(redisClient.isReady){
  products = await redisClient.get("products")
}
//secondly we write a condition to check if it is hitting our redis or not 
if(products){
    console.log("Cache hit!");
    // we make use of json.parse as in redis everything is stored in form of key value pair 
    return res.send(JSON.parse(products));
}
//now we are out of the if condition it means that the data is not in the redis so we now need to load the data and store it in redis 
else{
    console.log("Cache miss!");
    products = await axios.get('https://dummyjson.com/products');
    if(redisClient.isReady){
        // we make use of setEx on our redis client and use the first parameter will be our key
        // second parameter will be the expiration time in seconds
        // third parameter will be the value which we are trying to store for that key and it should be in string format as in redis
        // the data is stored in key value pair format in strings 
       redisClient.setEx("products" ,15 ,JSON.stringify(products.data))
      }
}  
    res.send(products.data)
})



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
