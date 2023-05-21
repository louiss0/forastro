<script lang="ts" setup>
import { useDark, useToggle } from "@vueuse/core";
import { VNode } from "vue";
const isDark = useDark();
const toggle = useToggle(isDark);

const removeVisibleClass = (node:VNode<HTMLButtonElement>) => node.el?.classList?.remove("invisible") ;

</script>

<template>
  <button @vue:mounted="removeVisibleClass"  class="invisible" data-element="light-dark-switch" @click="toggle()">
    <div class="transition-opacity duration-500 ease-in hover:opacity-80">
      <div data-padding-layer class="py-1 px-3">
        <div data-content class="grid place-items-center">
          
          
            <div v-show="isDark" class="filter hover:brightnes-105">
              <i-ri-sun-fill class="w-12 h-12 text-orange-300"  />
            </div>

              <div v-show="!isDark" class="filter dark:hover:brightness-95">
                <i-ri-moon-fill class="w-12 h-12 text-purple-600" />
              </div>
        </div>
      </div>
    </div>
  </button>
</template>

