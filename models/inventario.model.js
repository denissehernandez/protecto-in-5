/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventarioSchema = new Schema({
    idProducto: {
        type: mongoose.Types.ObjectId,
        ref: 'Producto'
    },
    nmbCantidad: {
        type: Number,
        required: [true, 'Favor de ingresar la cantidad.']
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
    collection: "inventario"
});

module.exports = mongoose.model('Inventario', inventarioSchema);