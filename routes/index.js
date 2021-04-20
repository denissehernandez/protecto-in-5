/*jshint esversion: 8*/
const express = require('express');
const app = express();

app.use('/almacen', require('./almacen/almacen'));
app.use('/inventario', require('./inventario/inventario'));
app.use('/persona', require('./persona/persona'));
app.use('/producto', require('./producto/producto'));
app.use('/proovedor', require('./proveedor/proovedor'));
app.use('/tienda', require('./tienda/tienda'));
app.use('/venta', require('./venta/venta'));


module.exports = app;