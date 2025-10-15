Mistakes:
1=> maintain the file structure and keep .env file in the folder which contains package.json to avoid path detection errors.

2=> methods built in models arent applicable in mongoose document 
for User document the methods of schema should be applied in the user variable which contains one single user data.

3=> In "start" script always write "nodemon -r/dotenv/config" then the path of entry point file like index.js

4=> maintain variable naming consistency to avoid silly errors