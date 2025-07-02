# Chat App – Frontend

Built with **React**, **Vite**, **Tailwind CSS**, and **Socket.io-client**.

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production

## Environment Variables

- `.env`
  ```
  VITE_BACKEND_URL=http://localhost:5000
  ```

## Main Dependencies

- `react`, `react-router-dom`, `axios`, `socket.io-client`, `react-hook-form`, `lucide-react`, `react-simple-typewriter`, `tailwindcss`

## Structure

- `src/components/` – Sidebar, ChatContainer, RightSidebar, etc.
- `src/pages/` – HomePage, LoginPage, SignupPage, ProfilePage
- `context/` – AuthContext, ChatContext

## Features

- User authentication (register/login)
- Real-time chat (Socket.io)
- Profile editing
- Media sharing
- Responsive UI

## API Usage

All API requests are proxied to `${VITE_BACKEND_URL}/api/v1/`.

## WebSocket

Connects to backend using `socket.io-client` with `userId` as query param.

---

## Customization

- Update theme via Tailwind classes in `index.css`
- Add new features in `src/components/` or `src/pages/`

---

## License

MIT
