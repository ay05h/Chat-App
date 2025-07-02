# Chat App

A modern real-time chat application with authentication, user profiles, and media sharing.

[Live Preview](https://chat-app-six-ecru.vercel.app)


---

## Project Structure

```
Chat-App/
├── client/   # React + Vite frontend
├── server/   # Node.js + Express backend
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```sh
git clone https://github.com/yourusername/Chat-App.git
cd Chat-App
cd client && npm install
cd ../server && npm install
```

---

## Running the Application

### Development

- **Backend:**
  ```sh
  cd server
  npm run dev
  ```
- **Frontend:**
  ```sh
  cd client
  npm run dev
  ```

---

## Environment Variables

- See `.env` files in both `client/` and `server/` for required variables.

---

## Main Dependencies

### Frontend (`client/package.json`)

- `react`
- `react-router-dom`
- `react-hook-form`
- `lucide-react`
- `react-simple-typewriter`
- `axios`
- `socket.io-client`
- `vite`
- `tailwindcss`

### Backend (`server/package.json`)

- `express`
- `mongoose`
- `dotenv`
- `cors`
- `cookie-parser`
- `jsonwebtoken`
- `bcrypt`
- `socket.io`
- `cloudinary`

---

## API ROUTES

### User Routes (`/api/v1/user`)

| Method | Endpoint            | Description          | Auth Required |
| ------ | ------------------- | -------------------- | ------------- |
| POST   | `/signup`           | Register new user    | No            |
| POST   | `/login`            | Login                | No            |
| POST   | `/logout`           | Logout               | Yes           |
| POST   | `/refresh-token`    | Refresh JWT tokens   | No            |
| PATCH  | `/update-profile`   | Update user profile  | Yes           |
| GET    | `/check`            | Check auth status    | Yes           |
| GET    | `/search?query=...` | Search users by name | Yes           |

### Message Routes (`/api/v1/messages`)

| Method | Endpoint                    | Description                    | Auth Required |
| ------ | --------------------------- | ------------------------------ | ------------- |
| GET    | `/users`                    | List users you've chatted with | Yes           |
| GET    | `/:userId`                  | Get messages with a user       | Yes           |
| PUT    | `/messages/:messageId/read` | Mark message as read           | Yes           |
| POST   | `/send/:userId`             | Send message (text/image)      | Yes           |

---

## WebSocket Events

- **Connect:**  
  Client connects with `userId` as query param.
- **getOnlineUsers:**  
  Server emits list of online user IDs.
- **newMessage:**  
  Server emits new message to receiver.
- **addToUserList:**  
  Server emits when a new user should be added to chat list.

---

## Folder Structure

### Frontend (`client/`)

- `src/components/` – UI components (Sidebar, ChatContainer, RightSidebar, etc.)
- `src/pages/` – Pages (HomePage, LoginPage, SignupPage, ProfilePage)
- `context/` – React Contexts for Auth and Chat
- `utils/` – Utility functions
- `index.html`, `vite.config.js`, `index.css` – Vite and Tailwind setup

### Backend (`server/`)

- `controllers/` – Route handlers (user, message)
- `models/` – Mongoose models (user, message)
- `middlewares/` – Auth middleware
- `router/` – Express routers (user, message)
- `utils/` – Utility functions (Cloudinary, token generation)
- `db/` – MongoDB connection
- `server.js` – Main server entry

---

## Example API Usage

**Register:**

```http
POST /api/v1/user/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "User Name",
  "password": "password123",
  "bio": "Hello, I'm User!",
  "profilePic": "<base64 or url>"
}
```

**Send Message:**

```http
POST /api/v1/messages/send/<userId>
Content-Type: application/json

{
  "text": "Hello!",
  "image": "<base64 or url>"
}
```

---
## Support

For issues, please open a GitHub issue.

## License

MIT
