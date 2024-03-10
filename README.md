# LinkedIn Writing Assistant
The LinkeIn writing assistant helps you to create a good professional post about your project. The writing assistant generates questions that you simply have to answer. Using your answers it then generates a LinkedIn post that you can immediately use or adapt to further fit your needs.

## Installation
Clone the git repo:
```
git clone https://github.com/TortleTurtle/LinkedIn-Writing-Assistant.git
```
### Server
1. Navigate to `/LinkedIn-Writing-Assistant/Client`
2. Create a `.env` file with the following information:
```
OPENAI_API_TYPE=
OPENAI_API_VERSION=
OPENAI_API_BASE=
AZURE_OPENAI_API_KEY=
DEPLOYMENT_NAME=
ENGINE_NAME=
INSTANCE_NAME=
```
4. Run to install dependencies and start the express server:
```
npm install
npm run start
```
Server will be live at `localhost:3000`
### Client
1. open terminal in `/Client`
2. Run:
```
npm install
npm run preview
```
The command will return a url to reach the local web server.