/*jshint esversion: 9*/
const ProductoModel = require('../../models/producto.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const app = express();

const email = require('../../libraries/email');

// http://localhost:3000/api/producto/
app.get('/', async(req, res) => {
    try {
        //if (req.query.idProducto) req.queryMatch._id = req.query.idProducto;
        //if (req.query.termino) req.queryMatch.$or = Helper(["strNombre", "strNombre"], req.query.termino);
        if (req.query.idProducto) req.queryMatch._id = req.query.idProducto;
        const producto = await ProductoModel.find({...req.queryMatch });

        if (producto.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron productos en la base de datos.',
                cont: {
                    producto
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    producto
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener a las productos.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/producto/
app.post('/', async(req, res) => {

    try {
        const producto = new ProductoModel(req.body);

        let err = producto.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el usuario.',
                cont: {
                    err
                }
            });
        }

        const productoEncontrado = await ProductoModel.findOne({ strNombre: { $regex: `^${producto.strNombre}$`, $options: 'i' } });
        if (productoEncontrado) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'El correo del producto que desea registrar ya se encuentra en uso.',
            cont: {
                Nombre: productoEncontrado.strNombre
            }
        });

        const nuevoproducto = await producto.save();
        if (nuevoproducto.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar a la producto en la base de datos.',
                cont: {
                    producto
                }
            });
        } else {
            email.sendEmail(req.body.strNombre);
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    producto
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar a la producto.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/producto/?idProducto=603939becf1db633f87595b2
app.put('/', async(req, res) => {
    try {

        const idProducto = req.query.idProducto;

        if (idProducto == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idProducto;

        const productoEncontrado = await ProductoModel.findById(idProducto);

        if (!productoEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro la producto en la base de datos.',
                cont: productoEncontrado
            });

        const newproducto = new ProductoModel(req.body);

        let err = newproducto.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar la producto.',
                cont: {
                    err
                }
            });
        }

        const productoActualizado = await ProductoModel.findByIdAndUpdate(idProducto, { $set: newproducto }, { new: true });

        if (!productoActualizado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar la producto.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizo el producto correctamente.',
                cont: {
                    productoActualizado
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar el producto.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/usuario/?idProducto=603939becf1db633f87595b2
app.delete('/', async(req, res) => {

    try {

        if (req.query.idProducto == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        idProducto = req.query.idProducto;
        blnActivo = req.body.blnActivo;

        const productoEncontrado = await ProductoModel.findById(idProducto);

        if (!productoEncontrado)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro la producto en la base de datos.',
                cont: productoEncontrado
            });

        const productoActualizado = await ProductoModel.findByIdAndUpdate(idProducto, { $set: { blnActivo } }, { new: true });

        if (!productoActualizado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar la producto.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} el producto correctamente.`,
                cont: {
                    productoActualizado
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar el producto.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});


module.exports = app;