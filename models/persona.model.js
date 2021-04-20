/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const personaSchema = new Schema({
    strNombre: {
        type: String,
        required: [true, 'Favor de insertar el nombre.']
    },
    strApellidos: {
        type: String,
        required: [true, 'Favor de insertar sus apellidos.']
    },
    strDireccion: {
        type: String,
        required: [true, 'Favor de insertar su dirección.']
    },
    nmbEdad: {
        type: Number,
        required: [true, 'Favor de insertar su edad.']
    },
    strTelefonos: {
        type: Array,
        required: [ true, 'Favor de ingresar telefonos']
    },
    strCurp: {
        type: String,
        required: [true, 'Favor de insertar su Curp.']
    },
    strPais: {
        type: String,
        required: [true, 'Favor de insertar su Pais.']
    },
    strCorreo: {
        type: String,
        required: [true, 'Favor de insertar su Correo.']
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
    collection: "persona"
});

module.exports = mongoose.model('Persona', personaSchema);