/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ventaModel = require('./venta.model');
const inventarioModel = require('./inventario.model');

const tiendaSchema = new Schema({
    strNombre: {
        type: String,
        required: [true, 'Favor de ingresar el nombre.']
    },
    strDireccion: {
        type: String,
        required: [true, 'Favor de insertar la dirección.']
    },
    strTelefono: {
        type: Number,
        required: [true, 'Favor de ingresar el telefono.']
    },
    strUrlWeb: {
        type: String,
        required: [true, 'Favor de ingresar la URL.']
    },
    arrSucursales: {
        type: Array,
        required: [true, 'Favor de ingresar las sucursales.']
    },
    ajsnVenta: [ventaModel.schema], 
    ajsnInventario: [inventarioModel.schema], 
    arrProovedores: {
        type: Array,        
    },
    blnActivo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: "tienda"
});

module.exports = mongoose.model('Tienda', tiendaSchema);