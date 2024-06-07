const express = require('express');
const {ChatOpenAI} = require("@langchain/openai");
const {PromptTemplate} = require("@langchain/core/prompts");
const {SystemMessage, AIMessage, HumanMessage} = require("@langchain/core/messages");
const router = express.Router();

const model = new ChatOpenAI({
  temperature: 0.5,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
  azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
  azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
})

//prompt templates
const analyseReadmePrompt = new PromptTemplate({
    inputVariables: ['readme'],
    template:
    `Analyse this README file to extract the name of the project, in what field the project is made and create an "about" section that's 1 paragraph. Return your response as JSON in the following format:
    {{
        "name": "name",
        "field": "field",
        "about": "about"
    }}
    README.md:
    {readme}`
});
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
    const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');

    // Perform prompt and get response.
    const formattedPrompt = await analyseReadmePrompt.format({readme: readmeContent});
    const messages = [new SystemMessage(formattedPrompt)];
    const modelResponse = await model.invoke(messages);

    // Return response.
    res.json(JSON.parse(modelResponse.content));
});

//Json template for openAI to format its response.
const questionJsonFormat = {
    headline: ["question"],
    introduction: ["question"],
    milestones: ["question"],
    impact: ["question"],
}
const generateQuestionnairePrompt = new PromptTemplate({
    inputVariables: ["field", "name", "about"],
    template:
        `You are a professional copy writer specialising in professional social media posts for individuals.
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
        {${JSON.stringify(questionJsonFormat)}}`
});
router.post('/questions', async function(req, res ) {
    console.log(req.body);
    const formattedPrompt = await generateQuestionnairePrompt.format({
      name: req.body.name,
      field: req.body.field,
      about: req.body.about
  });

  const messages = [
    new SystemMessage(formattedPrompt),
  ];

  const modelResponse = await model.invoke(messages);
  //get the json string and parse it. This cleans it up.
  const questions = JSON.parse(modelResponse.content);
  //return as json
  res.json(questions);
});

const writePostPrompt =
        `You have finished conducting the interview. Use the project description and answers from the interview to write a social media post.
        The post should be written from the perspective with the client. Cover key aspects without using specific headings.
        Focus on creating engaging content that highlights the project's uniqueness, contribution of the client to the project and their highlights.
        Use HTML to style the post, and remember to incorporate the information gathered during the interview to make the post authentic and captivating.
        Return the post in the following JSON format:
        {{"post": "text"}}`
;
router.post('/writePost', async function (req,res){
    const {name, field, about, questionnaire} = req.body;
    const messages = [];

    const generateQuestionsPrompt = await generateQuestionnairePrompt.format({
        name: name,
        field: field,
        about: about
    });
    messages.push(new SystemMessage({content: generateQuestionsPrompt}));
    messages.push(new SystemMessage({content: "You conducted the following interview:"}));

    //Add the questionnaire to the message. Pretend like it's a normal interview.
    for (let [category, questionsAndAnswers] in Object.entries(questionnaire)){
        for (let item in questionsAndAnswers){
            messages.push(new AIMessage({content: item.question}));
            messages.push(new HumanMessage({content: item.answer}));
        }
    }

    messages.push(new SystemMessage(writePostPrompt));

    const modelResponse = await model.invoke(messages);
    const post = await JSON.parse(modelResponse.content);
    res.json(post);
});

module.exports = router;