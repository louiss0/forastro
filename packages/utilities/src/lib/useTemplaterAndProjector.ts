import { z } from 'astro/zod';
import { createAstroFunctionalComponent, type SlotFunction } from './internal';

let callCount = 0;

const propsSchema = z
  .record(z.string(), z.any())
  .transform((arg) => Object.freeze(arg));

const createTemplaterSlotsSchemaWithDebugName = (debugName: string) =>
  z
    .object(
      {
        default: z.function(), // "default" is required and must be a function.
      },
      { message: `${debugName}Templater slot's is supposed to have a child` },
    )
    .catchall(z.function().optional()) // All other keys, if present, must be functions.
    .transform((arg) => Object.freeze(arg));

type StringKeyedObjectLiteralWithUnknownValues = Record<string, unknown>;

type ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<T> =
  T extends StringKeyedObjectLiteralWithUnknownValues ? T : undefined;

type TemplaterProps<
  ProjectorProps extends StringKeyedObjectLiteralWithUnknownValues | null,
  TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
  ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorProps> extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
      ? TemplaterProps & {
          children: (
            context: Readonly<ProjectorProps>,
            slots: SlotFunction,
          ) => unknown;
        }
      : {
          children: (
            context: Readonly<ProjectorProps>,
            slots: SlotFunction,
          ) => unknown;
        }
    : TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
      ? TemplaterProps & {
          children:
            | ((defaultSlot: SlotFunction) => unknown)
            | Array<astroHTML.JSX.HTMLAttributes>
            | string;
        }
      : {
          children:
            | ((defaultSlot: SlotFunction) => unknown)
            | Array<astroHTML.JSX.HTMLAttributes>
            | string;
        };

type ProjectorProps<
  TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues | null,
  ProjectorProps extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
  ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorProps> extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
      ? ProjectorProps & {
          children(context: Readonly<TemplaterProps>): unknown;
        }
      : ProjectorProps & {
          children?: Array<astroHTML.JSX.HTMLAttributes> | string;
        }
    : TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
      ? { children?(context: Readonly<TemplaterProps>): unknown }
      : { children?: Array<astroHTML.JSX.HTMLAttributes> | string };

export declare function Templater<
  T extends StringKeyedObjectLiteralWithUnknownValues | null,
  U extends StringKeyedObjectLiteralWithUnknownValues | null,
>(props: TemplaterProps<T, U>): unknown;

export declare function Projector<
  T extends StringKeyedObjectLiteralWithUnknownValues | null,
  U extends StringKeyedObjectLiteralWithUnknownValues | null,
>(props: ProjectorProps<T, U>): unknown;

export function useTemplaterAndProjector<
  ProjectorProps extends StringKeyedObjectLiteralWithUnknownValues | null,
  TemplaterProps extends
    StringKeyedObjectLiteralWithUnknownValues | null = null,
>(
  debugName: string,
): [
  typeof Templater<ProjectorProps, TemplaterProps>,
  typeof Projector<TemplaterProps, ProjectorProps>,
] {
  let storedSlot: SlotFunction;

  let templaterProps: Record<string, unknown>;

  callCount++;

  const componentNamePrefix = debugName ?? `${callCount}`;

  const _Templater = createAstroFunctionalComponent((props, slots) => {
    const templaterSlotSchema =
      createTemplaterSlotsSchemaWithDebugName(componentNamePrefix);
    storedSlot = templaterSlotSchema.parse(slots).default as SlotFunction;

    templaterProps = propsSchema.parse(props);

    return '';
  });

  const _Projector = createAstroFunctionalComponent(async (props, slots) => {
    if (!storedSlot) {
      throw new Error(`${componentNamePrefix}Projector is missing a slot`, {
        cause: 'Unjustified Call',
      });
    }

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
          slots['default']?.(templaterProps),
        );
    }

    if (projectorPropsIsAnObjectWithItsOwnKeys) {
      return () => storedSlotFirstExpression(projectorProps, slots['default']);
    }

    return () => storedSlotFirstExpression(slots['default']);
  });

  return [
    _Templater as unknown as typeof Templater,
    _Projector as unknown as typeof Projector,
  ];
}
