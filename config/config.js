// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Base de Datos
if (process.env.NODE_ENV === 'dev') {
    process.env.URLDB = "mongodb+srv://admin:monse1234@cluster0.mvazo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
} else {
    process.env.URLDB = "mongodb+srv://admin:monse1234@cluster0.mvazo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
}

// Declaración de array de middleweres a usar en las APIS
process.middlewares = [];