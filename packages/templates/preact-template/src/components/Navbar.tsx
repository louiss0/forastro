
import type { FunctionComponent } from "preact";
import { Container } from "~/components/Container";

const linkTexts = ["about", "services", "contact"];

const formattedLinks = linkTexts.map((linkText) => {
  const href = linkText !== "home" ? "/" : `/${linkText}`;

  return { href, linkText };
});


export const Navbar: FunctionComponent = () => (  
<nav class="py-2 px-4">
  <Container data-content widthClass={"w-4/5"}>
    <div class="flex justify-between">
      Brand Name

      <div id="nav-links">
        {
          formattedLinks.map(({ href, linkText }) => (
            <a href={href}>{linkText} </a>
          ))
        }
      </div>
    </div>
  </Container>
</nav>
)

