<script setup>
import {reactive} from "vue";

const formData = reactive({
  name: "",
  field: "",
  questionnaire: {},

});
const state = reactive({
  fetchedQuestionnaire: false,
  generatedPost: false,
  post: "",
});

const fetchAndParseQuestionnaire = async () => {
  console.log("fetching")
  const res = await fetch(`http://localhost:3000/questions?name=${formData.name}&field=${formData.field}`);
  const data = await res.json();

  console.log("transforming")
  //Transforms the array of questions into an array of objects [{question: ..., answer: ""}]
  const parsedData = {};
  for (const key in data) {
    parsedData[key] = data[key].map(question => ({question: question, answer: "" }));
  }
  formData.questionnaire = parsedData;
  //set fetched to true to start rendering the questions.
  state.fetchedQuestionnaire = true;

  console.log(Object.entries(formData.questionnaire));
}
const postQuestionnaire = async () => {
  console.log("posting");
  const res = await fetch('http://localhost:3000/writePost', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  console.log(data);
  state.post = data.post;
  state.generatedPost = true;
}
</script>

<template>
  <section v-show="!state.generatedPost">
    <h1>LinkedIn Writing Assistant</h1>
    <div class="subsection">
        <h2>General information</h2>
        <p>First tell me some basics about your project to help me formulate questions.</p>
        <label for="name">Name of the project:</label>
        <input v-model="formData.name" id="name" type="text">
        <label for="field">To what field does the project belong? I.E. webdevelopment or graphic design</label>
        <input v-model="formData.field" id="field" type="text">
        <button ref="fetchQuestionButton" v-show="!formData.fetchedQuestionnaire" @click="fetchAndParseQuestionnaire">Generate questions</button>
    </div>
    <div class="subsection" v-if="state.fetchedQuestionnaire && !state.generatedPost" v-for="[category, questionsAndAnswers] in Object.entries(formData.questionnaire)" :key="category">
      <h2>{{ category }}</h2>
      <div v-for="(item, index) in questionsAndAnswers" :key="category + index">
        <label :for="`${category}.${index}`">{{ item.question }}</label>
        <input :id="`${category}.${index}`" v-model="item.answer" type="text" />
      </div>
    </div>
    <button v-if="state.fetchedQuestionnaire" @click="postQuestionnaire">Generate Post</button>
  </section>
  <section v-show="state.generatedPost">
    <h2>Your Post:</h2>
    <div class="subsection" v-html="state.post">
    </div>
  </section>
</template>

<style scoped>
  label, input {
    display: block;
    width: 100%;
  }
  input {
    text-align: end;
  }
</style>
