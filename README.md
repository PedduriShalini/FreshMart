# FreshMart – Grocery E-Commerce Platform

FreshMart is a full-stack grocery e-commerce web application built using the **MERN stack (MongoDB, Express.js, React.js, and Node.js)**. It provides an online shopping experience where customers can explore grocery products, manage their shopping carts, and place orders.

The application also includes an admin dashboard for managing products, categories, customers, orders, and reviews.

## Features

### Customer Features
- User registration and login
- Browse grocery products
- Explore products by category
- Search and filter products
- View individual product details
- Add products to the shopping cart
- Manage cart quantities
- Checkout and place orders
- View order history
- Submit product reviews

### Admin Features
- Admin authentication
- Admin dashboard
- Manage products (Create, Read, Update, Delete)
- Manage product categories
- View and manage customer information
- Manage customer orders
- Manage product reviews

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS, Bootstrap |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| API Communication | REST APIs |
| File Uploads | Multer |
| Development Tools | VS Code, Git, npm |

## Project Structure

```text
FreshMart/
│
├── client/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── createAdmin.js
│   ├── seedCategories.js
│   ├── seedProducts.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PedduriShalini/FreshMart.git
```

### 2. Navigate to the Project

```bash
cd FreshMart
```

### 3. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and configure your environment variables.

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Use the actual variable names required by the backend source code.

Start the backend:

```bash
npm start
```

### 4. Setup the Frontend

Open another terminal:

```bash
cd FreshMart/client
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Application Screenshots

Screenshots of the application will be added here.

### Homepage
<!-- Add homepage screenshot here -->

### Product Listing
<!-- Add product listing screenshot here -->

### Shopping Cart
<!-- Add shopping cart screenshot here -->

### Admin Dashboard
<!-- Add admin dashboard screenshot here -->

## Future Enhancements

- Online payment gateway integration
- Improved product recommendation experience
- Enhanced order tracking
- Additional responsive UI improvements

## 👩‍💻 Developer

**Shalini Pedduri**

B.Tech – Information Technology

- GitHub: [PedduriShalini](https://github.com/PedduriShalini)
- Project Repository: [FreshMart](https://github.com/PedduriShalini/FreshMart)

---

If you find this project interesting, feel free to explore the repository!
