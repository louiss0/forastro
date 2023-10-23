
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


type ProjectorSlot = () => RenderTemplateResult | undefined


type TemplaterProps<
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorContext> extends StringKeyedObjectLiteralWithUnknownValues
    ? TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: TemplaterContext
        children: (context: ProjectorContext, defaultSlot: ProjectorSlot) => unknown
    } : {
        children: (context: ProjectorContext, defaultSlot: ProjectorSlot) => unknown
    }
    : TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: TemplaterContext
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
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<
        ProjectorContext
    > extends StringKeyedObjectLiteralWithUnknownValues
    ?
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: ProjectorContext
        children(context: TemplaterContext): unknown
    }
    : {
        context: ProjectorContext
        children?: Array<astroHTML.JSX.HTMLAttributes> | string;
    }
    : TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        children(context: TemplaterContext): unknown
    }
    : { children?: Array<astroHTML.JSX.HTMLAttributes> | string; }


declare function Templater<T, U>(props: TemplaterProps<T, U>): any

declare function Projector<T, U>(props: ProjectorProps<T, U>): any


export function useTemplaterAndProjector<
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    TemplaterContext extends StringKeyedObjectLiteralWithUnknownValues | null = null
>(debugName?: string):
    [typeof Templater<ProjectorContext, TemplaterContext>, typeof Projector<TemplaterContext, ProjectorContext>] 