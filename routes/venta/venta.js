/*jshint esversion: 9*/
const VentaModel = require('../../models/venta.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const app = express();
const TiendaModel = require('../../models/tienda.model');

const email = require('../../libraries/email');

// http://localhost:3000/api/venta/
app.get('/', async(req, res) => {
    try {
        if (req.query.idVenta) req.queryMatch._id = req.query.idVenta;
        //if (req.query.termino) req.queryMatch.$or = Helper(["strNombre", "strCorreo"], req.query.termino);        

        const venta = await VentaModel.find({...req.queryMatch });

        if (venta.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron ventas en la base de datos.',
                cont: {
                    venta
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    venta
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener las ventas.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/venta/
app.post('/', async(req, res) => {

    try {

        const idTienda = req.query.idTienda;
        const venta = new VentaModel(req.body);

        let err = venta.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al insertar inventario.',
                cont: {
                    err
                }
            });
        }

        const ventaEncontrada = await TiendaModel.findOne({ strMetodoPago: { $regex: `^${venta.strMetodoPago}$`, $options: 'i' } });

        if (ventaEncontrada) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'La venta que desea registrar ya se encuentra en uso.',
            cont: {
                Correo: ventaEncontrada.strMetodoPago
            }
        });

        const ventaNueva = await TiendaModel.findByIdAndUpdate(idTienda, { $push: { 'ajsnVenta': venta } }, { new: true });        
        const nuevaventa = await venta.save();

        if (ventaNueva.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar a la venta en la base de datos.',
                cont: {
                    venta
                }
            });
        } else {
            email.sendEmail(req.body.strCorreo);
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    venta
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar a la venta.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/venta/?idVenta=603939becf1db633f87595b2
app.put('/', async(req, res) => {
    try {

        //const idTienda = req.query.idTienda;
        const idVenta = req.query.idVenta;

        // if (idVenta == '') {
        //     return res.status(400).send({
        //         estatus: '400',
        //         err: true,
        //         msg: 'Error: No se envio un id valido.',
        //         cont: 0
        //     });
        // }

        req.body._id = idVenta;

        // //const ventaEncontrada = await VentaModel.findOneAndUpdate({ '_id': idTienda, 'ajsnVenta._id': idVenta }, { $set: { 'ajsVenta.$.idPersona': venta.idPersona, 'ajsnVenta.$.dteFecha': venta.dteFecha, 'ajsnVenta.$.nmbCantidad': venta.nmbCantidad, 'ajsVenta.$.nmbTotalPrecio': venta.nmbTotalPrecio, 'ajsVenta.$.strMetodoPago': venta.strMetodoPago, 'ajsnVenta.$.idProducto': venta.idProducto} }, { new: true });

        // if (!ventaEncontrada)
        //     return res.status(404).send({
        //         estatus: '404',
        //         err: true,
        //         msg: 'Error: No se encontro la venta en la base de datos.',
        //         cont: ventaEncontrada
        //     });

        const newventa = new VentaModel(req.body);

        let err = newventa.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar la venta.',
                cont: {
                    err
                }
            });
        }

        const ventaActualizada = await VentaModel.findByIdAndUpdate(idVenta, { $set: newventa }, { new: true });

        if (!ventaActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar la venta.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizo la venta correctamente.',
                cont: {
                    ventaActualizada
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar la venta.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/usuario/?idVenta=603939becf1db633f87595b2
app.delete('/', async(req, res) => {

    try {

        if (req.query.idVenta == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        idVenta = req.query.idVenta;
        blnActivo = req.body.blnActivo;

        const ventaEncontrada = await VentaModel.findById(idVenta);

        if (!ventaEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro la venta en la base de datos.',
                cont: ventaEncontrada
            });

        const ventaActualizada = await VentaModel.findByIdAndUpdate(idVenta, { $set: { blnActivo } }, { new: true });

        if (!ventaActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar la venta.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} la venta correctamente.`,
                cont: {
                    ventaActualizada
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar la venta.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});


module.exports = app;