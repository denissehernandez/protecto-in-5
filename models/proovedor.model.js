/*jshint esversion: 8*/
const mongoose = require('mongoose');
const { Schema } = mongoose;

const almacenModel = require('./almacen.model');


const proovedorSchema = new Schema({
    idPersona: {
        type: mongoose.Types.ObjectId,
        ref: 'Persona'
    },
    strEmpresa: {
        type: String,
        required: [true, 'Favor de insertar la Empresa.']
    },
    strDireccionEmpresa: {
        type: String,
        required: [true, 'Favor de ingresar la dirección de la empresa.']
    },
    ajsnAlmacen: [almacenModel.schema], 
    blnActivo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: "proovedor"
});

module.exports = mongoose.model('Proovedor', proovedorSchema);