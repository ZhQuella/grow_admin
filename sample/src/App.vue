<script setup lang="ts">

</script>

<template>
  <div>
    <h1 v-for="(i, index) in 21" :key="i" class="text-center flex justify-center text-[red] enter-x">Hello World！{{ i }}</h1>
  </div>
</template>
