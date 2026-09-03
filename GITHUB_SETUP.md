# RouteCart GitHub Setup

## 1. Copy these files into your existing project

Copy `README.md` and `.gitignore` into:

```text
~/Downloads/routecart-app
```

Do not replace your `assets/`, `App.tsx`, classifier, optimizer, or tests with anything from this package.

## 2. Check what Git will upload

In VS Code Terminal:

```bash
cd ~/Downloads/routecart-app
git init
git status
```

You should **not** see `node_modules/` listed for upload.

## 3. Make the first commit

```bash
git add .
git commit -m "Initial RouteCart release"
git branch -M main
```

## 4. Create the GitHub repository

On GitHub:
- Click **New repository**
- Repository name: `RouteCart`
- Visibility: **Public**
- Do not initialize it with a README, `.gitignore`, or license
- Create repository

## 5. Connect your local project

Replace `YOUR-USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR-USERNAME/RouteCart.git
git push -u origin main
```

## 6. GitHub repository description

Use:

> Smart in-store shopping route optimization app with fuzzy item classification and store-specific routing.

Suggested topics:

```text
react-native
expo
typescript
route-optimization
mobile-app
algorithms
fuzzy-matching
```

## 7. Add the demo later

After recording your phone demo, add it to a folder such as:

```text
demo/
```

Then update the `Demo` section in `README.md` with the video/GIF or a link.

After updating:

```bash
git add .
git commit -m "Add RouteCart demo"
git push
```
