import { iterate } from '@forastro/utilities'
import clsx from "clsx";
import type { FunctionComponent,  } from "preact";
import type { FunctionComponent, } from "preact";
import  { useState, useEffect } from "preact/hooks";

/**  

** The point of this component is to render a list with a title when necessary
** The list of items are just that a list of items.
** This component is supposed to be used to render text only.
*! You want the list style position to always be on the inside when writing text so keep that class on.
*! The classes that are suppossed be used with this componnent are marker and list classes.
*/

type Props = {
  title?: string;
  listClass?: string;
  itemClass?: string
  items: Array<string>;
};


export const List:FunctionComponent<Props> = (props) => {
 
  
  
  const { title, items,  listClass, itemClass, children } = props;

 
  return <>
  
  {title ? <strong>{title}</strong> : null}

  <ul title={title} class={clsx("list-inside", listClass)} role="list">
  
      {items.map(item => <li class={itemClass} >{item}</li>)}
  
  </ul>
  
  </>

}



