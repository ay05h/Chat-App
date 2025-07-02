# Chat App – Backend

Node.js, Express, MongoDB, Socket.io, Cloudinary.

## Scripts

- `npm run dev` – Start server with nodemon
- `npm start` – Start server

## Environment Variables

- `.env`
  ```
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017
  ACCESS_TOKEN_SECRET=your_access_secret
  REFRESH_TOKEN_SECRET=your_refresh_secret
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  CORS_ORIGIN=http://localhost:5173
  ```

## Main Dependencies

- `express`, `mongoose`, `dotenv`, `cors`, `cookie-parser`, `jsonwebtoken`, `bcrypt`, `socket.io`, `cloudinary`

## API Routes

See [above](../README.md#api-routes) for full list.

## WebSocket

- Uses `socket.io` for real-time messaging and online status.

## Structure

- `controllers/` – user.controller.js, message.controller.js
- `models/` – user.model.js, message.model.js
- `middlewares/` – auth.middleware.js
- `router/` – user.router.js, message.router.js
- `utils/` – Cloudinary.js, generateToken.js, ApiError.js, ApiResponse.js
- `db/` – index.js (MongoDB connection)
- `server.js` – Main server entry

---

## License

MIT
