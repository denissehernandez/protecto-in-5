/*jshint esversion: 9*/
const InventarioModel = require('../../models/inventario.model');
const TiendaModel = require('../../models/tienda.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const app = express();

const email = require('../../libraries/email');

// http://localhost:3000/api/inventario/
app.get('/', async(req, res) => {
    try {
                
        if (req.query.idInventario) req.queryMatch._id = req.query.idInventario;
        
        const inventario = await InventarioModel.find({ ...req.queryMatch });

        if (inventario.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontro el inventario en la base de datos.',
                cont: {
                    inventario
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Información obtenida correctamente.',
                cont: {
                    inventario
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener los inventarios.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/inventario/
app.post('/', async(req, res) => {

    try {
        const idTienda = req.query.idTienda;
        const inventario = new InventarioModel(req.body);

        let err = inventario.validateSync();

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

        const inventarioEncontrada = await TiendaModel.findOne({ strCategoria: { $regex: `^${inventario.strCategoria}$`, $options: 'i' } });
        if (inventarioEncontrada) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'El inventario que desea registrar ya se encuentra en uso.',
            cont: {
                Correo: inventarioEncontrada.strCorreo
            }
        });

        const nuevoInventario = await TiendaModel.findByIdAndUpdate(idTienda, { $push: { 'ajsnInventario': inventario } }, { new: true });
        const nuevo = await inventario.save();
        if (nuevoInventario.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar el inventario en la base de datos.',
                cont: {
                    inventario
                }
            });
        } else {
            email.sendEmail(req.body.strCorreo);
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    inventario
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar inventario.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/inventario/?idInventario=603939becf1db633f87595b2
app.put('/', async(req, res) => {
    try {

        const idInventario = req.query.idInventario;

        if (idInventario == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envió un id válido.',
                cont: 0
            });
        }

        req.body._id = idInventario;

        const inventarioEncontrada = await InventarioModel.findById(idInventario);

        if (!inventarioEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontró el inventario en la base de datos.',
                cont: inventarioEncontrada
            });

        const newinventario = new InventarioModel(req.body);

        let err = newinventario.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al insertar la inventario.',
                cont: {
                    newinventario
                }
            });
        }

        const inventarioActualizada = await InventarioModel.findByIdAndUpdate(idInventario, { $set: newinventario }, { new: true });

        if (!inventarioActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar el inventario.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizó el inventario correctamente.',
                cont: {
                    inventarioActualizada
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar el inventario.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/usuario/?idInventario=603939becf1db633f87595b2
app.delete('/', async(req, res) => {

    try {

        if (req.query.idInventario == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envió un id válido.',
                cont: 0
            });
        }

        idInventario = req.query.idInventario;
        blnActivo = req.body.blnActivo;

        const inventarioEncontrada = await InventarioModel.findById(idInventario);

        if (!inventarioEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontró el inventario en la base de datos.',
                cont: inventarioEncontrada
            });

        const inventarioActualizada = await InventarioModel.findByIdAndUpdate(idInventario, { $set: { blnActivo } }, { new: true });

        if (!inventarioActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar el inventario.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} el inventario correctamente.`,
                cont: {
                    inventarioActualizada
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar el inventario.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});


module.exports = app;