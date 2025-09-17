@echo off

rem A simple script to automate git add, commit, and push

set /p commitMessage="Enter your commit message: "

git add .
git commit -m "%commitMessage%"
git push origin main

echo Changes pushed to GitHub!
pause