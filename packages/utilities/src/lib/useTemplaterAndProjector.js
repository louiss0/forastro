import { z } from 'astro/zod';
import { createAstroFunctionalComponent } from './internal';

let callCount = 0;

const propsSchema = z
  .record(z.string(), z.any())
  .transform((arg) => Object.freeze(arg));

const createTemplaterSlotsSchemaWithDebugName = (debugName) =>
  z
    .object(
      {
        default: z.function(), // "default" is required and must be a function.
      },
      { message: `${debugName}Templater slot's is supposed to have a child` },
    )
    .catchall(z.function().optional(), {
      message: `${debugName}Templater slot's can only be functions`,
    }) // All other keys, if present, must be functions.
    .transform((arg) => Object.freeze(arg));

export const useTemplaterAndProjector = (debugName) => {
  let storedSlot;

  let templaterProps;

  callCount++;

  const componentNamePrefix = debugName ?? `${callCount}`;

  const Templater = createAstroFunctionalComponent((props, slots) => {
    const templaterSlotSchema =
      createTemplaterSlotsSchemaWithDebugName(componentNamePrefix);
    storedSlot = templaterSlotSchema.parse(slots).default;

    templaterProps = propsSchema.parse(props);
  });

  const Projector = createAstroFunctionalComponent(async (props, slots) => {
    let storedSlotResult = storedSlot();

    if (storedSlotResult instanceof Promise) {
      storedSlotResult = await storedSlotResult;
    }

    const storedSlotFirstExpression = storedSlotResult?.expressions.at(0);

    const projectorProps = propsSchema.parse(props);

    if (typeof storedSlotFirstExpression !== 'function') {
      return storedSlot;
    }

    // Functions are returned in these statements to avoid bugs
    // Astro will return an [Object, Object] if no function is returned
    if (!('default' in slots)) {
      return () => storedSlotFirstExpression(projectorProps);
    }

    //# Astro adds a default data property to all components
    // This how how props need to be checked
    const projectorPropsIsAnObjectWithItsOwnKeys =
      Object.keys(projectorProps).length > 1;
    const templaterPropsIsAnObjectWithItsOwnKeys =
      Object.keys(templaterProps).length > 1;
    //#

    if (
      projectorPropsIsAnObjectWithItsOwnKeys &&
      templaterPropsIsAnObjectWithItsOwnKeys
    ) {
      return () =>
        storedSlotFirstExpression(projectorProps, () =>
          slots.default(templaterProps),
        );
    }

    if (projectorPropsIsAnObjectWithItsOwnKeys) {
      return () => storedSlotFirstExpression(projectorProps, slots.default);
    }

    return () => storedSlotFirstExpression(slots.default);
  });

  return [Templater, Projector];
};
