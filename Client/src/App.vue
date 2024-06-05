<script setup>
import {reactive} from "vue";
import Questionnaire from "@/assets/Questionnaire.vue";

const form = reactive({
  name: "",
  field: "",
  questionnaire: {},
});

const linkedInPost = reactive({
  generatedPost: false,
  content: "",
});
</script>

<template>
  <Questionnaire v-show="!linkedInPost.generatedPost"
                v-model:form="form"
                v-model:linked-in-post="linkedInPost"
  />
  <section v-show="linkedInPost.generatedPost">
    <h2>Your Post:</h2>
    <div class="subsection" v-html="linkedInPost.content">
    </div>
  </section>
</template>