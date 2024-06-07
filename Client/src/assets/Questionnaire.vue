<script setup>

import {ref} from "vue";
import ImportReadme from "@/assets/ImportReadme.vue";

const form = defineModel('form');
const linkedInPost = defineModel('linkedInPost');
const fetchedQuestionnaire = ref(false);

const fetchAndParseQuestionnaire = async () => {
  console.log("fetching")
  const res = await fetch(`http://localhost:3000/questions?`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form.value)
  });
  const data = await res.json();

  console.log("transforming");
  //Transforms the array of questions into an array of objects [{question: ..., answer: ""}]
  const parsedData = {};
  for (const key in data) {
    parsedData[key] = data[key].map(question => ({question: question, answer: "" }));
  }
  form.value.questionnaire = parsedData;
  fetchedQuestionnaire.value = true
}

const postQuestionnaire = async () => {
  console.log("posting");
  const res = await fetch('http://localhost:3000/writePost', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form.value),
  });

  const data = await res.json();
  console.log(data);
  linkedInPost.value.content = data.post;
  linkedInPost.value.generatedPost = true;
}
</script>
<template>
  <section>
    <h1>LinkedIn Writing Assistant</h1>
    <ImportReadme v-model:form="form"/>
    <div class="subsection">
      <h2>General information</h2>
      <p>First tell me some basics about your project to help me formulate questions.</p>
      <label for="name">Name of the project:</label>
      <input v-model="form.name" id="name" type="text">
      <label for="field">To what field does the project belong? I.E. web development or graphic design</label>
      <input v-model="form.field" id="field" type="text">
      <label for="about">Give a quick description of the project.</label>
      <textarea v-model="form.about" id="about"/>
      <button ref="fetchQuestionButton" @click="fetchAndParseQuestionnaire">
        Generate questions
      </button>
    </div>
    <div class="subsection" v-if="fetchedQuestionnaire"
         v-for="[category, questionsAndAnswers] in Object.entries(form.questionnaire)" :key="category">
      <h2>{{ category }}</h2>
      <div v-for="(item, index) in questionsAndAnswers" :key="category + index">
        <label :for="`${category}.${index}`">{{ item.question }}</label>
        <input :id="`${category}.${index}`" v-model="item.answer" type="text"/>
      </div>
    </div>
    <button v-if="fetchedQuestionnaire" @click="postQuestionnaire">Generate Post</button>
  </section>
</template>
<style scoped>
textarea {
  margin-top: 0.5rem;
  border: 2px solid var(--dark-green);
  border-radius: 5px;
}
</style>