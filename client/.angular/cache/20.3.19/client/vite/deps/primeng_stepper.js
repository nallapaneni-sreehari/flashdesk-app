import {
  transformToBoolean
} from "./chunk-BB55NINM.js";
import {
  BaseComponent
} from "./chunk-WU5D4XG2.js";
import {
  BaseStyle
} from "./chunk-43IRF5IT.js";
import {
  PrimeTemplate,
  SharedModule
} from "./chunk-RS5NX4Y5.js";
import {
  find,
  findIndexInList,
  uuid
} from "./chunk-CIXKWFNL.js";
import "./chunk-BQAWEH44.js";
import {
  animate,
  state,
  style,
  transition,
  trigger
} from "./chunk-G2VGOM2D.js";
import {
  CommonModule,
  NgTemplateOutlet
} from "./chunk-YUDMOGVW.js";
import "./chunk-2ZFTCAES.js";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Injectable,
  NgModule,
  ViewEncapsulation,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  setClassMetadata,
  signal,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵcontentQuery,
  ɵɵcontentQuerySignal,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵpureFunction3,
  ɵɵqueryAdvance,
  ɵɵqueryRefresh,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-KBM7C55I.js";
import "./chunk-HWYXSU2G.js";
import "./chunk-JRFR6BLO.js";
import "./chunk-MARUHEWW.js";
import "./chunk-4MWRP73S.js";

