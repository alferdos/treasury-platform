Greetings,

We are thrilled to introduce SAHIM.io, our innovative platform set to revolutionize real estate investment through Real World Asset (RWA) tokenization.

What is RWA Tokenization?

Imagine a world where investing in real estate is as easy as buying shares in a company. RWA tokenization makes this vision a reality by converting physical real estate assets into digital tokens. This innovative approach allows for fractional ownership, enabling a broader range of investors to enter the real estate market without needing substantial capital. By leveraging blockchain technology, RWA tokenization ensures transparency, security, and efficiency in transactions. It simplifies the buying, selling, and management of property, reduces barriers to entry, and enhances liquidity, making lucrative real estate opportunities accessible to everyone.

How SAHIM.io Utilizes RWA Tokenization:

SAHIM.io harnesses the transformative power of RWA tokenization to revolutionize the real estate investment landscape. Our platform converts real estate and property listings into digital tokens, making fractional ownership a reality.

Here’s how SAHIM.io utilizes RWA tokenization to benefit investors:

Enhanced Accessibility: By tokenizing real estate assets, SAHIM.io enables investors to buy fractions of properties with minimal capital, opening up the market to a wider audience.

Increased Transparency: Blockchain technology ensures that every transaction is recorded on a secure, transparent ledger, providing investors with a clear view of property ownership and transaction history.

## Deployment Instructions

### Environment Variables

Before deploying, ensure the following environment variables are set:

- `CONNECTION_URL`: MongoDB connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName`)
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (production/development)

### Railway Deployment

1. Set the `CONNECTION_URL` environment variable in Railway dashboard
2. The Dockerfile will automatically build and deploy the application
3. Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` or Railway's IP addresses

### Local Development

1. Create a `.env` file with the required variables (see `.env.example`)
2. Run `npm install` to install dependencies
3. Run `npm start` or `node server.js` to start the server

