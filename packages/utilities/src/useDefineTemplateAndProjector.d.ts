
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


type DefineTemplateProps<
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorContext> extends StringKeyedObjectLiteralWithUnknownValues
    ? DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: DefineTemplateContext
        children: (context: ProjectorContext, defaultSlot: ProjectorSlot) => unknown
    } : {
        children: (context: ProjectorContext, defaultSlot: ProjectorSlot) => unknown
    }
    : DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: DefineTemplateContext
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
    DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<
        ProjectorContext
    > extends StringKeyedObjectLiteralWithUnknownValues
    ?
    DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: ProjectorContext
        children(context: DefineTemplateContext): unknown
    }
    : {
        context: ProjectorContext
        children?: Array<astroHTML.JSX.HTMLAttributes> | string;
    }
    : DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        children(context: DefineTemplateContext): unknown
    }
    : { children?: Array<astroHTML.JSX.HTMLAttributes> | string; }


declare function DefineTemplate<T, U>(props: DefineTemplateProps<T, U>): any

declare function Projector<T, U>(props: ProjectorProps<T, U>): any


export function useDefineTemplateAndProjector<
    ProjectorContext extends StringKeyedObjectLiteralWithUnknownValues | null,
    DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues | null = null
>(debugName?: string):
    [typeof DefineTemplate<ProjectorContext, DefineTemplateContext>, typeof Projector<DefineTemplateContext, ProjectorContext>] 