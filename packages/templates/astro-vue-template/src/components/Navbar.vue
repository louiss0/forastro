<script lang="tsx" setup>
import { ref } from "vue";
import { NavLinks } from "~/types";
import LightDarkSwitch from "./LightDarkSwitch.vue";
const links: ReadonlyArray<NavLinks> = [{ path: "/", text: "Home" }];

const showSideBar = ref(false);
</script>
<template>
  <Toast />
  <nav class="bg-blue-600 dark:bg-blue-300 text-gray-50 dark:text-gray-900">
    <div class="w-5/6 max-w-screen-xl">
      <div data-padding-layer class="py-2 px-6">
        <div data-content class="flex justify-around">
          <button data-hamburger-menu @click="showSideBar = true">
            <HambugerIcon />
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
  <Sidebar position="left" class="" v-model:visible="showSideBar">
    <div class="w-full px-4 py-12 text-lg">
      <template v-for="{ path, text } in links">
        <a :href="path" class="hover:bg-blue-400 dark:hover:bg-blue-600">
          {{ text }}
        </a>
      </template>
    </div>
  </Sidebar>
</template>

<script lang="tsx">
export default {
  components: {
    HambugerIcon() {
      return (
        <svg viewBox="0 0 24 24" class="w-12 h-full">
          <path
            fill="currentColor"
            d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
          ></path>
        </svg>
      );
    },
  },
};
</script>
