# Simple Guide to Upload to GitHub

## Step 1: Open Terminal
- **On Replit**: Click the "Shell" tab at the bottom
- **On Windows**: Press Windows+R, type "cmd", press Enter
- **On Mac**: Press Command+Space, type "Terminal", press Enter

## Step 2: Navigate to the folder
Type this command and press Enter:
```
cd liquidlab-open-source
```

## Step 3: Prepare your files
Type these commands one by one, pressing Enter after each:
```
git init
git add .
git commit -m "Initial commit: LiquidLab open source security components"
```

## Step 4: Connect to GitHub
Replace YOUR_USERNAME with your actual GitHub username:
```
git remote add origin https://github.com/YOUR_USERNAME/liquidlab-open-source.git
```

## Step 5: Upload your code
```
git push -u origin main
```

If it asks for your GitHub username and password:
- Username: Your GitHub username
- Password: Your GitHub personal access token (not your regular password)

## Need a GitHub token?
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Give it a name and check the "repo" checkbox
4. Click "Generate token" and copy it
5. Use this token as your password when pushing

That's it! Your code is now on GitHub!