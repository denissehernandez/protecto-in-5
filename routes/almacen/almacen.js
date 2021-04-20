/*jshint esversion: 9*/
const AlmacenModel = require('../../models/almacen.model');
const ProveedorModel = require('../../models/proovedor.model');
//const ProductoModel = require('../../models/producto.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const app = express();

const email = require('../../libraries/email');
const { ObjectID } = require('bson');


app.get('/', async(req, res) => {
    try {
    
        if (req.query.idAlmacen) req.queryMatch._id = req.query.idAlmacen;

        const almacen = await AlmacenModel.find({ ...req.queryMatch });        

        if (almacen.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron almacenes en la base de datos.',
                cont: {
                    almacen
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    almacen
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener el almacen.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});


app.post('/', async(req, res) => {

    try {

        const idProveedor = req.query.idProveedor;

        if (idProveedor == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        const almacen = new AlmacenModel(req.body);

        let err = almacen.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el almacen.',
                cont: {
                    err
                }
            });
        }
 
        const almacenEncontrado = await ProveedorModel.findOne({ strCategoria: { $regex: `^${almacen.strCategoria}$`, $options: 'i' } });
        if (almacenEncontrado) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'El almacen que quiere registrar ya existe.',
            cont: {
                Correo: almacenEncontrado.strCategoria
            }        
        });        

        const nuevoAlmacen = await ProveedorModel.findByIdAndUpdate(idProveedor, { $push: { 'ajsnAlmacen': almacen } }, { new: true });
        const Alma = await almacen.save();

        
        if (nuevoAlmacen.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar el almacen en la base de datos.',
                cont: {
                    almacen
                }
            });
        } else {
            email.sendEmail(req.body.strCategoria);
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    almacen
                }
            });
        }
    } catch (err) {        
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar el almacen.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err                
            }
        });        
    }
});


app.put('/', async(req, res) => {
    try {

        const idAlmacen = req.query.idAlmacen;
        /*/const idProducto = req.query.idProducto;

        if (idProducto == undefined) {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }*/

        if (idAlmacen == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idAlmacen;

        const almacenEncontrado = await AlmacenModel.findById(idAlmacen);

        if (!almacenEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro el almacen en la base de datos.',
                cont: almacenEncontrado
            });

        const newAlmacen = new AlmacenModel(req.body);

        let err = newAlmacen.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el almacen.',
                cont: {
                    err
                }
            });
        }

        const almacenActializado = await AlmacenModel.findByIdAndUpdate(idAlmacen, { $set: newAlmacen }, { new: true });

        if (!almacenActializado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar el almacen.',
                cont: 0
            });
        } else {
            //const newProducto = await ProductoModel.findByIdAndUpdate(idProducto, { $push: arr})
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizo el almacen correctamente.',
                cont: {
                    almacenActializado
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar el almacen.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});


app.delete('/', async(req, res) => {

    try {

        if (req.query.idAlmacen == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        idAlmacen = req.query.idAlmacen;
        blnActivo = req.body.blnActivo;

        const almacenEncontrado = await AlmacenModel.findById(idAlmacen);

        if (!almacenEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro el almacen en la base de datos.',
                cont: almacenEncontrado
            });

        const almacenActualizado = await AlmacenModel.findByIdAndUpdate(idAlmacen, { $set: { blnActivo } }, { new: true });

        if (!almacenActualizado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar el almacen.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} el almacen correctamente.`,
                cont: {
                    almacenActualizado
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar el almacen.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});


module.exports = app;