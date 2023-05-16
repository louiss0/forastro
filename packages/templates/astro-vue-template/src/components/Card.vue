<script setup lang="ts">

interface Props {
  title: string;
  src: string;
  alt?: string;
  width:number
  height:number
}

const { title, src, alt, height, width } = defineProps<Props>();

</script>
---

<template>
  
  <div class="grid">
  <header>
    <img 
    :src="src" 
    :height="height" 
    :width="width" 
    :alt="alt" 
    />
  </header>
  <div class="py-2 px-4">
    <div class="text-xl">{{title}}</div>
  </div>
  <footer class="">
    <slot />
  </footer>
</div>

</template>