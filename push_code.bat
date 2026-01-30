@echo off
echo Setting remote to origin...
git remote remove origin 2>nul
git remote add origin https://github.com/Shikhar-web25/Vconnect.git

echo Creating branch discoverscreen...
git checkout -b discoverscreen 2>nul || git checkout discoverscreen

echo Staging files...
git add .

echo Committing...
git commit -m "feat: add discover screen code"

echo Pushing to GitHub...
git push -u origin discoverscreen

echo Done!
pause
