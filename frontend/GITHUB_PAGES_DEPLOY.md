# GitHub Pages Deployment for Vite + React

1. **Update `vite.config.ts`**
   - Set the `base` option to your repo name (e.g., `/your-repo-name/`).

2. **Install gh-pages**
   - In the `frontend` directory, run:
     ```sh
     npm install --save-dev gh-pages
     ```

3. **Add deploy scripts to `package.json`**
   - Add these scripts:
     ```json
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
     ```

4. **Build and Deploy**
   - Run:
     ```sh
     npm run deploy
     ```

---

- Make sure your Vite `base` matches your GitHub repo name.
- Only the frontend (static site) can be hosted on GitHub Pages. Backend/API must be hosted elsewhere.
