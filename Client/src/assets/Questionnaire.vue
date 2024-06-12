<script setup>

import {ref} from "vue";
import ImportReadme from "@/assets/ImportReadme.vue";

const form = defineModel('form');
const linkedInPost = defineModel('linkedInPost');
const fetchedQuestionnaire = ref(false);

const isLoading = ref(false);

const fetchAndParseQuestionnaire = async () => {
  //set isLoading to true to disable button.
  isLoading.value = true;
  const res = await fetch(`${import.meta.env.VITE_API_URL}questions?`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form.value)
  });
  const data = await res.json();

  //Transforms the array of questions into an array of objects [{question: ..., answer: ""}]
  const parsedData = {};
  for (const key in data) {
    parsedData[key] = data[key].map(question => ({question: question, answer: "" }));
  }
  form.value.questionnaire = parsedData;

  isLoading.value = false; //enable submit buttons.
  fetchedQuestionnaire.value = true; //render questionnaire.
}

const postQuestionnaire = async () => {
  isLoading.value = true;
  const res = await fetch(`${import.meta.env.VITE_API_URL}writePost`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form.value),
  });

  const data = await res.json();
  linkedInPost.value.content = data.post;
  linkedInPost.value.generatedPost = true;
  isLoading.value = false;
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
    <button v-if="fetchedQuestionnaire" :disabled="isLoading" @click="postQuestionnaire">Generate Post</button>
  </section>
</template>
<style scoped>
h1 {
  color: var(--white);
}
textarea {
  height: 10rem;
  margin-top: 0.5rem;
  border: 2px solid var(--dark-green);
  border-radius: 5px;
}
</style>