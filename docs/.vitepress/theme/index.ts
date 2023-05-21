import DefaultTheme from 'vitepress/theme'
import StarterLayout from "../theme/components/starter-layout.vue";

export default {
  // override the Layout with a wrapper component that injects the slots
  ...DefaultTheme,
  Layout: StarterLayout,
};