// node_modules/primeng/fesm2022/primeng-stepper.mjs
var _c0 = ["*"];
var _c1 = ["content"];
var _c2 = (a0, a1, a2) => ({
  activateCallback: a0,
  value: a1,
  active: a2
});
function Step_Conditional_0_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "p-stepper-separator");
  }
}
function Step_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "button", 0);
    ɵɵlistener("click", function Step_Conditional_0_Template_button_click_0_listener() {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onStepClick());
    });
    ɵɵelementStart(1, "span", 1);
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementStart(3, "span", 2);
    ɵɵprojection(4);
    ɵɵelementEnd()();
    ɵɵconditionalCreate(5, Step_Conditional_0_Conditional_5_Template, 1, 0, "p-stepper-separator");
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵproperty("tabindex", ctx_r1.isStepDisabled() ? -1 : void 0)("disabled", ctx_r1.isStepDisabled());
    ɵɵattribute("id", ctx_r1.id())("role", "tab")("aria-controls", ctx_r1.ariaControls());
    ɵɵadvance(2);
    ɵɵtextInterpolate(ctx_r1.value());
    ɵɵadvance(3);
    ɵɵconditional(ctx_r1.isSeparatorVisible() ? 5 : -1);
  }
}
function Step_Conditional_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Step_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "p-stepper-separator");
  }
}
function Step_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Step_Conditional_1_ng_container_0_Template, 1, 0, "ng-container", 3);
    ɵɵconditionalCreate(1, Step_Conditional_1_Conditional_1_Template, 1, 0, "p-stepper-separator");
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵproperty("ngTemplateOutlet", ctx_r1.content || ctx_r1._contentTemplate)("ngTemplateOutletContext", ɵɵpureFunction3(3, _c2, ctx_r1.onStepClick.bind(ctx_r1), ctx_r1.value(), ctx_r1.active()));
    ɵɵadvance();
    ɵɵconditional(ctx_r1.isSeparatorVisible() ? 1 : -1);
  }
}
var _c3 = (a0) => ({
  transitionParams: a0
});
var _c4 = (a0) => ({
  value: "visible",
  params: a0
});
var _c5 = (a0) => ({
  value: "hidden",
  params: a0
});
function StepPanel_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "p-stepper-separator");
  }
}
function StepPanel_Conditional_2_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function StepPanel_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, StepPanel_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngTemplateOutlet", ctx_r0.contentTemplate || ctx_r0._contentTemplate)("ngTemplateOutletContext", ɵɵpureFunction3(2, _c2, ctx_r0.updateValue.bind(ctx_r0), ctx_r0.value(), ctx_r0.active()));
  }
}
var theme = ({
  dt
}) => `
.p-steplist {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style-type: none;
    overflow-x: auto;
}

.p-step {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: ${dt("stepper.step.gap")};
    padding: ${dt("stepper.step.padding")};
}

.p-step:last-of-type {
    flex: initial;
}

.p-step-header {
    border: 0 none;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
    transition: background ${dt("stepper.transition.duration")}, color ${dt("stepper.transition.duration")}, border-color ${dt("stepper.transition.duration")}, outline-color ${dt("stepper.transition.duration")}, box-shadow ${dt("stepper.transition.duration")};
    border-radius: ${dt("stepper.step.header.border.radius")};
    outline-color: transparent;
    background: transparent;
    padding: ${dt("stepper.step.header.padding")};
    gap: ${dt("stepper.step.header.gap")};
}

.p-step-header:focus-visible {
    box-shadow: ${dt("stepper.step.header.focus.ring.shadow")};
    outline: ${dt("stepper.step.header.focus.ring.width")} ${dt("stepper.step.header.focus.ring.style")} ${dt("stepper.step.header.focus.ring.color")};
    outline-offset: ${dt("stepper.step.header.focus.ring.offset")};
}

.p-stepper.p-stepper-readonly .p-step {
    cursor: auto;
}

.p-step-title {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    color: ${dt("stepper.step.title.color")};
    font-weight: ${dt("stepper.step.title.font.weight")};
    transition: background ${dt("stepper.transition.duration")}, color ${dt("stepper.transition.duration")}, border-color ${dt("stepper.transition.duration")}, box-shadow ${dt("stepper.transition.duration")}, outline-color ${dt("stepper.transition.duration")};
}

.p-step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${dt("stepper.step.number.color")};
    border: 2px solid ${dt("stepper.step.number.border.color")};
    background: ${dt("stepper.step.number.background")};
    min-width: ${dt("stepper.step.number.size")};
    height: ${dt("stepper.step.number.size")};
    line-height: ${dt("stepper.step.number.size")};
    font-size: ${dt("stepper.step.number.font.size")};
    z-index: 1;
    border-radius: ${dt("stepper.step.number.border.radius")};
    position: relative;
    font-weight: ${dt("stepper.step.number.font.weight")};
}

.p-step-number::after {
    content: " ";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${dt("stepper.step.number.border.radius")};
    box-shadow: ${dt("stepper.step.number.shadow")};
}

.p-step-active .p-step-header {
    cursor: default;
}

.p-step-active .p-step-number {
    background: ${dt("stepper.step.number.active.background")};
    border-color: ${dt("stepper.step.number.active.border.color")};
    color: ${dt("stepper.step.number.active.color")};
}

.p-step-active .p-step-title {
    color: ${dt("stepper.step.title.active.color")};
}

.p-step:not(.p-disabled):focus-visible {
    outline: ${dt("focus.ring.width")} ${dt("focus.ring.style")} ${dt("focus.ring.color")};
    outline-offset: ${dt("focus.ring.offset")};
}

.p-step:has(~ .p-step-active) .p-stepper-separator {
    background: ${dt("stepper.separator.active.background")};
}

.p-stepper-separator {
    flex: 1 1 0;
    background: ${dt("stepper.separator.background")};
    width: 100%;
    height: ${dt("stepper.separator.size")};
    transition: background ${dt("stepper.transition.duration")}, color ${dt("stepper.transition.duration")}, border-color ${dt("stepper.transition.duration")}, box-shadow ${dt("stepper.transition.duration")}, outline-color ${dt("stepper.transition.duration")};
}

.p-steppanels {
    padding: ${dt("stepper.steppanels.padding")};
}

.p-steppanel {
    background: ${dt("stepper.steppanel.background")};
    color: ${dt("stepper.steppanel.color")};
}

.p-stepper:has(.p-stepitem) {
    display: flex;
    flex-direction: column;
}

.p-stepitem {
    display: flex;
    flex-direction: column;
    flex: initial;
}

.p-stepitem.p-stepitem-active {
    flex: 1 1 auto;
}

.p-stepitem .p-step {
    flex: initial;
}

.p-stepitem .p-steppanel-content {
    width: 100%;
    padding: ${dt("stepper.steppanel.padding")};
    margin-inline-start: 1rem;
}

.p-stepitem .p-steppanel {
    display: flex;
    flex: 1 1 auto;
}

.p-stepitem .p-stepper-separator {
    flex: 0 0 auto;
    width: ${dt("stepper.separator.size")};
    height: auto;
    margin: ${dt("stepper.separator.margin")};
    position: relative;
    left: calc(-1 * ${dt("stepper.separator.size")});
}

.p-stepitem .p-stepper-separator:dir(rtl) {
    left: calc(-9 * ${dt("stepper.separator.size")});
}

.p-stepitem:has(~ .p-stepitem-active) .p-stepper-separator {
    background: ${dt("stepper.separator.active.background")};
}

.p-stepitem:last-of-type .p-steppanel {
    padding-inline-start: ${dt("stepper.step.number.size")};
}
/* For PrimeNG */
.p-steppanel {
    overflow: hidden;
}

.p-stepppanel:not(.ng-animating) {
    overflow: inherit;
}
`;
var classes = {
  root: ({
    props
  }) => ["p-stepper p-component", {
    "p-readonly": props.linear
  }],
  separator: "p-stepper-separator"
};
var StepperStyle = class _StepperStyle extends BaseStyle {
  name = "stepper";
  theme = theme;
  classes = classes;
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵStepperStyle_BaseFactory;
    return function StepperStyle_Factory(__ngFactoryType__) {
      return (ɵStepperStyle_BaseFactory || (ɵStepperStyle_BaseFactory = ɵɵgetInheritedFactory(_StepperStyle)))(__ngFactoryType__ || _StepperStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _StepperStyle,
    factory: _StepperStyle.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StepperStyle, [{
    type: Injectable
  }], null, null);
})();
var StepperClasses;
(function(StepperClasses2) {
  StepperClasses2["root"] = "p-stepper";
  StepperClasses2["separator"] = "p-stepper-separator";
})(StepperClasses || (StepperClasses = {}));
var StepList = class _StepList extends BaseComponent {
  steps = contentChildren(forwardRef(() => Step));
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵStepList_BaseFactory;
    return function StepList_Factory(__ngFactoryType__) {
      return (ɵStepList_BaseFactory || (ɵStepList_BaseFactory = ɵɵgetInheritedFactory(_StepList)))(__ngFactoryType__ || _StepList);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _StepList,
    selectors: [["p-step-list"]],
    contentQueries: function StepList_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuerySignal(dirIndex, ctx.steps, Step, 4);
      }
      if (rf & 2) {
        ɵɵqueryAdvance();
      }
    },
    hostVars: 4,
    hostBindings: function StepList_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("p-steplist", true)("p-component", true);
      }
    },
    features: [ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function StepList_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    dependencies: [CommonModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StepList, [{
    type: Component,
    args: [{
      selector: "p-step-list",
      standalone: true,
      imports: [CommonModule],
      template: ` <ng-content></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        "[class.p-steplist]": "true",
        "[class.p-component]": "true"
      }
    }]
  }], null, null);
})();
var StepperSeparator = class _StepperSeparator extends BaseComponent {
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵStepperSeparator_BaseFactory;
    return function StepperSeparator_Factory(__ngFactoryType__) {
      return (ɵStepperSeparator_BaseFactory || (ɵStepperSeparator_BaseFactory = ɵɵgetInheritedFactory(_StepperSeparator)))(__ngFactoryType__ || _StepperSeparator);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _StepperSeparator,
    selectors: [["p-stepper-separator"]],
    hostVars: 4,
    hostBindings: function StepperSeparator_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("p-stepper-separator", true)("p-component", true);
      }
    },
    features: [ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function StepperSeparator_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    dependencies: [CommonModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StepperSeparator, [{
    type: Component,
    args: [{
      selector: "p-stepper-separator",
      standalone: true,
      imports: [CommonModule],
      template: ` <ng-content></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        "[class.p-stepper-separator]": "true",
        "[class.p-component]": "true"
      }
    }]
  }], null, null);
})();
var StepItem = class _StepItem extends BaseComponent {
  pcStepper = inject(forwardRef(() => Stepper));
  /**
   * Value of step.
   * @type {<number | undefined>}
   * @defaultValue undefined
   * @group Props
   */
  value = model();
  isActive = computed(() => this.pcStepper.value() === this.value());
  step = contentChild(forwardRef(() => Step));
  stepPanel = contentChild(forwardRef(() => StepPanel));
  constructor() {
    super();
    effect(() => {
      this.step().value.set(this.value());
    });
    effect(() => {
      this.stepPanel().value.set(this.value());
    });
  }
  static ɵfac = function StepItem_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _StepItem)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _StepItem,
    selectors: [["p-step-item"]],
    contentQueries: function StepItem_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuerySignal(dirIndex, ctx.step, Step, 5);
        ɵɵcontentQuerySignal(dirIndex, ctx.stepPanel, StepPanel, 5);
      }
      if (rf & 2) {
        ɵɵqueryAdvance(2);
      }
    },
    hostVars: 5,
    hostBindings: function StepItem_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("data-p-active", ctx.isActive());
        ɵɵclassProp("p-stepitem", true)("p-component", true);
      }
    },
    inputs: {
      value: [1, "value"]
    },
    outputs: {
      value: "valueChange"
    },
    features: [ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function StepItem_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    dependencies: [CommonModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StepItem, [{
    type: Component,
    args: [{
      selector: "p-step-item",
      standalone: true,
      imports: [CommonModule],
      template: ` <ng-content></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        "[class.p-stepitem]": "true",
        "[class.p-component]": "true",
        "[attr.data-p-active]": "isActive()"
      }
    }]
  }], () => [], null);
})();
var Step = class _Step extends BaseComponent {
  pcStepper = inject(forwardRef(() => Stepper));
  /**
   * Active value of stepper.
   * @type {number}
   * @defaultValue undefined
   * @group Props
   */
  value = model();
  /**
   * Whether the step is disabled.
   * @type {boolean}
   * @defaultValue false
   * @group Props
   */
  disabled = input(false, {
    transform: (v) => transformToBoolean(v)
  });
  active = computed(() => this.pcStepper.isStepActive(this.value()));
  isStepDisabled = computed(() => !this.active() && (this.pcStepper.linear() || this.disabled()));
  id = computed(() => `${this.pcStepper.id()}_step_${this.value()}`);
  ariaControls = computed(() => `${this.pcStepper.id()}_steppanel_${this.value()}`);
  isSeparatorVisible = computed(() => {
    if (this.pcStepper.stepList()) {
      const steps = this.pcStepper.stepList().steps();
      const index = steps.indexOf(this);
      const stepLen = steps.length;
      return index !== stepLen - 1;
    } else {
      return false;
    }
  });
  /**
   * Content template.
   * @type {TemplateRef<StepContentTemplateContext>}
   * @group Templates
   */
  content;
  templates;
  _contentTemplate;
  ngAfterContentInit() {
    this.templates?.forEach((item) => {
      switch (item.getType()) {
        case "content":
          this._contentTemplate = item.template;
          break;
      }
    });
  }
  onStepClick() {
    this.pcStepper.updateValue(this.value());
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵStep_BaseFactory;
    return function Step_Factory(__ngFactoryType__) {
      return (ɵStep_BaseFactory || (ɵStep_BaseFactory = ɵɵgetInheritedFactory(_Step)))(__ngFactoryType__ || _Step);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _Step,
    selectors: [["p-step"]],
    contentQueries: function Step_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, _c1, 4);
        ɵɵcontentQuery(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.content = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
      }
    },
    hostVars: 13,
    hostBindings: function Step_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("aria-current", ctx.active() ? "step" : void 0)("role", "presentation")("data-p-active", ctx.active())("data-p-disabled", ctx.isStepDisabled())("data-pc-name", "step");
        ɵɵclassProp("p-step", true)("p-step-active", ctx.active())("p-disabled", ctx.isStepDisabled())("p-component", true);
      }
    },
    inputs: {
      value: [1, "value"],
      disabled: [1, "disabled"]
    },
    outputs: {
      value: "valueChange"
    },
    features: [ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 2,
    vars: 1,
    consts: [["type", "button", 1, "p-step-header", 3, "click", "tabindex", "disabled"], [1, "p-step-number"], [1, "p-step-title"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"]],
    template: function Step_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵconditionalCreate(0, Step_Conditional_0_Template, 6, 7)(1, Step_Conditional_1_Template, 2, 7);
      }
      if (rf & 2) {
        ɵɵconditional(!ctx.content && !ctx._contentTemplate ? 0 : 1);
      }
    },
    dependencies: [CommonModule, NgTemplateOutlet, StepperSeparator, SharedModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Step, [{
    type: Component,
    args: [{
      selector: "p-step",
      standalone: true,
      imports: [CommonModule, StepperSeparator, SharedModule],
      template: `
        @if (!content && !_contentTemplate) {
            <button [attr.id]="id()" class="p-step-header" [attr.role]="'tab'" [tabindex]="isStepDisabled() ? -1 : undefined" [attr.aria-controls]="ariaControls()" [disabled]="isStepDisabled()" (click)="onStepClick()" type="button">
                <span class="p-step-number">{{ value() }}</span>
                <span class="p-step-title">
                    <ng-content></ng-content>
                </span>
            </button>
            @if (isSeparatorVisible()) {
                <p-stepper-separator />
            }
        } @else {
            <ng-container *ngTemplateOutlet="content || _contentTemplate; context: { activateCallback: onStepClick.bind(this), value: value(), active: active() }"></ng-container>
            @if (isSeparatorVisible()) {
                <p-stepper-separator />
            }
        }
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        "[class.p-step]": "true",
        "[class.p-step-active]": "active()",
        "[class.p-disabled]": "isStepDisabled()",
        "[class.p-component]": "true",
        "[attr.aria-current]": 'active() ? "step" : undefined',
        "[attr.role]": '"presentation"',
        "[attr.data-p-active]": "active()",
        "[attr.data-p-disabled]": "isStepDisabled()",
        "[attr.data-pc-name]": '"step"'
      }
    }]
  }], null, {
    content: [{
      type: ContentChild,
      args: ["content", {
        descendants: false
      }]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var StepPanel = class _StepPanel extends BaseComponent {
  pcStepper = inject(forwardRef(() => Stepper));
  transitionOptions = computed(() => this.pcStepper.transitionOptions());
  /**
   * Active value of stepper.
   * @type {number}
   * @defaultValue undefined
   * @group Props
   */
  value = model(void 0);
  active = computed(() => this.pcStepper.value() === this.value());
  ariaControls = computed(() => `${this.pcStepper.id()}_step_${this.value()}`);
  id = computed(() => `${this.pcStepper.id()}_steppanel_${this.value()}`);
  isVertical = computed(() => this.pcStepper.stepItems().length > 0);
  isSeparatorVisible = computed(() => {
    if (this.pcStepper.stepItems()) {
      const stepLen = this.pcStepper.stepItems().length;
      const stepPanelElements = find(this.pcStepper.el.nativeElement, '[data-pc-name="steppanel"]');
      const index = findIndexInList(this.el.nativeElement, stepPanelElements);
      return index !== stepLen - 1;
    }
  });
  /**
   * Content template.
   * @param {StepPanelContentTemplateContext} context - Context of the template
   * @see {@link StepPanelContentTemplateContext}
   * @group Templates
   */
  contentTemplate;
  templates;
  _contentTemplate;
  ngAfterContentInit() {
    this.templates?.forEach((item) => {
      switch (item.getType()) {
        case "content":
          this._contentTemplate = item.template;
          break;
      }
    });
  }
  updateValue(value) {
    this.pcStepper.updateValue(value);
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵStepPanel_BaseFactory;
    return function StepPanel_Factory(__ngFactoryType__) {
      return (ɵStepPanel_BaseFactory || (ɵStepPanel_BaseFactory = ɵɵgetInheritedFactory(_StepPanel)))(__ngFactoryType__ || _StepPanel);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _StepPanel,
    selectors: [["p-step-panel"]],
    contentQueries: function StepPanel_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, _c1, 5);
        ɵɵcontentQuery(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.contentTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
      }
    },
    hostVars: 11,
    hostBindings: function StepPanel_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("role", "tabpanel")("aria-controls", ctx.ariaControls())("id", ctx.id())("data-p-active", ctx.active())("data-pc-name", "steppanel");
        ɵɵclassProp("p-steppanel", true)("p-component", true)("p-steppanel-active", ctx.active());
      }
    },
    inputs: {
      value: [1, "value"]
    },
    outputs: {
      value: "valueChange"
    },
    features: [ɵɵInheritDefinitionFeature],
    decls: 3,
    vars: 11,
    consts: [[1, "p-steppanel-content"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"]],
    template: function StepPanel_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, StepPanel_Conditional_0_Template, 1, 0, "p-stepper-separator");
        ɵɵelementStart(1, "div", 0);
        ɵɵconditionalCreate(2, StepPanel_Conditional_2_Template, 1, 6, "ng-container");
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵconditional(ctx.isSeparatorVisible() ? 0 : -1);
        ɵɵadvance();
        ɵɵproperty("@content", ctx.isVertical() ? ctx.active() ? ɵɵpureFunction1(5, _c4, ɵɵpureFunction1(3, _c3, ctx.transitionOptions())) : ɵɵpureFunction1(9, _c5, ɵɵpureFunction1(7, _c3, ctx.transitionOptions())) : void 0);
        ɵɵadvance();
        ɵɵconditional(ctx.active() ? 2 : -1);
      }
    },
    dependencies: [CommonModule, NgTemplateOutlet, StepperSeparator, SharedModule],
    encapsulation: 2,
    data: {
      animation: [trigger("content", [state("hidden", style({
        height: "0",
        visibility: "hidden"
      })), state("visible", style({
        height: "*",
        visibility: "visible"
      })), transition("visible <=> hidden", [animate("250ms cubic-bezier(0.86, 0, 0.07, 1)")]), transition("void => *", animate(0))])]
    },
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StepPanel, [{
    type: Component,
    args: [{
      selector: "p-step-panel",
      standalone: true,
      imports: [CommonModule, StepperSeparator, SharedModule],
      template: `
        @if (isSeparatorVisible()) {
            <p-stepper-separator />
        }
        <div class="p-steppanel-content" [@content]="isVertical() ? (active() ? { value: 'visible', params: { transitionParams: transitionOptions() } } : { value: 'hidden', params: { transitionParams: transitionOptions() } }) : undefined">
            @if (active()) {
                <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate; context: { activateCallback: updateValue.bind(this), value: value(), active: active() }"></ng-container>
            }
        </div>
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        "[class.p-steppanel]": "true",
        "[class.p-component]": "true",
        "[class.p-steppanel-active]": "active()",
        "[attr.role]": '"tabpanel"',
        "[attr.aria-controls]": "ariaControls()",
        "[attr.id]": "id()",
        "[attr.data-p-active]": "active()",
        "[attr.data-pc-name]": '"steppanel"'
      },
      animations: [trigger("content", [state("hidden", style({
        height: "0",
        visibility: "hidden"
      })), state("visible", style({
        height: "*",
        visibility: "visible"
      })), transition("visible <=> hidden", [animate("250ms cubic-bezier(0.86, 0, 0.07, 1)")]), transition("void => *", animate(0))])]
    }]
  }], null, {
    contentTemplate: [{
      type: ContentChild,
      args: ["content"]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var StepPanels = class _StepPanels extends BaseComponent {
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵStepPanels_BaseFactory;
    return function StepPanels_Factory(__ngFactoryType__) {
      return (ɵStepPanels_BaseFactory || (ɵStepPanels_BaseFactory = ɵɵgetInheritedFactory(_StepPanels)))(__ngFactoryType__ || _StepPanels);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _StepPanels,
    selectors: [["p-step-panels"]],
    hostVars: 4,
    hostBindings: function StepPanels_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("p-steppanels", true)("p-component", true);
      }
    },
    features: [ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function StepPanels_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    dependencies: [CommonModule, SharedModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StepPanels, [{
    type: Component,
    args: [{
      selector: "p-step-panels",
      standalone: true,
      imports: [CommonModule, SharedModule],
      template: ` <ng-content></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        "[class.p-steppanels]": "true",
        "[class.p-component]": "true"
      }
    }]
  }], null, null);
})();
var Stepper = class _Stepper extends BaseComponent {
  /**
   * A model that can hold a numeric value or be undefined.
   * @defaultValue undefined
   * @type {ModelSignal<number | undefined>}
   * @group Props
   */
  value = model(void 0);
  /**
   * A boolean variable that captures user input.
   * @defaultValue false
   * @type {InputSignalWithTransform<any, boolean >}
   * @group Props
   */
  linear = input(false, {
    transform: (v) => transformToBoolean(v)
  });
  /**
   * Transition options of the animation.
   * @defaultValue 400ms cubic-bezier(0.86, 0, 0.07, 1)
   * @type {InputSignal<string >}
   * @group Props
   */
  transitionOptions = input("400ms cubic-bezier(0.86, 0, 0.07, 1)");
  _componentStyle = inject(StepperStyle);
  id = signal(uuid("pn_id_"));
  stepItems = contentChildren(StepItem);
  steps = contentChildren(Step);
  stepList = contentChild(StepList);
  updateValue(value) {
    this.value.set(value);
  }
  isStepActive(value) {
    return this.value() === value;
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵStepper_BaseFactory;
    return function Stepper_Factory(__ngFactoryType__) {
      return (ɵStepper_BaseFactory || (ɵStepper_BaseFactory = ɵɵgetInheritedFactory(_Stepper)))(__ngFactoryType__ || _Stepper);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _Stepper,
    selectors: [["p-stepper"]],
    contentQueries: function Stepper_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuerySignal(dirIndex, ctx.stepItems, StepItem, 4);
        ɵɵcontentQuerySignal(dirIndex, ctx.steps, Step, 4);
        ɵɵcontentQuerySignal(dirIndex, ctx.stepList, StepList, 5);
      }
      if (rf & 2) {
        ɵɵqueryAdvance(3);
      }
    },
    hostVars: 6,
    hostBindings: function Stepper_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("role", "tablist")("id", ctx.id());
        ɵɵclassProp("p-stepper", true)("p-component", true);
      }
    },
    inputs: {
      value: [1, "value"],
      linear: [1, "linear"],
      transitionOptions: [1, "transitionOptions"]
    },
    outputs: {
      value: "valueChange"
    },
    features: [ɵɵProvidersFeature([StepperStyle]), ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function Stepper_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    dependencies: [CommonModule, SharedModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Stepper, [{
    type: Component,
    args: [{
      selector: "p-stepper",
      standalone: true,
      imports: [CommonModule, SharedModule],
      template: ` <ng-content></ng-content>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [StepperStyle],
      host: {
        "[class.p-stepper]": "true",
        "[class.p-component]": "true",
        "[attr.role]": '"tablist"',
        "[attr.id]": "id()"
      }
    }]
  }], null, null);
})();
var StepperModule = class _StepperModule {
  static ɵfac = function StepperModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _StepperModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _StepperModule,
    imports: [Stepper, StepList, StepPanels, StepPanel, StepItem, Step, StepperSeparator, SharedModule],
    exports: [Stepper, StepList, StepPanels, StepPanel, StepItem, Step, StepperSeparator, SharedModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [Stepper, StepList, StepPanels, StepPanel, StepItem, Step, StepperSeparator, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StepperModule, [{
    type: NgModule,
    args: [{
      imports: [Stepper, StepList, StepPanels, StepPanel, StepItem, Step, StepperSeparator, SharedModule],
      exports: [Stepper, StepList, StepPanels, StepPanel, StepItem, Step, StepperSeparator, SharedModule]
    }]
  }], null, null);
})();
export {
  Step,
  StepItem,
  StepList,
  StepPanel,
  StepPanels,
  Stepper,
  StepperClasses,
  StepperModule,
  StepperSeparator,
  StepperStyle
};
//# sourceMappingURL=primeng_stepper.js.map
