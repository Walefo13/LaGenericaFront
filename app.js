const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const app = express();
const bcrypt= require('bcrypt');
const mongoose=require('mongoose');
const user = require('./public/user.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
const mongo_uri ='mongodb://localhost:27017/tienda'
const http = require("http");
mongoose.connect(mongo_uri,function(err){
    if(err){
        console.log('Inicia Log de errores de Mongo');
        throw  err;
        console.log('Finaliza Log de errores de Mongo');
    }
    else{
        console.log('se conectó a ${mongo_uri}');
    }
});

app.post('/register',(req,res) => { 
    
    const {username,password} =req.body;
    console.log('Entra a metodo post/register');
const  User=new user({username,password});
console.log('Declara variable user');
    User.save(err =>{
        if(err){
            res.status(500).send('Error al registrar usuario');
        }
        else{
            res.status(200).send('Usuario Registrado');
        }
    });
    
});
app.post('/authenticate',(req,res) => { 
    const {username,password} =req.body;
    user.findOne({username},(err,user) => {
        if(err){
            res.status(500).send('Error al autenticar usuario');
        }else if(!user){
            res.status(500).send('El usuario no existe');
        } else
        {
            user.isCorrectPassword(password,(err,result)=>{
                if(err){
                    res.status(500).send('Error al autenticar');
                }else if(result){
                    res.redirect('/products');
                }else{
                    res.status(500).send('usuario o clave incorrecta');
                }
            });
        }
    });
});


app.get('/products',(req,res) => {  
    res.status(200).sendFile(path.join(__dirname+'/public/products.html'));
});

app.get('/find',(req,res) => { 
  let data = "";
    http.get("http://localhost:8080/api/productos", (resp) => {
      // A chunk of data has been recieved. Append it with the previously retrieved chunk of data
      resp.on("data", (chunk) => {
        data += chunk;
      });
  
      // when the whole response is received, parse the result and Print it in the console
      resp.on("end", () => {
        res.send(JSON.parse(data));
        console.log(JSON.parse(data));
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
  });

 
app.post('/save',(req,res) => { 
    console.log('body: ',req.body);
    const {codigo_producto, nombre_producto,nit_proveedor, precio_compra, iva_compra, precio_venta} =req.body;
    const data = JSON.stringify({
        codigo_producto : codigo_producto,
        nombre_producto: nombre_producto,
        nit_proveedor: nit_proveedor,
        precio_compra: precio_compra,
        iva_compra: iva_compra,
        precio_venta: precio_venta,
    });
    
    const options = {
        host: "localhost",
        port: 8080,
        path: "/api/productos",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
        },
    };
      
      
      
    req = http.request(options, (requ) => {
        //status code of the request sent
        console.log("statusCode: ", res.statusCode);
        let result = "";
        // A chunk of data has been recieved. Append it with the previously retrieved chunk of data
        requ.on("data", (chunk) => {
          result += chunk;
        });
        //The whole response has been received. Display it into the console.
        requ.on("end", () => {
          res.send('Producto Registrado');
          console.log("Result is: " + result);
        });
    });
    //error if any problem with the request
    req.on("error", (err) => {
      res.status(500).send('Error en la peticion');
      console.log("Error: " + err.message);
    });
    //write data to request body
    req.write(data);
    //to signify the end of the request - even if there is no data being written to the request body.
    req.end();
});


app.listen(3000,() => {
        console.log('Servidor Inicia puerto 3000');
})
module.exports=app;