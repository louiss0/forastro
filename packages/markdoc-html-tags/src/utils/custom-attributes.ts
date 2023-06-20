

import type { ValidationError, Config as MarkdocConfig, Scalar, CustomAttributeTypeInterface } from "@markdoc/markdoc"


export abstract class MarkdocValidatorAttribute implements Required<CustomAttributeTypeInterface> {


    transform(value: Scalar) {

        return value
    }

    validate(value: unknown, config: MarkdocConfig) {

        const res = this.returnMarkdocErrorObjectOrNothing(value, config)
        return res ? [res] : []

    }

    abstract returnMarkdocErrorObjectOrNothing(
        value: unknown,
        config: MarkdocConfig
    ): ValidationError | void

}

