
/**  

** The point of this component is to render a list with a title when necessary
** The list of items are just that a list of items.
** This component is supposed to be used to render text only.
*! You want the list style position to always be on the inside when writing text so keep that class on.
*! The classes that are suppossed be used with this componnent are marker and list classes.
*/
<script setup lang="ts" >
import {  syncIterate,  } from "@forastro/utilities";


type Props = {
  title?: string;
  listClass?: string;
  items: Array<string>;
};

const { title, items, listClass } = defineProps<Props>()

</script>


<template>
   <strong v-if="title" >
    {{title}}
  </strong> 
  
   <ul :title="title" :class="['list-inside', listClass]" role="list">
    <li v-for="item of syncIterate(items, (value, info,)=>({value, info,}))">
    
    <template v-if="$slots.default">
      <slot v-bind="item" />

    </template>
    <template v-else>
      {{ item.value }}
    </template>
    </li>
   
  </ul>

</template>
