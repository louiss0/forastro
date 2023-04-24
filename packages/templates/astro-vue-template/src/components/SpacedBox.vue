---
/** 
 * The point of this component is to just create space between elements.
 * The vertical prop is to add flex col and make sure that there is vertical spacing. 
 ** Remember that you can use both the spacing class and the gap class at the same time.
 ** The spacing class is the class that makes sure that the elements are spaced as far as possible.
 ** The rest of the gap classes are there to make sure that gaps exist on different screen sizes.
 
 */

import { SpacingNumbers } from "../utilities/types";

type Props = {
  gapClass?: `gap-${SpacingNumbers}`;
  smGapClass?: `sm:gap-${SpacingNumbers}`;
  vertical?: true;
  mdGapClass?: `md:gap-${SpacingNumbers}`;
  lgGapClass?: `lg:gap-${SpacingNumbers}`;
  xlGapClass?: `xl:gap-${SpacingNumbers}`;
  xl2GapClass?: `2xl:gap-${SpacingNumbers}`;
  spacingClass?: `justify-${"between" | "evenly" | "around"}`;
};

const {
  gapClass,
  spacingClass,
  xlGapClass,
  lgGapClass,
  smGapClass,
  vertical,
  mdGapClass,
  xl2GapClass,
} = Astro.props;
---

<div
  data-spaced-box
  class="flex flex-wrap"
  class:list={[
    spacingClass,
    gapClass,
    vertical && "flex-col",
    smGapClass,
    mdGapClass,
    lgGapClass,
    xlGapClass,
    xl2GapClass,
  ]}
>
  <slot />
</div>
