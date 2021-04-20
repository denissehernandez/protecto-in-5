/*jshint esversion: 9*/
const ProveedorModel = require('../../models/proovedor.model');
const TiendaModel = require('../../models/tienda.model');
const Helper = require("../../libraries/helper");
const express = require('express');
const app = express();
const ObjectId = require('mongoose').Types.ObjectId;
const db = require('mongoose');

const email = require('../../libraries/email');

// http://localhost:3000/api/proveedor/
app.get('/', async(req, res) => {
    try {
        if (req.query.idProveedor) req.queryMatch._id = ObjectId(req.query.idProveedor);
        //if (req.query.termino) req.queryMatch.$or = Helper(["strNombre", "strCorreo"], req.query.termino);

        const proveedor = await ProveedorModel.aggregate([
            {
                $match: {
                    ...req.queryMatch
                }
            },
            {
                $lookup: {
                    from: 'producto',
                    localField: 'ajsnAlmacen.idProducto',
                    foreignField: '_id',
                    as: 'producto'
                }
            },
            {
                $addFields:{
                  fecha: { $arrayElemAt: ["$ajsnAlmacen.arrFechaIngreso", 0]} 
                }
            },
            {
                $project: {
                    ultimoDiaIngreso: {
                        $trunc: {    
                            $divide: [{ $subtract: [new Date(), { $arrayElemAt: ['$fecha', 0]}] }, 1000 * 60 * 60 * 24]
                        }    
                    },
                    id: 1,
                    almacen: {
                        $map: {
                            input: '$ajsnAlmacen',
                            as: 'prueba',
                            in: {
                                '_id': '$$prueba._id',
                                product: {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$producto',
                                            as: 'pro',
                                            cond: {
                                                $eq: ['$$prueba.idProducto', '$$pro._id']
                                            }
                                        }
                                    }, 0 , ]
                                }
                            }
                        }
                    }
                }
            }
        ]);
        
        //console.log('jdknfskjfd');

        if (proveedor.length <= 0) {
            res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'No se encontraron proveedores en la base de datos.',
                cont: {
                    proveedor
                }
            });
        } else {
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Información obtenida correctamente.',
                cont: {
                    proveedor
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al obtener a los proveedores.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/proveedor/
app.post('/', async(req, res) => {

    try {
        const proveedor = new ProveedorModel(req.body);

        let err = proveedor.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al insertar el proovedor.',
                cont: {
                    err
                }
            });
        }

        const proveedorEncontrada = await ProveedorModel.findOne({ strEmpresa: { $regex: `^${proveedor.strEmpresa}$`, $options: 'i' } });
        if (proveedorEncontrada) return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'El proovedor que desea registrar ya se encuentra en uso.',
            cont: {
                Correo: proveedorEncontrada.strCorreo
            }
        });

        const nuevaproveedor = await proveedor.save();
        if (nuevaproveedor.length <= 0) {
            res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'No se pudo registrar el proveedor en la base de datos.',
                cont: {
                    proveedor
                }
            });
        } else {
            email.sendEmail(req.body.strCorreo);
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Información insertada correctamente.',
                cont: {
                    proveedor
                }
            });
        }
    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar a ek proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/proveedor/?idProveedor=603939becf1db633f87595b2
app.put('/', async(req, res) => {
    try {

        const idProveedor = req.query.idProveedor;

        if (idProveedor == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envió un id válido.',
                cont: 0
            });
        }

        req.body._id = idProveedor;

        const proveedorEncontrada = await ProveedorModel.findById(idProveedor);

        if (!proveedorEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontró el proveedor en la base de datos.',
                cont: proveedorEncontrada
            });

        const newproveedor = new ProveedorModel(req.body);

        let err = newproveedor.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al insertar el proveedor.',
                cont: {
                    err
                }
            });
        }

        const proveedorActualizada = await ProveedorModel.findByIdAndUpdate(idProveedor, { $set: newproveedor }, { new: true });

        if (!proveedorActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar actualizar el proveedor.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Success: Se actualizó el proveedor correctamente.',
                cont: {
                    proveedorActualizada
                }
            });
        }

    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al actualizar el proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
});

// http://localhost:3000/api/usuario/?idProveedor=603939becf1db633f87595b2
app.delete('/', async(req, res) => {

    try {

        if (req.query.idProveedor == '') {
            return res.status(400).send({
                estatus: '400',
                err: true,
                msg: 'Error: No se envió un id válido.',
                cont: 0
            });
        }

        idProveedor = req.query.idProveedor;
        blnActivo = req.body.blnActivo;

        const proveedorEncontrada = await ProveedorModel.findById(idProveedor);

        if (!proveedorEncontrada)
            return res.status(404).send({
                estatus: '404',
                err: true,
                msg: 'Error: No se encontró el proveedor en la base de datos.',
                cont: proveedorEncontrada
            });

        const proveedorActualizada = await ProveedorModel.findByIdAndUpdate(idProveedor, { $set: { blnActivo } }, { new: true });

        if (!proveedorActualizada) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Al intentar eliminar al proveedor.',
                cont: 0
            });
        } else {
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: `Success: Se a ${blnActivo === 'true'? 'activado': 'desactivado'} la proveedor correctamente.`,
                cont: {
                    proveedorActualizada
                }
            });
        }


    } catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error: Error al eliminar al proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }

});

app.patch('/', async(req, res) => {
    const session = await db.startSession();
    try{

        const proveedor = new ProveedorModel(req.body);

        let err = proveedor.validateSync();

        if (err) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el proveedor.',
                cont: {
                    err
                }
            });
        }

        const transaccionResultado = await session.withTransaction(async ()=>{
            await ProveedorModel.create([proveedor],{
                session: session

            })
        });
        if(transaccionResultado){
            const tienda = await TiendaModel.updateMany({},{$push:{'arrProovedores':proveedor._id}});
            res.status(200).send({
                estatus: '200',
                err: false,
                msg: 'Informacion insertada correctamente.',
                cont: {
                    proveedor
                }
            });
        }else{
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'Error: Error al Insertar el proveedor.',
                cont: 0
            });
        }

    }catch (err) {
        res.status(500).send({
            estatus: '500',
            err: true,
            msg: 'Error al registrar la proveedor.',
            cont: {
                err: Object.keys(err).length === 0 ? err.message : err
            }
        });
    }
    finally{
        session.endSession();
    }
});


module.exports = app;