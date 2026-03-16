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
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      responses: {
        NotFound: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalError: {
          description: 'An internal error occurred',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      },
      schemas: {
        Organization: {
          type: 'object',
          required: ['name', 'adminUserId'],
          properties: {
            _id: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7d' },
            name: { type: 'string', example: 'Green Earth Foundation' },
            description: { type: 'string', example: 'An environmental nonprofit.' },
            licenseNumber: { type: 'string', example: 'ORG-123456789' },
            website: { type: 'string', example: 'https://greenearth.org' },
            adminUserId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6a12' },
            isVerified: { type: 'boolean', example: false },
            logo: { type: 'string', example: 'https://example.com/logo.png' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Campaign: {
          type: 'object',
          required: ['title', 'description', 'goalAmount', 'image', 'orgId', 'creatorId'],
          properties: {
            _id: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7e' },
            title: { type: 'string', example: 'Clean Water for Mekong Villages' },
            description: { type: 'string', example: 'This campaign aims to provide clean water...' },
            goalAmount: { type: 'number', example: 50000000 },
            currentAmount: { type: 'number', example: 12000000 },
            contractAddress: { type: 'string', example: '0x123456789abcdef...' },
            category: {
              type: 'string',
              enum: ['CHILDREN', 'COMMUNITY', 'ENVIRONMENT', 'WILD_ANIMAL', 'MEDICAL', 'EDUCATION', 'DIFFICULT_CIRCUMSTANCES', 'ELDERLY_LIVING_ALONE', 'OTHER'],
              default: 'OTHER'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
              default: 'DRAFT'
            },
            image: { type: 'string', example: 'https://example.com/cover.jpg' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            orgId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7d' },
            creatorId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6a12' },
            ambassadors: {
              type: 'array',
              items: { type: 'string' },
              example: ['664f1b2c9a1e2d3f4a5b6a13']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6a12' },
            email: { type: 'string', format: 'email', example: 'donor@example.com' },
            walletAddress: { type: 'string', example: '0xabcdef123456...' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['donor', 'organization', 'admin'], default: 'donor' },
            phone: { type: 'string', example: '+1234567890' },
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
            isVerified: { type: 'boolean', example: false },
            status: { type: 'string', enum: ['active', 'suspended', 'deleted'], default: 'active' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CampaignUpdate: {
          type: 'object',
          required: ['campaignId', 'title', 'content'],
          properties: {
            _id: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c8a' },
            campaignId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7e' },
            title: { type: 'string', example: 'Phase 1 Completed!' },
            content: { type: 'string', example: 'We have successfully installed the first water pump...' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Donation: {
          type: 'object',
          required: ['campaignId', 'donorId', 'amount', 'method'],
          properties: {
            _id: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6d11' },
            campaignId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7e' },
            donorId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6a12' },
            amount: { type: 'number', example: 50 },
            currency: { type: 'string', default: 'USD' },
            method: { type: 'string', enum: ['fiat', 'crypto'] },
            txHash: { type: 'string', example: '0xabc123def456...' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
            message: { type: 'string', example: 'Keep up the good work!' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          required: ['campaignId', 'userId', 'content'],
          properties: {
            _id: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6e22' },
            campaignId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7e' },
            userId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6a12' },
            content: { type: 'string', example: 'This is such a great initiative.' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Favorite: {
          type: 'object',
          required: ['userId', 'campaignId'],
          properties: {
            _id: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6f33' },
            userId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6a12' },
            campaignId: { type: 'string', example: '664f1b2c9a1e2d3f4a5b6c7e' }
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