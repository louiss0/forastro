<script lang="ts" setup>
import { ButtonProps } from "primevue/button";

interface Props extends ButtonProps {}

defineProps<Props>();
</script>

<template>
  <Button v-bind="$props" />
</template>

<style lang="scss" scoped></style>
