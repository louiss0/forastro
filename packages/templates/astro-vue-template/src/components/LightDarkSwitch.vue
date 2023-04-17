<script lang="tsx" setup>
import { useDark, useToggle } from "@vueuse/core";
const isDark = useDark();

const toggle = useToggle(isDark);
</script>

<template>
  <button data-element="light-dark-switch" @click="toggle()">
    <div class="transition-opacity duration-500 ease-in hover:opacity-80">
      <div data-padding-layer class="py-1 px-3">
        <div data-content class="grid place-items-center">
          <Transition
            enter-from-class="scale-25"
            enter-active-class="transform transition-transform duration-300 ease-in-out"
            enter-to-class="scale-100"
            leave-active-class="transform transition-transform duration-600 ease-in-out"
            leave-to-class="scale-0"
            mode="out-in"
            :duration="900"
          >
            <template v-if="isDark">
              <div class="filter hover:brightnes-105">
                <SunIcon />
              </div>
            </template>

            <template v-else>
              <div class="filter dark:hover:brightness-95">
                <MoonIcon />
              </div>
            </template>
          </Transition>
        </div>
      </div>
    </div>
  </button>
</template>

<script lang="tsx">
export default {
  components: {
    MoonIcon() {
      return (
        <svg class="w-12 text-purple-600" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M8.764 6.128a4.506 4.506 0 0 1 2.6-3.196c.93-.41.727-1.784-.281-1.908C6.47.458 2.162 3.522 1.188 8.102c-1.035 4.87 2.067 9.656 6.93 10.69c4.862 1.033 9.642-2.078 10.677-6.947a9.045 9.045 0 0 0 .195-2.166c-.032-1.019-1.388-1.343-1.877-.449a4.504 4.504 0 0 1-4.885 2.245a4.505 4.505 0 0 1-3.464-5.347Zm-.23 10.707c-3.782-.803-6.195-4.527-5.39-8.317a7.022 7.022 0 0 1 4.727-5.23a6.512 6.512 0 0 0-1.063 2.424c-.747 3.516 1.493 6.973 5.005 7.72a6.487 6.487 0 0 0 4.636-.752c-1.273 3.053-4.57 4.867-7.916 4.155Z"
            clip-rule="evenodd"
          />
        </svg>
      );
    },
    SunIcon() {
      return (
        <svg class="w-12 text-orange-300" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="m6.76 4.84l-1.8-1.79l-1.41 1.41l1.79 1.79l1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41l-1.79 1.79l1.41 1.41l1.79-1.79zm-3.21 13.7l1.79 1.8l1.41-1.41l-1.8-1.79l-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41l1.79-1.8l-1.41-1.41l-1.79 1.8z"
          />
        </svg>
      );
    },
  },
};
</script>
