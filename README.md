# Smartego landing (React + Vite)

    npm install
    npm run dev      # http://localhost:5173
    npm run build

API base URL: `VITE_API_URL` (default https://bcknd.smartego.org/api).
- GET  /user/packages?lang=en|ar  -> pricing section (lang is required)
- POST /user/contact-us  -> contact form
If the browser blocks requests (CORS), the backend must allow your site's origin.
