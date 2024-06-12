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
1. Navigate to `./LinkedIn-Writing-Assistant/Client`
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
4. Install dependencies and start the express server:
```
npm install
npm run start
```
Server will be live at `localhost:3000`
### Client
1. Open a new terminal and navigate to `./LinkedIn-Writing-Assistant/Client`
2. Run:
```
npm install
npm run preview
```
The command will return an url to reach the local web server.

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
## Script
### Demo
1. Extract information from a GitHub Readme file to partly fill in the form.
2. Edit or manually enter, information.
3. Generate questions based on this information.
4. User fills in the questions.
5. Generate a LinkedIn post.

### Leerdoel 1 - 25 punten
_Ik kan AI libraries en API’s toepassen in een professioneel ingerichte  javascript applicatie._
#### Beginner
Zoals te zien in de broncode bestaat de applicatie uit twee delen.
Een Client wat gebruik maakt van Vue.js & een Server bestaand uit een Express API.
API keys voor OpenAI zijn afgeschermd via een `.env` bestand:
```js
const model = new ChatOpenAI({
    temperature: 0.5,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
})
```
#### Op Niveau
De interface is al getoond tijdens de demo. De invoer van de gebruiker wordt gebruikt voor de [prompt](#generating-questions) om vragen te genereren.
```js
//prompt template
const generateQuestionnairePrompt = new PromptTemplate({ 
    inputVariables: ["field", "name", "about"],
    template: "...",
});

// template being formatted in /questions URI.
const formattedPrompt = await generateQuestionnairePrompt.format({
    name: req.body.name,
    field: req.body.field,
    about: req.body.about
});
```
Deze prompt geeft vragen terug gegenereerd door OpenAI. De antwoorden op deze vragen worden op hun beurt weer gebruikt
om een chat history op te bouwen d.m.v. rollen hierover meer later.

In de front-end wordt het maken van meerdere calls geblokkeerd door het `disabled` atribuut op knoppen te binden aan een reactive variable.
Vue's versie van een React State. Door aan het begin van de method `isLoading` op `true` te zetten. Rerendert een knop met het dissabled attribuut,
aan het einde wordt `isLoading` weer op `false` gezet om het attribuut te verwijderen. Dit worden gedaan voor alle methodes die requests maken naar de server.
```vue
<script setup>
    const isLoading = ref(false);

    const fetchAndParseQuestionnaire = async () => {
      //set isLoading to true to disable button.
      isLoading.value = true;
      
      /*
      * fetching and formatting logic.
      */

      isLoading.value = false; //enable submit buttons.
    }
</script>
<template>
  <button ref="fetchQuestionButton" :disabled="isLoading" @click="fetchAndParseQuestionnaire">
    Generate questions
  </button>
</template>
```
#### Expert
Het prototype staat live op [dev.cheftags.nl](http://dev.cheftags.nl/). Het wordt gehost d.m.v. Nginx die de `index.html` 
van de gebouwde Vue app served. Nginx is ook geconfigureerd om als 'reverse proxy' werken voor de Express server.
Hierdoor worden requests naar `/api` doorgestuurd naar de express app i.p.v. de Vue app.

### Leerdoel 2 - 15 punten
_Ik kan werken met taalmodellen en de bijbehorende API’s in javascript._

#### Beginner
Een ChatLLM is een AI getraint met het doel conversaties te houden. Het verschilt van oude chatbots omdat het 'context aware' is
en dus de context van een gesprek kan onthouden en gebruiken. LLM's zijn vooral goed in het transformeren & reduceren van teksten
of het genereren van text, b.v. helpen met brainstormen. In mijn applicatie komen deze punten terug:
- Reduceren wordt toegepast op de README van een GitHub repo en deze samenvatten naar een kleine 'about' sectie die in vervolg stappen weer gebruikt wordt.
- Generen vindt plaats door het bedenken van vragen, met behulp van specifieke instructies.
- Transformeren komt terug in dat de antwoorden op de vragen vervolgens omgevormd worden naar coherent stukje tekst, dit kan je ook deels zien als genereren.

#### Op niveau
Prompt engineering is het 'verfijnen' van prompts om betere resultaten te krijgen. Methoden van prompt engineering zijn bijvoorbeeld:
- context toevoegen: rol van de AI en de opdracht.
- specificeren: structuur van de respons en wat de inhoud moet zijn.
- Toon & doelgroep: moet het informeel of formeel zijn, is het voor tieners of juist voor volwassen?

In de prompt [generating questions](#generating-questions) is te zien hoe dit toegepast wordt. In v1 zijn al technieken al toegepast
zoals **context** toevoegen door een rol te geven namelijk professional copy writer en de context van de opdracht; een post schrijven voor social media.
Specificeren is gedaan door een structuur van de verwachte post mee te geven in de vorm van de [blocks]. De inhoud van deze blokken wordt ook weer gespecificeerd.

In versie 2 is hierop geïtereerd door nog meer context toe te voegen, namelijk dat de post vanuit het perspectief van de client moet zijn
en door een `about` stukje over het project toe te voegen.
De instructies voor het generen van het interview zijn daarnaast gespecificeerd door uitdrukkend te zeggen dat de structuur en project omschrijving gebruikt moeten worden voor het generen van de vragen.

**Toon** komt vooral terug in de prompt [writing post](#writing-post)

### Leerdoel 3 - 15 punten
_Ik kan op conceptueel niveau toepassingen voor AI bedenken en toelichte_
#### Beginner
De meerwaarde van deze applicatie is vooral voor mensen die niet goed zijn in teksten schrijven.
Het moeilijkste van schrijven (in mijn ervaring) is bedenken *wat* precies in je tekst moet en vervolgens hoe je dit op een goede manier kan overbrengen.

ChatGPT is hier echter goed of op zijn minst beter in dan de meeste mensen en kan je ook nog eens door het process begeleiden.
Door specifieke prompt te schrijven genereert ChatGPT vragen die de gebruiken duidelijk te maken *wat* er in de post moet staan.
Deze antwoorden kunnen vervolgens gebruikt worden om snel een concept post te generen die de gebruiker vervolgens kan overnemen en aanpassen.

#### Op Niveau
Zoals te zien in demo kan de applicatie gebruik maken van GitHub readme's. Hiervoor wordt de github API gebruikt.
Om de content van een repository aan te spreken moet de URL opgebouwd zijn volgens deze 
[documentatie](https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content)

De gebruiker vult de link naar de repository in, de locatie, alles achter de eerste `/` wordt hieruit gepakt en verstuurd
naar de server. Deze locatie wordt dan achter de base url. Er wordt ook `README.md` aan toegevoegd om het README bestand aan te spreken.
```js
router.post('/readme', async function(req, res) {
    const { location } = req.body;

    // Fetch README from GitHub using API.
    const githubResponse = await fetch(`https://api.github.com/repos${location}/contents/README.md`, {
        headers: {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    });

    const readmeData = await githubResponse.json();
```

Het readme bestand is `base64` geëncodeerd. Om het in een prompt te kunnen gebruiken moet het eerst gedecodeerd worden en
vervolgens omgezet worden naar een string:

```js
    const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');

    // Perform prompt and get response.
    const formattedPrompt = await analyseReadmePrompt.format({readme: readmeContent});
    const messages = [new SystemMessage(formattedPrompt)];
    const modelResponse = await model.invoke(messages);

    // Return response.
    res.json(JSON.parse(modelResponse.content));
```
De prompt template vraagt om bepaalde informatie uit de README te halen en terug te geven als JSON. De JSON response wordt
geparsed om het op te schonen.

### Leerdoel 4 - 5 punten
_Ik kan zelfstandig documentatie bestuderen, toepassen en toelichten._

#### Beginner
Express:
- [Post method](https://expressjs.com/en/5x/api.html#app.post.method)
- [Respond JSON method](http://expressjs.com/en/5x/api.html#res.json)

Node:
- [URL object](https://nodejs.org/api/url.html)

Langchain:
- templates
- chat history
- roles