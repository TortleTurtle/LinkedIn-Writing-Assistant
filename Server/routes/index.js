var express = require('express');
const {ChatOpenAI} = require("@langchain/openai");
const {PromptTemplate} = require("@langchain/core/prompts");
const {SystemMessage, AIMessage, HumanMessage} = require("@langchain/core/messages");
var router = express.Router();

const model = new ChatOpenAI({
  temperature: 0.5,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
  azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
  azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
})

//Json template for openAI to format its response.
const jsonFormat = {
  headline: ["question1", "question2"],
  introduction: ["question1", "question2"],
  milestones: ["question1", "question2"],
  impact: ["question1", "question2"],
}
//prompt template
const generateQuestionnairePrompt = new PromptTemplate({
  inputVariables: ["field", "name"],
  template:
      "You are a professional copy writer specialising in professional social media posts for individuals. You are hired to write a social media post about a {field} project {name} titled {name}. The post should contain the following information:\n" +
      "\n" +
      "[Headline][/Headline]\n" +
      "[Introduction][/introduction]\n" +
      "[Milestones][/Milestone]\n" +
      "[Impact][/Impact]\n" +
      "\n" +
      "The [Headline][/Headline] should be attention grabbing and contain the project title \"{name}\"\n" +
      "The [Introduction][/Introduction] introduce the projects and stakeholders involved.\n" +
      "The [Milestones][/Milestones] section describe reached or planned milestones.\n" +
      "The [Impact][/Impact] section describe the desired or achieved impact.\n" +
      "\n" +
      "To gain information to write the post you are interviewing your client. You already know the project title is {name}. What questions do you ask? Use this JSON format to format your response:\n." +
      `{${JSON.stringify(jsonFormat)}}`
});
const writePostPrompt = new PromptTemplate({
    inputVariables: ["field", "name"],
    template:
        "Imagine you're a professional copywriter specializing in social media posts. Your task is to craft a compelling LinkedIn post for a {field} project titled \"{name}\". The post should cover key aspects without using specific headings. Focus on creating engaging content that highlights the project's uniqueness, milestones, and impact.\n" +
        "\n" +
        "Use HTML to style the post, and remember to incorporate the information gathered during the interview to make the post authentic and captivating." +
        "Return the post in the following JSON format: {{post: \"text\""
});

/* GET home page. */
router.get('/questions', async function(req, res, next) {
  const formattedPrompt = await generateQuestionnairePrompt.format({
    name: req.query.name,
    field: req.query.field
  });

  const messages = [
    new SystemMessage(formattedPrompt),
  ]

  console.log(messages);

  const modelResponse = await model.invoke(messages);
  //get the json string and parse it. This cleans it up.
  const questions = JSON.parse(modelResponse.content);
  //return as json
  res.json(questions);
});

router.post('/writePost', async function (req,res){
    const {name, field, questionnaire} = req.body;
    const messages = []

    const formattedPrompt = await writePostPrompt.format({
      name: name,
      field: field,
    });
    messages.push(new SystemMessage(formattedPrompt));

    //Add the questionnaire to the message. Pretend like it's a normal interview.
    for (let [category, questionsAndAnswers] in Object.entries(questionnaire)){
        //add system message for category
        messages.push(new SystemMessage(`[${category}]`));
        for (let item in questionsAndAnswers){
            messages.push(new AIMessage(item.question));
            messages.push(new HumanMessage(item.answer));
        }
        //close category
        messages.push(new SystemMessage(`[/${category}]`));
    }

    const modelResponse = await model.invoke(messages);
    const post = await JSON.parse(modelResponse.content);
    res.json(post);
});

module.exports = router;
