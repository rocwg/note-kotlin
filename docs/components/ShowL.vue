<script setup>
import {ref} from 'vue'

const showText = ref(0)

function toggleText() {
  showText.value = !showText.value;
}
</script>

<template>
    <span @click="toggleText">
      <slot name="show"></slot>
    </span>
    <span v-if="showText">
      <slot name="hide"></slot>
    </span>
</template>
