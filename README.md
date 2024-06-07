# LinkedIn Writing Assistant
The LinkedIn writing assistant helps you to create a good professional post about the projects you work on.
The writing assistant generates questions based on basic information such as the name of your project, the field it is in and a short description.
It can also extract this information from a GitHub Readme. The questions will focus on your contributions and goals so you can show off your skills to your network!
After answering all the questions simply click generate post.

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

## Prompts
### Analysing README.md
This prompt is used to extract information from a REAMDE.md. The results are send back to the client and used to fill parts of the form.
```text
Analyse this README file to extract the name of the project, in what field the project is made and create an "about" section that's 1 paragraph. Return your response as JSON in the following format:
    {{
        "name": "name",
        "field": "field",
        "about": "about"
    }}
    README.md:
    {readme}`
```

### Generating questions
#### V1
```text
"You are a professional copy writer specialising in professional social media posts for individuals.
You are hired to write a social media post about a {field} project titled {name}.
The post should contain the following information:
     
        [Headline][/Headline]
        [Introduction][/introduction]
        [Milestones][/Milestone]
        [Impact][/Impact]
        
        The [Headline][/Headline] should be attention grabbing and contain the project title \"{name}\"\n" +
        The [Introduction][/Introduction] introduce the projects and stakeholders involved.\n" +
        The [Milestones][/Milestones] section describe reached or planned milestones.\n" +
        The [Impact][/Impact] section describe the desired or achieved impact.\n" +
        To gain information to write the post you are interviewing your client. You already know the project title is {name}. What questions do you ask? Use this JSON format to format your response:\n." +
        `{${JSON.stringify(questionJsonFormat)}}`
```
A problem that occurs is that questions appear that ask the same thing twice.
Additionally, the prompt focuses on the project itself instead of highlighting the contributions and development of the developer.

#### V2
```text
You are a professional copy writer specialising in professional social media posts for individuals.
You are hired to write a social media post from the perspective of your client, about a {field} project titled {name}.
You have been provided the following project description:
{about}

The post should have the following structure:
[Headline][/Headline] An attention grabbing headline containing the project title {name}
[Introduction][/introduction] A short description of the project and what it is about and involved stakeholders.
[Contribution][/Contribution] Personal contribution of the client to the project. Their tasks or achievements.
[Highlight][/Highlight] Personal highlight of the client experienced during the project, such as an overcome challenge or an enjoyable experience. 

To gain the information to write the post you are setting up a interview with your client. Formulate questions for this interview based on the above requirements and project description.
Formulate 1 question per subject.
Use the following JSON format to format your response:
{jsonFormat}
```
- Improved prompt so it's more focussed on the personal aspect.
- Lowered amount of questions as the same question was repeated but formulated differently.

### Writing post
This prompt is used to generate the actual post. The questions and answers are formatted as a conversation using the message roles provided by langchain.
#### V1
```text
Imagine you're a professional copywriter specializing in social media posts. Your task is to craft a compelling LinkedIn post for a {field} project titled {name}.
The post should cover key aspects without using specific headings. Focus on creating engaging content that highlights the project's uniqueness, milestones, and impact.
Use HTML to style the post, and remember to incorporate the information gathered during the interview to make the post authentic and captivating.
Return the post in the following JSON format:
{"post": "text"}

Interview: //this is formatted as a conversation using roles
```
- The generated post feels more like an add than a personal message / post.
- Had to specify to not use the category headers i.e. Headline, Introduction, etc.

#### V2
```text
//interview formatted using roles

You have finished conducting the interview. Use the project description and answers from the interview to write a social media post.
The post should be written from the perspective with the client. Cover key aspects without using specific headings.
Focus on creating engaging content that highlights the project's uniqueness, contribution of the client to the project and their highlights.
Use HTML to style the post, and remember to incorporate the information gathered during the interview to make the post authentic and captivating.
Return the post in the following JSON format:
{"post": "text"} 
```