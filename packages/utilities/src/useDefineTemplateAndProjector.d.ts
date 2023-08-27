
type StringKeyedObjectLiteralWithUnknownValues = Record<string, unknown>

type ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<T> =
    T extends StringKeyedObjectLiteralWithUnknownValues
    ? T
    : undefined


type ProjectorSlot = () => string | undefined


type DefineTemplateProps<
    ProjectorContext,
    DefineTemplateContext,
> =
    ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorContext> extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context?: DefineTemplateContext extends null ? never : DefineTemplateContext
        children: (context: ProjectorContext, defaultSlot: ProjectorSlot) => unknown
    }
    : ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<DefineTemplateContext> extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: DefineTemplateContext
        children: ((defaultSlot: ProjectorSlot) => unknown) | Array<astroHTML.JSX.HTMLAttributes> | string;

    }
    : {
        children: ((defaultSlot: ProjectorSlot) => unknown) | Array<astroHTML.JSX.HTMLAttributes> | string;
    };



type ProjectorProps<
    ProjectorContext,
    DefineTemplateContext,
> = DefineTemplateContext extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context?: ProjectorContext extends null ? never : ProjectorContext
        children(context: DefineTemplateContext): unknown
    }
    : ReturnUndefinedIfTypeIsNotAStringKeyedObjectLiteralWithUnknownValues<ProjectorContext> extends StringKeyedObjectLiteralWithUnknownValues
    ? {
        context: ProjectorContext
        children: Array<astroHTML.JSX.HTMLAttributes> | string;

    }
    : {
        children?: Array<astroHTML.JSX.HTMLAttributes> | string;
    }

declare function DefineTemplate<T, U>(props: DefineTemplateProps<T, U>): any

declare function Projector<T, U>(props: ProjectorProps<T, U>): any


export function useDefineTemplateAndProjector<ProjectorContext, DefineTemplateContext = null>():
    [typeof DefineTemplate<ProjectorContext, DefineTemplateContext>, typeof Projector<ProjectorContext, DefineTemplateContext>] 