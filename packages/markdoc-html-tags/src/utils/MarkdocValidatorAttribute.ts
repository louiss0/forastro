import type { ValidationError, Config as MarkdocConfig, Scalar, CustomAttributeTypeInterface } from "@markdoc/markdoc"


export abstract class MarkdocValidatorAttribute implements CustomAttributeTypeInterface {


    transform(value: unknown): Scalar {

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

