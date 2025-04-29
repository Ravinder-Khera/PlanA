# ⚛️ React Project

A scalable React project built with modern JavaScript and Node.js > v18.

---

## 🚀 Getting Started

### 📦 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version **18+**)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/Ravinder-Khera/PlanA

# Navigate into the project folder
cd PlanA

# Install dependencies
npm install
# or
yarn
```

---

### ▶️ Running the App

```bash
npm start
# or
yarn start
```

---

## 📁 Project Structure

```
src/
├── assets/             # Images, fonts, and static files
├── Components/         # Reusable UI components
├── pages/              # Application views/pages
├── services/           # API service functions
├── helper/             # helper functions and data
├── App.js              # Root component
├── index.js            # React DOM entry
└── index.css           # Global styles
└── App.scss            # styles for all pages/Components
```

---

## 🛠️ Modifying the Project

### 📄 Add a New Page

1. Create a file in `src/pages/`, e.g., `About.js`

2. Define the component:

    ```js
    function About() {
    return <h1>About Page</h1>;
    }
    export default About;
    ```

3. Register it in your router (e.g., in `App.js`):

    ```js
    import { Routes, Route } from 'react-router-dom';
    import About from './pages/About';

    <Routes>
    <Route path="/about" element={<About />} />
    </Routes>
    ```

---

### 🧩 Add a New Component

1. Create the file in `src/Components/`, e.g., `Button.js`

2. Create your component:

    ```js
    function Button({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
    }
    export default Button;
    ```

3. Use it in any page/component:

    ```js
    import Button from '../Components/Button';

    <Button label="Click me" onClick={() => alert('Clicked!')} />;
    ```
---

### 🔌 Add a New Service

1. Create a new file in `src/services/`, e.g., `userService.js`

2. Define your API logic using `fetch` or `axios`:

    ```js
    const BASE_URL = 'https://api.example.com';

    export async function getUserData(id) {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user data');
    return await response.json();
    }
    ```

3. Import and use it where needed:

    ```js
    import { getUserData } from '../services/userService';

    useEffect(() => {
    getUserData(1).then(console.log).catch(console.error);
    }, []);
    ```

---

### 🔐 Environment Variables
### Use a .env file in the root of the project to store sensitive or environment-specific values.

✅ Example .env

    REACT_APP_USER_API_ENDPOINT=https://api.example.com
    REACT_APP_USER_API_CLOUD_ENDPOINT=https://cloud.example.com
    REACT_APP_USER_API_CLOUD_IMG_PATH=/images
    REACT_APP_USER_API_CLOUD_ATTACHMENT_PATH=/attachments
    REACT_APP_PUSHER_KEY=your-pusher-key
    REACT_APP_CLUSTER=your-cluster-id
    REACT_APP_NODE_ENV=development


⚠️ All environment variables in React must start with REACT_APP_ to be accessible in frontend code.

### 🔄 Accessing in Code
    ```js
    const apiBase = process.env.REACT_APP_USER_API_ENDPOINT;
    const imgPath = process.env.REACT_APP_USER_API_CLOUD_IMG_PATH;
    ```

---


## 📌 Additional Guidelines

- ✅ **Use `.js` only**, avoid `.jsx` or `.ts`
- ✅ Stick to **PascalCase** for component filenames (e.g., `Button.js`)
- ✅ Use **camelCase** for helper and service functions
- ✅ Abstract logic into `services/` or `helper/` folders
- ✅ Use environment variables via `.env` (e.g., `REACT_APP_API_URL`)
- ✅ Use relative imports wisely (`@` alias if configured)
- ✅ Keep components modular and maintain single responsibility

---

## 🧪 Testing (Optional)

If testing is set up:

    ```bash
    npm test
    # or
    yarn test
    ```

---

## 📬 Questions?

Feel free to open an issue or contact a maintainer.