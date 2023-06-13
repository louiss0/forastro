import type { ValidationError, Config as MarkdocConfig, Scalar, CustomAttributeTypeInterface } from "packages/markdoc-html-tags/src/utils/markdoc"


export abstract class MarkdocValidatorAttribute implements CustomAttributeTypeInterface {


    transform(value: unknown, config: MarkdocConfig): Scalar {

        return value as Scalar
    }

    validate(value: unknown, config: MarkdocConfig) {

        const res = this.returnMarkdocErrorObjectOrNull(value, config)
        return res ? [res] : []

    }

    abstract returnMarkdocErrorObjectOrNull(
        value: unknown,
        config: MarkdocConfig
    ): ValidationError | null

}

