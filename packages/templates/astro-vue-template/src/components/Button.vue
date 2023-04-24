<script lang="ts" setup>
import { ButtonHTMLAttributes, useAttrs } from 'vue';


interface Props extends ButtonHTMLAttributes {
  id: string
  label:string
}

const { label, id } = defineProps<Props>();

defineEmits(["click"])

const {class:$class, ...attrs } = useAttrs()

</script>

<template>
  <button 
  :id="id" 
  v-bind="attrs" 
  @click="$emit('click', $event)" 
  :class="[
  'py-1 px-3', 
  '[&:is(:hover,:focus)]:border-current', 
  '[&:is(:hover,:focus)]:outline-current',
    $class
  ]">
  {{ label }}
  </button>
</template>

