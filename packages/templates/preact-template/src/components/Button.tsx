import type { FunctionComponent, JSX } from "preact";




type Props = JSX.HTMLAttributes<HTMLButtonElement>


const Button: FunctionComponent<Props> = (props) => { 
  
const { type, onClick, class: $class, ...rest } = props;


return <button

  class={["[is(:hover,:focus)]:text-gray-400", $class].filter(Boolean).join(' ')}
  {...rest}
>
  <slot />
</button>

 } 

