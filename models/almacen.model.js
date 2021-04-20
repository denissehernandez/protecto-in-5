/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const almacenSchema = new Schema({
    idProducto: {
        type: mongoose.Types.ObjectId,
        ref: 'Producto'        
    },
    nmbCantidad: {
        type: Number,        
        required: [true, 'Favor de ingresar una cantidad.']
    },
    strCategoria: {
        type: String,
        required: [true, 'Favor de ingresar la categoria.']
    },
    arrFechaIngreso:  [
        { type: Date }
    ],
    blnActivo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: "almacen"
});

module.exports = mongoose.model('Almacen', almacenSchema);