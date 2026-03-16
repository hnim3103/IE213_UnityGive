import swaggerJsdoc from 'swagger-jsdoc';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UnityGive API',
      version: '1.0.0',
      description: 'REST API documentation for UnityGive fundraising platform',
    },
    components: {
      schemas: {
        Organization: {
          type: 'object',
          required: ['name', 'logo_url'],
          properties: {
            _id:        { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7d' },
            name:       { type: 'string', example: 'Green Earth Foundation' },
            logo_url:   { type: 'string', example: 'https://example.com/logo.png' },
            description:{ type: 'string', example: 'An environmental nonprofit.' },
            website:    { type: 'string', example: 'https://greenearth.org' },
            email:      { type: 'string', example: 'contact@greenearth.org' },
            is_verified:{ type: 'boolean', example: false },
            createdAt:  { type: 'string', format: 'date-time' },
            updatedAt:  { type: 'string', format: 'date-time' },
          }
        },
        Campaign: {
          type: 'object',
          required: ['organization', 'title', 'cover_image_url', 'story', 'target_amount'],
          properties: {
            _id:              { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7e' },
            organization:     { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7d' },
            title:            { type: 'string', example: 'Clean Water for Mekong Villages' },
            type:             { type: 'string', enum: ['CHILDREN','COMMUNITY','ENVIRONMENT','WILD_ANIMAL','MEDICAL','EDUCATION','DIFFICULT_CIRCUMSTANCES','ELDERLY_LIVING_ALONE','OTHER'], example: 'ENVIRONMENT' },
            cover_image_url:  { type: 'string', example: 'https://example.com/cover.jpg' },
            story:            { type: 'string', example: 'This campaign aims to...' },
            target_amount:    { type: 'number', example: 50000000 },
            current_amount:   { type: 'number', example: 12000000 },
            status:           { type: 'string', enum: ['DRAFT','ACTIVE','PAUSED','COMPLETED','CLOSED'], example: 'ACTIVE' },
            start_date:       { type: 'string', format: 'date-time' },
            end_date:         { type: 'string', format: 'date-time' },
            createdAt:        { type: 'string', format: 'date-time' },
            updatedAt:        { type: 'string', format: 'date-time' },
          }
        },
        Comment: {
          type: 'object',
          required: ['campaignId', 'userId', 'content'],
          properties: {
            _id:        { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c80' },
            campaignId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7e' },
            userId:     { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7f' },
            content:    { type: 'string', example: 'Great campaign, keep it up!' },
            createdAt:  { type: 'string', format: 'date-time' },
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'An internal error occurred' }
          }
        }
      }
    }
  },

  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);