import type { FunctionalComponent, JSX } from "preact";


interface Props {
  title: string;
  src: string;
  alt?: string;
  footer: JSX.Element
}


const  Card:FunctionalComponent<Props> = (props) => {
  const { title, src, alt, children, footer } = props;


  return <div class="grid">
    <header>
      <img src={src} alt={alt} />
      <div class="text-xl">{title}</div>
    </header>
    <div class="py-2 px-4">
      {children}
    </div>
    <footer class="">
      {footer}
    </footer>
  </div>

}

export { Card }