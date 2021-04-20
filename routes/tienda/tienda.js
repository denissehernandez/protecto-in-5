/*jshint esversion: 9*/
const TiendaModel = require('../../models/tienda.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const { ObjectId } = require('bson');
const app = express();

// http://localhost:3000/api/tienda/
app.get('/', async(req, res) => {
    try {
        if (req.query.idTienda) req.queryMatch._id = ObjectId(req.query.idTienda);
        if (req.query.termino) req.queryMatch.$or = Helper(["strNombre", "strDireccion", "strUrlWeb"], req.query.termino);

        const tienda = await TiendaModel.aggregate([
            {                
                $match: {
                    ...req.queryMatch
                }                
            },
            {
                    $lookup: {
                        from: 'producto',
                        localField: 'ajsnInventario.idProducto',
                        foreignField: '_id',
                        as: 'ProductoAlmacen'
                    }
                },
                {
                    $lookup: {
                        from: 'producto', 
                        localField: 'ajsnVenta.idProducto', 
                        foreignField: '_id',
                        as: 'ProductoCompra'
                    }
                },
                {
                    $lookup: {
                        from: 'persona', 
                        localField: 'ajsnVenta.idPersona', 
                        foreignField: '_id',
                        as: 'PersonaCompra'
                    }
                },
                {
                    $project: {
                        'id': 1,
                        'strNombre': 1,
                        'strDireccion': 1,                        
                        'InfoVenta': {
                            $map: {
                                input: '$ajsnVenta',
                                as: 'almacen',
                                in: {
                                    'Cantidad':'$$almacen.nmbCantidad',
                                    'PrecioTotal':'$$almacen.nmbTotalPrecio',
                                    'producto': {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$ProductoCompra',
                                                    as: 'almacenproducto',
                                                    cond: {
                                                        $eq: ['$$almacen.idProducto', '$$almacenproducto._id']
                                                    }
                                                }
                                            }, 0
                                        ]
            
                                    },
                                    'infoPersona': {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$PersonaCompra',
                                                    as: 'registro',
                                                    cond: {
                                                        $eq: ['$$almacen.idPersona', '$$registro._id']
                                                    }
                                                }
                                            }, 0
                                        ]
            
                                    },
                                    'FechaCompra':'$$almacen.dteFecha',
            
                                }
            
                            }
                        },
                        'InfoInventario': {
                            $map: {
                                input: '$ajsnInventario',
                                as: 'inventario',
                                in: {
                                    'Cantidad':'$$inventario.nmbCantidad',
                                    'productos': {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$ProductoAlmacen',
                                                    as: 'almacenproducto',
                                                    cond: {
                                                        $eq: ['$$inventario.idProducto', '$$almacenproducto._id']
                                                    }
                                                }
                                            }, 0
                                        ,]
            
                                    }
                                }
            
                            }
                        }
                    }
                }           
                
            ]);

        if (tienda.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron tiendas en la base de datos.',
                cont: {
                    tienda
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion obtenida correctamente.',
                cont: {
                    tienda
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener las tiendas.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/tienda/
app.post('/', async(req, res) => {

    try {
        const tienda = new TiendaModel(req.body);

        let err = tienda.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar la tienda.',
                cont: {
                    err
                }
            });
        }

        const tiendaEncontrada = await TiendaModel.findOne({ strDireccion: { $regex: `^${tienda.strDireccion}$`, $options: 'i' } });
        if (tiendaEncontrada) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: `La tienda que se desea insertar con la direccion ${tienda.strDireccion} ya se encuentra registrada en la base de datos.`,
            cont: 0
        });

        const nuevaTienda = await tienda.save();
        if (nuevaTienda.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar la tienda en la base de datos.',
                cont: {
                    nuevaTienda
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    nuevaTienda
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar la tienda.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/tienda/?idTienda=603e51f51a35a066388f0f28
app.put('/', async(req, res) => {
    try {

        const idTienda = req.query.idTienda;

        if (idTienda == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        req.body._id = idTienda;

        const tiendaEncontrada = await TiendaModel.findById(idTienda);

        if (!tiendaEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro la tienda en la base de datos.',
                cont: tiendaEncontrada
            });

        const newTienda = new TiendaModel(req.body);

        let err = newTienda.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al actualizar la tienda.',
                cont: {
                    err
                }
            });
        }

        const tiendaActualizada = await TiendaModel.findByIdAndUpdate(idTienda, { $set: newTienda }, { new: true });

        if (!tiendaActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar la tienda.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizo la persona correctamente.',
                cont: {
                    tiendaActualizada
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar la tienda.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/tienda/?idTienda=603e51f51a35a066388f0f28
app.delete('/', async(req, res) => {

    try {

        if (req.query.idTienda == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envio un id valido.',
                cont: 0
            });
        }

        idTienda = req.query.idTienda;
        blnActivo = req.body.blnActivo;

        const tiendaEncontrada = await TiendaModel.findById(idTienda);

        if (!tiendaEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontro la tienda en la base de datos.',
                cont: tiendaEncontrada
            });

        const tiendaActualizada = await TiendaModel.findByIdAndUpdate(idTienda, { $set: { blnActivo } }, { new: true });

        if (!tiendaActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar la tienda.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} la tienda correctamente.`,
                cont: {
                    tiendaActualizada
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar a la tienda.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});


module.exports = app;