import { z } from 'astro/zod';
import { createAstroFunctionalComponent } from './internal';

let callCount = 0;

const createPropsSchemaWithDebugNameAndComponentName = (
  debugName,
  componentName,
) =>
  z
    .record([
      z.string().regex(/[a-z0-9]+(?:[A-Z][a-z0-9]+)+/, {
        message: `Prop keys are supposed to in camel case for ${debugName}${componentName}`,
      }),
      z.any(),
    ])
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
    storedSlot =
      createTemplaterSlotsSchemaWithDebugName(componentNamePrefix).parse(
        slots,
      ).default;

    templaterProps = createPropsSchemaWithDebugNameAndComponentName(
      componentNamePrefix,
      'Templater',
    ).parse(props);
  });

  const Projector = createAstroFunctionalComponent((props, slots) => {
    const storedSlotResult = storedSlot?.();

    const storedSlotFirstExpression = storedSlotResult?.expressions.at(0);

    const projectorPropsIsAnObjectWithItsOwnKeys =
      Object.keys(
        createPropsSchemaWithDebugNameAndComponentName(
          componentNamePrefix,
          'Projector',
        ).parse(props),
      ).length > 0;

    if (typeof storedSlotFirstExpression === 'function') {
      if (projectorPropsIsAnObjectWithItsOwnKeys) {
        if (templaterProps) {
          return () => slots?.default(templaterProps);
        }

        return () => slots?.default;
      }

      return () => storedSlotFirstExpression(slots.default);
    }

    return storedSlot;
  });

  return [Templater, Projector];
};
