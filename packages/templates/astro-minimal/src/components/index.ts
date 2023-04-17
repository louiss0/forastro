import { LitElement, html,  } from 'lit'
import { customElement, property,  } from 'lit/decorators.js'
import { AllowedTailwindScreenWidths, FluidPercentages, SpacingNumbers } from '../misc/types';

type WidthClasses = `w-${FluidPercentages}`;
type Gap = `gap-${SpacingNumbers}`
type MaxScreenWidthClasses = `max-w-screen-${AllowedTailwindScreenWidths}`;

@customElement("app-container")
class Container extends LitElement {
    
    
    @property({
        type: String
    })
    widthClass:WidthClasses = "w-4/5";
    
    @property({
        type: String
    })
    maxWidthClass:MaxScreenWidthClasses = "max-w-screen-lg";

    protected render(): unknown {
        return html`      
        <div class=${`mx-auto ${this.widthClass} ${this.maxWidthClass}`}>
          <slot><span>Noting to contain</span></slot>
        </div>
        `
    }
}

@customElement("app-center")
class Center extends LitElement {



    @property({type:String}) gap:Gap 

    protected render(): unknown {
        
        return html`<div class=${`grid place-items-center ${this.gap}`}>
            <slot >Nothing to center</slot>
        </div>
            `

    }
}


export {Container, Center}