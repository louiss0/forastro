
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


type ProjectorSlots = {
    default:(() => RenderTemplateResult) | undefined
    [key: string]:(() => RenderTemplateResult) | undefined
}


type TemplaterProps<
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorContext> extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterContext & {
        children: (context: Readonly<ProjectorContext>, slots: ProjectorSlots) => unknown
    } : {
        children: (context: Readonly<ProjectorContext>, slots: ProjectorSlots) => unknown
    }
    : TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterContext & {

        children: ((defaultSlot: ProjectorSlots) => unknown)
        | Array<astroHTML.JSX.HTMLAttributes>
        | string;
    }
    : {
        children: ((defaultSlot: ProjectorSlots) => unknown)
        | Array<astroHTML.JSX.HTMLAttributes>
        | string;
    }






type ProjectorProps<
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<
        ProjectorContext
    > extends StringKeyedObjectLiteralWithUnknownValues
    ?
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? ProjectorContext & {
        children(context: Readonly<TemplaterContext>): unknown
    }
    : ProjectorContext & {
        children?: Array<astroHTML.JSX.HTMLAttributes> | string;
    }
    : TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        children(context: Readonly<TemplaterContext>): unknown
    }
    : { children?: Array<astroHTML.JSX.HTMLAttributes> | string; }


declare function Templater<T, U>(props: TemplaterProps<T, U>): any

declare function Projector<T, U>(props: ProjectorProps<T, U>): any


export function useTemplaterAndProjector<
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues | null = null
>(debugName?: string):
    [typeof Templater<ProjectorContext, TemplaterContext>, typeof Projector<TemplaterContext, ProjectorContext>] 