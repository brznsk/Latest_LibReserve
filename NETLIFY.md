# Deploy LibReserve on Netlify

The static HTML/CSS/JS is published from the repo root. Auth calls go to **Netlify Functions** at `/.netlify/functions/{login,register,users}`, which use the same MongoDB logic as `js/server.js`.

## 1. Environment variable

In the Netlify UI: **Site configuration → Environment variables**

| Name           | Value                                      |
|----------------|--------------------------------------------|
| `MONGODB_URI`  | Your MongoDB Atlas connection string       |

Redeploy after adding or changing variables.

## 2. Connect the site

- **New site from Git** → pick this repo.
- Netlify reads **`netlify.toml`**: `publish = "."`, `functions = "netlify/functions"`.
- Root **`package.json`** installs `mongoose` and `bcryptjs` for functions.

## 3. Custom domain

If the site is served at something other than `*.netlify.app`, open **`js/xu-api-base.js`** and add that hostname to **`NETLIFY_PRODUCTION_HOSTS`** (for example your library subdomain). That keeps API calls on `/.netlify/functions` on the same origin.

## 4. Local API vs Netlify

- **Local / Live Server:** `xu-api-base.js` uses `http://127.0.0.1:3000/api` — run `node js/server.js` from the `js` folder (with `.env` there).
- **Netlify:** no need to run Express; functions handle login, register, and user list.

## 5. AdminInit / `admin-setup`

`AdminInit.html` calls `/admin-setup`, which is **not** implemented in these functions. Create the first admin in MongoDB (Atlas UI or Compass) or run the Express server once with a setup route if you add it later.

## 6. Quick test after deploy

1. Open `https://<your-site>.netlify.app/LogIn.html`
2. Sign in — check **Netlify → Functions → login** logs if something fails.
3. Confirm **`MONGODB_URI`** is set (missing URI shows a 500 and a log line about env).
