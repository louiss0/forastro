<script lang="tsx"  setup>
import {  ref } from "vue";
import { NavLinks } from "~/types";
import LightDarkSwitch from "./LightDarkSwitch.vue";
const links: ReadonlyArray<NavLinks> = [{ path: "/", text: "Home" }];

const showSideBar = ref(false);


</script>



<template>
  <nav class="bg-blue-600 dark:bg-blue-300 text-gray-50 dark:text-gray-900">
    <div class="w-5/6 max-w-screen-xl">
      <div data-padding-layer class="py-2 px-6">
        <div data-content class="flex justify-around">
          <button data-hamburger-menu @click="showSideBar = true">
            <i-mdi-menu class="w-12 h-12 " />          
          </button>
          <div class="w-2/5 lg:w-4/5">
            <div data-padding-layer class="py-2 px-6">
              <ul data-content-layer class="flex gap-4 items-center">
                
                <template v-for="{ path, text } of links">
                  <li class="hover:bg-blue-400 dark:hover:bg-blue-600">
                    <div class="px-3 py-1">
                      <a class="text-lg" :href="path">{{ text }}</a>
                    </div>
                  </li>
                </template>
              
              </ul>
            </div>
          </div>
          <LightDarkSwitch />
        </div>
      </div>
    </div>
  </nav>  
</template>

