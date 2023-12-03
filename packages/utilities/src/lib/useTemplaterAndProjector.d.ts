
type RenderTemplateResult = {
    htmlParts: Array<string>
    expressions: Array<unknown>
    error?: Error
}

type StringKeyedObjectLiteralWithUnknownValues = Record<string, unknown>

type ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<T> =
    T extends StringKeyedObjectLiteralWithUnknownValues
    ? T
    : undefined


type ProjectorSlot = (() => RenderTemplateResult) | undefined


type TemplaterProps<
    ProjectorProps extends StringKeyedObjectLiteralWithUnknownValues | null,
    TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorProps> extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterProps & {
        children: (context: Readonly<ProjectorProps>, slots: ProjectorSlot) => unknown
    } : {
        children: (context: Readonly<ProjectorProps>, slots: ProjectorSlot) => unknown
    }
    : TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterProps & {

        children: ((defaultSlot: ProjectorSlot) => unknown)
        | Array<astroHTML.JSX.HTMLAttributes>
        | string;
    }
    : {
        children: ((defaultSlot: ProjectorSlot) => unknown)
        | Array<astroHTML.JSX.HTMLAttributes>
        | string;
    }






type ProjectorProps<
    TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues | null,
    ProjectorProps extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<
        ProjectorProps
    > extends StringKeyedObjectLiteralWithUnknownValues
    ?
    TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
    ? ProjectorProps & {
        children(context: Readonly<TemplaterProps>): unknown
    }
    : ProjectorProps & {
        children?: Array<astroHTML.JSX.HTMLAttributes> | string;
    }
    : TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues
    ? { children?(context: Readonly<TemplaterProps>): unknown }
    : { children?: Array<astroHTML.JSX.HTMLAttributes> | string; }


declare function Templater<T, U>(props: TemplaterProps<T, U>): any

declare function Projector<T, U>(props: ProjectorProps<T, U>): any


export function useTemplaterAndProjector<
    ProjectorProps extends StringKeyedObjectLiteralWithUnknownValues | null,
    TemplaterProps extends StringKeyedObjectLiteralWithUnknownValues | null = null
>(debugName?: string):
    [typeof Templater<ProjectorProps, TemplaterProps>, typeof Projector<TemplaterProps, ProjectorProps>] 