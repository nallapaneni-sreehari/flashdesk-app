import {
  Ripple
} from "./chunk-RTZMSEKM.js";
import {
  TimesIcon
} from "./chunk-VONC2QA7.js";
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
import "./chunk-CIXKWFNL.js";
import "./chunk-BQAWEH44.js";
import {
  animate,
  style,
  transition,
  trigger
} from "./chunk-G2VGOM2D.js";
import {
  CommonModule,
  NgClass,
  NgIf,
  NgTemplateOutlet
} from "./chunk-YUDMOGVW.js";
import "./chunk-2ZFTCAES.js";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Injectable,
  Input,
  NgModule,
  Output,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  setClassMetadata,
  signal,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵcontentQuery,
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
  ɵɵpureFunction2,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-KBM7C55I.js";
import "./chunk-HWYXSU2G.js";
import "./chunk-JRFR6BLO.js";
import "./chunk-MARUHEWW.js";
import "./chunk-4MWRP73S.js";

// node_modules/primeng/fesm2022/primeng-message.mjs
var _c0 = ["container"];
var _c1 = ["icon"];
var _c2 = ["closeicon"];
var _c3 = ["*"];
var _c4 = (a0, a1) => ({
  showTransitionParams: a0,
  hideTransitionParams: a1
});
var _c5 = (a0) => ({
  value: "visible()",
  params: a0
});
var _c6 = (a0) => ({
  closeCallback: a0
});
function Message_Conditional_0_Conditional_2_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Message_Conditional_0_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Message_Conditional_0_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 7);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("ngTemplateOutlet", ctx_r0.iconTemplate || ctx_r0.iconTemplate);
  }
}
function Message_Conditional_0_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("ngClass", ctx_r0.icon);
  }
}
function Message_Conditional_0_div_4_span_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "span", 9);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵproperty("ngClass", ctx_r0.cx("text"))("innerHTML", ctx_r0.text, ɵɵsanitizeHtml);
  }
}
function Message_Conditional_0_div_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div");
    ɵɵtemplate(1, Message_Conditional_0_div_4_span_1_Template, 1, 2, "span", 8);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r0.escape);
  }
}
function Message_Conditional_0_ng_template_5_span_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 5);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵproperty("ngClass", ctx_r0.cx("text"));
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.text);
  }
}
function Message_Conditional_0_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Message_Conditional_0_ng_template_5_span_0_Template, 2, 2, "span", 10);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("ngIf", ctx_r0.escape && ctx_r0.text);
  }
}
function Message_Conditional_0_Conditional_7_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Message_Conditional_0_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Message_Conditional_0_Conditional_7_ng_container_0_Template, 1, 0, "ng-container", 11);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("ngTemplateOutlet", ctx_r0.containerTemplate || ctx_r0.containerTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(2, _c6, ctx_r0.close.bind(ctx_r0)));
  }
}
function Message_Conditional_0_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 5);
    ɵɵprojection(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("ngClass", ctx_r0.cx("text"));
  }
}
function Message_Conditional_0_Conditional_9_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 13);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵproperty("ngClass", ctx_r0.closeIcon);
  }
}
function Message_Conditional_0_Conditional_9_Conditional_2_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function Message_Conditional_0_Conditional_9_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, Message_Conditional_0_Conditional_9_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 7);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵproperty("ngTemplateOutlet", ctx_r0.closeIconTemplate || ctx_r0._closeIconTemplate);
  }
}
function Message_Conditional_0_Conditional_9_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "TimesIcon", 14);
  }
}
function Message_Conditional_0_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "button", 12);
    ɵɵlistener("click", function Message_Conditional_0_Conditional_9_Template_button_click_0_listener($event) {
      ɵɵrestoreView(_r2);
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.close($event));
    });
    ɵɵconditionalCreate(1, Message_Conditional_0_Conditional_9_Conditional_1_Template, 1, 1, "i", 13);
    ɵɵconditionalCreate(2, Message_Conditional_0_Conditional_9_Conditional_2_Template, 1, 1, "ng-container");
    ɵɵconditionalCreate(3, Message_Conditional_0_Conditional_9_Conditional_3_Template, 1, 0, "TimesIcon", 14);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵattribute("aria-label", ctx_r0.closeAriaLabel);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.closeIcon ? 1 : -1);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.closeIconTemplate || ctx_r0._closeIconTemplate ? 2 : -1);
    ɵɵadvance();
    ɵɵconditional(!ctx_r0.closeIconTemplate && !ctx_r0._closeIconTemplate && !ctx_r0.closeIcon ? 3 : -1);
  }
}
function Message_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 1)(1, "div", 2);
    ɵɵconditionalCreate(2, Message_Conditional_0_Conditional_2_Template, 1, 1, "ng-container");
    ɵɵconditionalCreate(3, Message_Conditional_0_Conditional_3_Template, 1, 1, "i", 3);
    ɵɵtemplate(4, Message_Conditional_0_div_4_Template, 2, 1, "div", 4)(5, Message_Conditional_0_ng_template_5_Template, 1, 1, "ng-template", null, 0, ɵɵtemplateRefExtractor);
    ɵɵconditionalCreate(7, Message_Conditional_0_Conditional_7_Template, 1, 4, "ng-container")(8, Message_Conditional_0_Conditional_8_Template, 2, 1, "span", 5);
    ɵɵconditionalCreate(9, Message_Conditional_0_Conditional_9_Template, 4, 4, "button", 6);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const escapeOut_r3 = ɵɵreference(6);
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngClass", ctx_r0.containerClass)("@messageAnimation", ɵɵpureFunction1(13, _c5, ɵɵpureFunction2(10, _c4, ctx_r0.showTransitionOptions, ctx_r0.hideTransitionOptions)));
    ɵɵattribute("aria-live", "polite")("role", "alert");
    ɵɵadvance(2);
    ɵɵconditional(ctx_r0.iconTemplate || ctx_r0._iconTemplate ? 2 : -1);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.icon ? 3 : -1);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r0.escape)("ngIfElse", escapeOut_r3);
    ɵɵadvance(3);
    ɵɵconditional(ctx_r0.containerTemplate || ctx_r0._containerTemplate ? 7 : 8);
    ɵɵadvance(2);
    ɵɵconditional(ctx_r0.closable ? 9 : -1);
  }
}
var theme = ({
  dt
}) => `
.p-message {
    border-radius: ${dt("message.border.radius")};
    outline-width: ${dt("message.border.width")};
    outline-style: solid;
}

.p-message-content {
    display: flex;
    align-items: center;
    padding: ${dt("message.content.padding")};
    gap: ${dt("message.content.gap")};
    height: 100%;
}

.p-message-icon {
    flex-shrink: 0;
}

.p-message-close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-inline-start: auto;
    overflow: hidden;
    position: relative;
    width: ${dt("message.close.button.width")};
    height: ${dt("message.close.button.height")};
    border-radius: ${dt("message.close.button.border.radius")};
    background: transparent;
    transition: background ${dt("message.transition.duration")}, color ${dt("message.transition.duration")}, outline-color ${dt("message.transition.duration")}, box-shadow ${dt("message.transition.duration")}, opacity 0.3s;
    outline-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
    cursor: pointer;
    user-select: none;
}

.p-message-close-icon {
    font-size: ${dt("message.close.icon.size")};
    width: ${dt("message.close.icon.size")};
    height: ${dt("message.close.icon.size")};
}

.p-message-close-button:focus-visible {
    outline-width: ${dt("message.close.button.focus.ring.width")};
    outline-style: ${dt("message.close.button.focus.ring.style")};
    outline-offset: ${dt("message.close.button.focus.ring.offset")};
}

.p-message-info {
    background: ${dt("message.info.background")};
    outline-color: ${dt("message.info.border.color")};
    color: ${dt("message.info.color")};
    box-shadow: ${dt("message.info.shadow")};
}

.p-message-info .p-message-close-button:focus-visible {
    outline-color: ${dt("message.info.close.button.focus.ring.color")};
    box-shadow: ${dt("message.info.close.button.focus.ring.shadow")};
}

.p-message-info .p-message-close-button:hover {
    background: ${dt("message.info.close.button.hover.background")};
}

.p-message-info.p-message-outlined {
    color: ${dt("message.info.outlined.color")};
    outline-color: ${dt("message.info.outlined.border.color")};
}

.p-message-info.p-message-simple {
    color: ${dt("message.info.simple.color")};
}

.p-message-success {
    background: ${dt("message.success.background")};
    outline-color: ${dt("message.success.border.color")};
    color: ${dt("message.success.color")};
    box-shadow: ${dt("message.success.shadow")};
}

.p-message-success .p-message-close-button:focus-visible {
    outline-color: ${dt("message.success.close.button.focus.ring.color")};
    box-shadow: ${dt("message.success.close.button.focus.ring.shadow")};
}

.p-message-success .p-message-close-button:hover {
    background: ${dt("message.success.close.button.hover.background")};
}

.p-message-success.p-message-outlined {
    color: ${dt("message.success.outlined.color")};
    outline-color: ${dt("message.success.outlined.border.color")};
}

.p-message-success.p-message-simple {
    color: ${dt("message.success.simple.color")};
}

.p-message-warn {
    background: ${dt("message.warn.background")};
    outline-color: ${dt("message.warn.border.color")};
    color: ${dt("message.warn.color")};
    box-shadow: ${dt("message.warn.shadow")};
}

.p-message-warn .p-message-close-button:focus-visible {
    outline-color: ${dt("message.warn.close.button.focus.ring.color")};
    box-shadow: ${dt("message.warn.close.button.focus.ring.shadow")};
}

.p-message-warn .p-message-close-button:hover {
    background: ${dt("message.warn.close.button.hover.background")};
}

.p-message-warn.p-message-outlined {
    color: ${dt("message.warn.outlined.color")};
    outline-color: ${dt("message.warn.outlined.border.color")};
}

.p-message-warn.p-message-simple {
    color: ${dt("message.warn.simple.color")};
}

.p-message-error {
    background: ${dt("message.error.background")};
    outline-color: ${dt("message.error.border.color")};
    color: ${dt("message.error.color")};
    box-shadow: ${dt("message.error.shadow")};
}

.p-message-error .p-message-close-button:focus-visible {
    outline-color: ${dt("message.error.close.button.focus.ring.color")};
    box-shadow: ${dt("message.error.close.button.focus.ring.shadow")};
}

.p-message-error .p-message-close-button:hover {
    background: ${dt("message.error.close.button.hover.background")};
}

.p-message-error.p-message-outlined {
    color: ${dt("message.error.outlined.color")};
    outline-color: ${dt("message.error.outlined.border.color")};
}

.p-message-error.p-message-simple {
    color: ${dt("message.error.simple.color")};
}

.p-message-secondary {
    background: ${dt("message.secondary.background")};
    outline-color: ${dt("message.secondary.border.color")};
    color: ${dt("message.secondary.color")};
    box-shadow: ${dt("message.secondary.shadow")};
}

.p-message-secondary .p-message-close-button:focus-visible {
    outline-color: ${dt("message.secondary.close.button.focus.ring.color")};
    box-shadow: ${dt("message.secondary.close.button.focus.ring.shadow")};
}

.p-message-secondary .p-message-close-button:hover {
    background: ${dt("message.secondary.close.button.hover.background")};
}

.p-message-secondary.p-message-outlined {
    color: ${dt("message.secondary.outlined.color")};
    outline-color: ${dt("message.secondary.outlined.border.color")};
}

.p-message-secondary.p-message-simple {
    color: ${dt("message.secondary.simple.color")};
}

.p-message-contrast {
    background: ${dt("message.contrast.background")};
    outline-color: ${dt("message.contrast.border.color")};
    color: ${dt("message.contrast.color")};
    box-shadow: ${dt("message.contrast.shadow")};
}

.p-message-contrast .p-message-close-button:focus-visible {
    outline-color: ${dt("message.contrast.close.button.focus.ring.color")};
    box-shadow: ${dt("message.contrast.close.button.focus.ring.shadow")};
}

.p-message-contrast .p-message-close-button:hover {
    background: ${dt("message.contrast.close.button.hover.background")};
}

.p-message-contrast.p-message-outlined {
    color: ${dt("message.contrast.outlined.color")};
    outline-color: ${dt("message.contrast.outlined.border.color")};
}

.p-message-contrast.p-message-simple {
    color: ${dt("message.contrast.simple.color")};
}

.p-message-text {
    display: inline-flex;
    align-items: center;
    font-size: ${dt("message.text.font.size")};
    font-weight: ${dt("message.text.font.weight")};
}

.p-message-icon {
    font-size: ${dt("message.icon.size")};
    width: ${dt("message.icon.size")};
    height: ${dt("message.icon.size")};
}

.p-message-enter-from {
    opacity: 0;
}

.p-message-enter-active {
    transition: opacity 0.3s;
}

.p-message.p-message-leave-from {
    max-height: 1000px;
}

.p-message.p-message-leave-to {
    max-height: 0;
    opacity: 0;
    margin: 0;
}

.p-message-leave-active {
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1), opacity 0.3s, margin 0.3s;
}

.p-message-leave-active .p-message-close-button {
    opacity: 0;
}

.p-message-sm .p-message-content {
    padding: ${dt("message.content.sm.padding")};
}

.p-message-sm .p-message-text {
    font-size: ${dt("message.text.sm.font.size")};
}

.p-message-sm .p-message-icon {
    font-size: ${dt("message.icon.sm.size")};
    width: ${dt("message.icon.sm.size")};
    height: ${dt("message.icon.sm.size")};
}

.p-message-sm .p-message-close-icon {
    font-size: ${dt("message.close.icon.sm.size")};
    width: ${dt("message.close.icon.sm.size")};
    height: ${dt("message.close.icon.sm.size")};
}

.p-message-lg .p-message-content {
    padding: ${dt("message.content.lg.padding")};
}

.p-message-lg .p-message-text {
    font-size: ${dt("message.text.lg.font.size")};
}

.p-message-lg .p-message-icon {
    font-size: ${dt("message.icon.lg.size")};
    width: ${dt("message.icon.lg.size")};
    height: ${dt("message.icon.lg.size")};
}

.p-message-lg .p-message-close-icon {
    font-size: ${dt("message.close.icon.lg.size")};
    width: ${dt("message.close.icon.lg.size")};
    height: ${dt("message.close.icon.lg.size")};
}

.p-message-outlined {
    background: transparent;
    outline-width: ${dt("message.outlined.border.width")};
}

.p-message-simple {
    background: transparent;
    outline-color: transparent;
    box-shadow: none;
}

.p-message-simple .p-message-content {
    padding: ${dt("message.simple.content.padding")};
}

.p-message-outlined .p-message-close-button:hover,
.p-message-simple .p-message-close-button:hover {
    background: transparent;
}`;
var classes = {
  root: ({
    props
  }) => ["p-message p-component p-message-" + props.severity, {
    "p-message-simple": props.variant === "simple"
  }],
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
};
var MessageStyle = class _MessageStyle extends BaseStyle {
  name = "message";
  theme = theme;
  classes = classes;
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵMessageStyle_BaseFactory;
    return function MessageStyle_Factory(__ngFactoryType__) {
      return (ɵMessageStyle_BaseFactory || (ɵMessageStyle_BaseFactory = ɵɵgetInheritedFactory(_MessageStyle)))(__ngFactoryType__ || _MessageStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _MessageStyle,
    factory: _MessageStyle.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MessageStyle, [{
    type: Injectable
  }], null, null);
})();
var MessageClasses;
(function(MessageClasses2) {
  MessageClasses2["root"] = "p-message";
  MessageClasses2["content"] = "p-message-content";
  MessageClasses2["icon"] = "p-message-icon";
  MessageClasses2["text"] = "p-message-text";
  MessageClasses2["closeButton"] = "p-message-close-button";
  MessageClasses2["closeIcon"] = "p-message-close-icon";
})(MessageClasses || (MessageClasses = {}));
var Message = class _Message extends BaseComponent {
  /**
   * Severity level of the message.
   * @defaultValue 'info'
   * @group Props
   */
  severity = "info";
  /**
   * Text content.
   * @group Props
   */
  text;
  /**
   * Whether displaying messages would be escaped or not.
   * @deprecated Use content projection instead '<p-message>Content</p-message>'.
   * @group Props
   */
  escape = true;
  /**
   * Inline style of the component.
   * @group Props
   */
  style;
  /**
   * Style class of the component.
   * @group Props
   */
  styleClass;
  /**
   * Whether the message can be closed manually using the close icon.
   * @group Props
   * @defaultValue false
   */
  closable = false;
  /**
   * Icon to display in the message.
   * @group Props
   * @defaultValue undefined
   */
  icon;
  /**
   * Icon to display in the message close button.
   * @group Props
   * @defaultValue undefined
   */
  closeIcon;
  /**
   * Delay in milliseconds to close the message automatically.
   * @defaultValue undefined
   */
  life;
  /**
   * Transition options of the show animation.
   * @defaultValue '300ms ease-out'
   * @group Props
   */
  showTransitionOptions = "300ms ease-out";
  /**
   * Transition options of the hide animation.
   * @defaultValue '200ms cubic-bezier(0.86, 0, 0.07, 1)'
   * @group Props
   */
  hideTransitionOptions = "200ms cubic-bezier(0.86, 0, 0.07, 1)";
  /**
   * Defines the size of the component.
   * @group Props
   */
  size;
  /**
   * Specifies the input variant of the component.
   * @group Props
   */
  variant;
  /**
   * Emits when the message is closed.
   * @param {{ originalEvent: Event }} event - The event object containing the original event.
   * @group Emits
   */
  onClose = new EventEmitter();
  get closeAriaLabel() {
    return this.config.translation.aria ? this.config.translation.aria.close : void 0;
  }
  get containerClass() {
    const variantClass = this.variant === "outlined" ? "p-message-outlined" : this.variant === "simple" ? "p-message-simple" : "";
    const sizeClass = this.size === "small" ? "p-message-sm" : this.size === "large" ? "p-message-lg" : "";
    return `p-message-${this.severity} ${variantClass} ${sizeClass}`.trim() + (this.styleClass ? " " + this.styleClass : "");
  }
  visible = signal(true);
  _componentStyle = inject(MessageStyle);
  /**
   * Custom template of the message container.
   * @group Templates
   */
  containerTemplate;
  /**
   * Custom template of the message icon.
   * @group Templates
   */
  iconTemplate;
  /**
   * Custom template of the close icon.
   * @group Templates
   */
  closeIconTemplate;
  templates;
  _containerTemplate;
  _iconTemplate;
  _closeIconTemplate;
  ngOnInit() {
    super.ngOnInit();
    if (this.life) {
      setTimeout(() => {
        this.visible.set(false);
      }, this.life);
    }
  }
  ngAfterContentInit() {
    this.templates?.forEach((item) => {
      switch (item.getType()) {
        case "container":
          this._containerTemplate = item.template;
          break;
        case "icon":
          this._iconTemplate = item.template;
          break;
        case "closeicon":
          this._closeIconTemplate = item.template;
          break;
      }
    });
  }
  /**
   * Closes the message.
   * @param {Event} event - Browser event.
   * @group Method
   */
  close(event) {
    this.visible.set(false);
    this.onClose.emit({
      originalEvent: event
    });
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵMessage_BaseFactory;
    return function Message_Factory(__ngFactoryType__) {
      return (ɵMessage_BaseFactory || (ɵMessage_BaseFactory = ɵɵgetInheritedFactory(_Message)))(__ngFactoryType__ || _Message);
    };
  })();
  static ɵcmp = ɵɵdefineComponent({
    type: _Message,
    selectors: [["p-message"]],
    contentQueries: function Message_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, _c0, 4);
        ɵɵcontentQuery(dirIndex, _c1, 4);
        ɵɵcontentQuery(dirIndex, _c2, 4);
        ɵɵcontentQuery(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.containerTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.iconTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.closeIconTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
      }
    },
    inputs: {
      severity: "severity",
      text: "text",
      escape: [2, "escape", "escape", booleanAttribute],
      style: "style",
      styleClass: "styleClass",
      closable: [2, "closable", "closable", booleanAttribute],
      icon: "icon",
      closeIcon: "closeIcon",
      life: "life",
      showTransitionOptions: "showTransitionOptions",
      hideTransitionOptions: "hideTransitionOptions",
      size: "size",
      variant: "variant"
    },
    outputs: {
      onClose: "onClose"
    },
    features: [ɵɵProvidersFeature([MessageStyle]), ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c3,
    decls: 1,
    vars: 1,
    consts: [["escapeOut", ""], [1, "p-message", "p-component", 3, "ngClass"], [1, "p-message-content"], [1, "p-message-icon", 3, "ngClass"], [4, "ngIf", "ngIfElse"], [3, "ngClass"], ["pRipple", "", "type", "button", 1, "p-message-close-button"], [4, "ngTemplateOutlet"], [3, "ngClass", "innerHTML", 4, "ngIf"], [3, "ngClass", "innerHTML"], [3, "ngClass", 4, "ngIf"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], ["pRipple", "", "type", "button", 1, "p-message-close-button", 3, "click"], [1, "p-message-close-icon", 3, "ngClass"], ["styleClass", "p-message-close-icon"]],
    template: function Message_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵconditionalCreate(0, Message_Conditional_0_Template, 10, 15, "div", 1);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.visible() ? 0 : -1);
      }
    },
    dependencies: [CommonModule, NgClass, NgIf, NgTemplateOutlet, TimesIcon, Ripple, SharedModule],
    encapsulation: 2,
    data: {
      animation: [trigger("messageAnimation", [transition(":enter", [style({
        opacity: 0,
        transform: "translateY(-25%)"
      }), animate("{{showTransitionParams}}")]), transition(":leave", [animate("{{hideTransitionParams}}", style({
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        opacity: 0
      }))])])]
    },
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Message, [{
    type: Component,
    args: [{
      selector: "p-message",
      standalone: true,
      imports: [CommonModule, TimesIcon, Ripple, SharedModule],
      template: `
        @if (visible()) {
            <div
                class="p-message p-component"
                [attr.aria-live]="'polite'"
                [ngClass]="containerClass"
                [attr.role]="'alert'"
                [@messageAnimation]="{
                    value: 'visible()',
                    params: {
                        showTransitionParams: showTransitionOptions,
                        hideTransitionParams: hideTransitionOptions
                    }
                }"
            >
                <div class="p-message-content">
                    @if (iconTemplate || _iconTemplate) {
                        <ng-container *ngTemplateOutlet="iconTemplate || iconTemplate"></ng-container>
                    }
                    @if (icon) {
                        <i class="p-message-icon" [ngClass]="icon"></i>
                    }

                    <div *ngIf="!escape; else escapeOut">
                        <span *ngIf="!escape" [ngClass]="cx('text')" [innerHTML]="text"></span>
                    </div>

                    <ng-template #escapeOut>
                        <span *ngIf="escape && text" [ngClass]="cx('text')">{{ text }}</span>
                    </ng-template>

                    @if (containerTemplate || _containerTemplate) {
                        <ng-container *ngTemplateOutlet="containerTemplate || containerTemplate; context: { closeCallback: close.bind(this) }"></ng-container>
                    } @else {
                        <span [ngClass]="cx('text')">
                            <ng-content></ng-content>
                        </span>
                    }
                    @if (closable) {
                        <button pRipple type="button" class="p-message-close-button" (click)="close($event)" [attr.aria-label]="closeAriaLabel">
                            @if (closeIcon) {
                                <i class="p-message-close-icon" [ngClass]="closeIcon"></i>
                            }
                            @if (closeIconTemplate || _closeIconTemplate) {
                                <ng-container *ngTemplateOutlet="closeIconTemplate || _closeIconTemplate"></ng-container>
                            }
                            @if (!closeIconTemplate && !_closeIconTemplate && !closeIcon) {
                                <TimesIcon styleClass="p-message-close-icon" />
                            }
                        </button>
                    }
                </div>
            </div>
        }
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [MessageStyle],
      animations: [trigger("messageAnimation", [transition(":enter", [style({
        opacity: 0,
        transform: "translateY(-25%)"
      }), animate("{{showTransitionParams}}")]), transition(":leave", [animate("{{hideTransitionParams}}", style({
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        opacity: 0
      }))])])]
    }]
  }], null, {
    severity: [{
      type: Input
    }],
    text: [{
      type: Input
    }],
    escape: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    style: [{
      type: Input
    }],
    styleClass: [{
      type: Input
    }],
    closable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    icon: [{
      type: Input
    }],
    closeIcon: [{
      type: Input
    }],
    life: [{
      type: Input
    }],
    showTransitionOptions: [{
      type: Input
    }],
    hideTransitionOptions: [{
      type: Input
    }],
    size: [{
      type: Input
    }],
    variant: [{
      type: Input
    }],
    onClose: [{
      type: Output
    }],
    containerTemplate: [{
      type: ContentChild,
      args: ["container", {
        descendants: false
      }]
    }],
    iconTemplate: [{
      type: ContentChild,
      args: ["icon", {
        descendants: false
      }]
    }],
    closeIconTemplate: [{
      type: ContentChild,
      args: ["closeicon", {
        descendants: false
      }]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var MessageModule = class _MessageModule {
  static ɵfac = function MessageModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MessageModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _MessageModule,
    imports: [Message, SharedModule],
    exports: [Message, SharedModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [Message, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MessageModule, [{
    type: NgModule,
    args: [{
      imports: [Message, SharedModule],
      exports: [Message, SharedModule]
    }]
  }], null, null);
})();
export {
  Message,
  MessageClasses,
  MessageModule,
  MessageStyle
};
//# sourceMappingURL=primeng_message.js.map
