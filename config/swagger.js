const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API Documentation - Assignment 2',
        version: '1.0.0',
        description: 'Documentation for API project using JWT and role-based authorization',
    },
    servers: [
        {
            url: 'http://localhost:3009',
            description: 'Local server',
        },
    ],
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    username: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                },
            },
        },
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js', './controller/*.js'],
};

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
