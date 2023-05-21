
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
  itemClass: string
  items: ReadonlyArray<string>;
};

const { title, items, listClass, itemClass } = defineProps<Props>()



</script>


<template>
   <strong v-if="title" > {{title}} </strong>

   <ul :title="title" :class="['list-inside', listClass]" role="list">

    <template v-for="item of syncIterate(items, (value, info,)=>({value, info,}))">

      <li  :class="itemClass" >
        
        <slot v-if="$slots.default" v-bind="item" />
        
        <template v-else>
          {{ item.value }}
        </template>
      </li>
  </template>
   
  </ul>

</template>
