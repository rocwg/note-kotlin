<script setup>
import {ref} from 'vue'

const showText = ref(0)

function toggleText() {
  showText.value = !showText.value;
}
</script>

<template>
    <span @click="toggleText">🎈</span>
    <span v-if="showText"><slot></slot></span>
</template>
