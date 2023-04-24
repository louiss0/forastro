
<script setup lang="ts" >
import { getImage } from "astro:assets";
interface Props {
  title: string;
  src: string;
  alt?: string;
}

const { title, src, alt } = defineProps<Props>();

const imageMetadata = await getImage({ src });

</script>
---

<template>
  
  <div class="grid">
  <header>
    <img v-bind="{...imageMetadata.attributes}" :alt="alt" />
  </header>
  <div class="py-2 px-4">
    <div class="text-xl">{{title}}</div>
  </div>
  <footer class="">
    <slot />
  </footer>
</div>

</template>