<script setup>
import {ref} from "vue";

const repoUrl = ref("");
const form = defineModel("form");

const importReadme = async () => {
  //Using the node url object to grab the path from the url.
  const url = new URL(repoUrl.value);

  const res = await fetch(`${import.meta.env.VITE_API_URL}readme`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({location : url.pathname}) //grab path
  });
  const data = await res.json();

  //update form.
  form.value.name = data.name;
  form.value.field = data.field;
  form.value.about = data.about;
}
</script>

<template>
<div class="subsection">
  <h2>Import Repo</h2>
  <p>Does your Github repo already have a readme with an about section? The assistant can use it to write a LinkedIn post.</p>
  <label for="repoUrl">Link to Github repo:</label>
  <input id="repoUrl" type="url" v-model="repoUrl">
  <button ref="importReadme" @click="importReadme">import readme</button>
</div>
</template>

<style scoped>

</style>