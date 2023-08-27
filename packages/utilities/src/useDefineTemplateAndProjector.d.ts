import type { RenderTemplateResult } from "astro/dist/runtime/server/render/astro/render-template"


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
    ProjectorContext,
    DefineTemplateContext,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorContext> extends StringKeyedObjectLiteralWithUnknownValues
    ? DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: DefineTemplateContext
        children: (context: ProjectorContext, defaultSlot: ProjectorSlot) => unknown
    } : {
        context?: never
        children: (context: ProjectorContext, defaultSlot: ProjectorSlot) => unknown
    }
    : {
        children: ((defaultSlot: ProjectorSlot) => unknown) | Array<astroHTML.JSX.HTMLAttributes> | string;
    }






type ProjectorProps<
    ProjectorContext,
    DefineTemplateContext,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorContext> extends StringKeyedObjectLiteralWithUnknownValues
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
    : {
        children?: Array<astroHTML.JSX.HTMLAttributes> | string;
    }


declare function DefineTemplate<T, U>(props: DefineTemplateProps<T, U>): any

declare function Projector<T, U>(props: ProjectorProps<T, U>): any


export function useDefineTemplateAndProjector<ProjectorContext, DefineTemplateContext = null>():
    [typeof DefineTemplate<ProjectorContext, DefineTemplateContext>, typeof Projector<ProjectorContext, DefineTemplateContext>] 