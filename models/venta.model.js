/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;


const ventaSchema = new Schema({
    idPersona: {
        type: mongoose.Types.ObjectId,
        ref: 'Persona'
    },
    dteFecha: {
        type: Date,
        required: [true, 'Favor de insertar Fecha']
    },
    nmbCantidad: {
        type: Number,
        required: [true, 'Favor de insertar la cantidad.']
    },
    nmbTotalPrecio: {
        type: Number,
        required: [true, 'Favor de insertar el total.']
    },    
    strMetodoPago: {
        type: String,
        required: [true, 'Favor de ingresar el metodo de pago.']
    },
    idProducto: {
        type: mongoose.Types.ObjectId,
        ref: 'Producto'
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
    collection: "Venta"
});

module.exports = mongoose.model('Venta', ventaSchema);