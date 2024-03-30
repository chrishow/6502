(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a3, b3) => {
    for (var prop in b3 || (b3 = {}))
      if (__hasOwnProp.call(b3, prop))
        __defNormalProp(a3, prop, b3[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b3)) {
        if (__propIsEnum.call(b3, prop))
          __defNormalProp(a3, prop, b3[prop]);
      }
    return a3;
  };
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e4) {
          reject(e4);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e4) {
          reject(e4);
        }
      };
      var step = (x2) => x2.done ? resolve(x2.value) : Promise.resolve(x2.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // htdocs/js/Memory.mjs
  var _Memory = class _Memory {
    // static MEM_SIZE = 128;
    constructor() {
      this.initMemory();
      return this;
    }
    initMemory() {
      this._mem = new Uint8Array(_Memory.MEM_SIZE);
    }
    readByte(location) {
      return this._mem[location];
    }
    writeByte(location, value) {
      this._mem[location] = value;
    }
    hexLoad(start, hexString) {
      const bytes = hexString.split(" ");
      bytes.forEach((byte) => {
        this.writeByte(start++, parseInt(byte, 16));
      });
    }
  };
  __publicField(_Memory, "MEM_SIZE", 16 * 1024);
  var Memory = _Memory;

  // node_modules/@lit/reactive-element/css-tag.js
  var t = globalThis;
  var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var s = Symbol();
  var o = /* @__PURE__ */ new WeakMap();
  var n = class {
    constructor(t3, e4, o4) {
      if (this._$cssResult$ = true, o4 !== s)
        throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t3, this.t = e4;
    }
    get styleSheet() {
      let t3 = this.o;
      const s4 = this.t;
      if (e && void 0 === t3) {
        const e4 = void 0 !== s4 && 1 === s4.length;
        e4 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t3));
      }
      return t3;
    }
    toString() {
      return this.cssText;
    }
  };
  var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
  var i = (t3, ...e4) => {
    const o4 = 1 === t3.length ? t3[0] : e4.reduce((e5, s4, o5) => e5 + ((t4) => {
      if (true === t4._$cssResult$)
        return t4.cssText;
      if ("number" == typeof t4)
        return t4;
      throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
    })(s4) + t3[o5 + 1], t3[0]);
    return new n(o4, t3, s);
  };
  var S = (s4, o4) => {
    if (e)
      s4.adoptedStyleSheets = o4.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
    else
      for (const e4 of o4) {
        const o5 = document.createElement("style"), n4 = t.litNonce;
        void 0 !== n4 && o5.setAttribute("nonce", n4), o5.textContent = e4.cssText, s4.appendChild(o5);
      }
  };
  var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
    let e4 = "";
    for (const s4 of t4.cssRules)
      e4 += s4.cssText;
    return r(e4);
  })(t3) : t3;

  // node_modules/@lit/reactive-element/reactive-element.js
  var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: r2, getOwnPropertyNames: h, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
  var a = globalThis;
  var c2 = a.trustedTypes;
  var l = c2 ? c2.emptyScript : "";
  var p = a.reactiveElementPolyfillSupport;
  var d = (t3, s4) => t3;
  var u = { toAttribute(t3, s4) {
    switch (s4) {
      case Boolean:
        t3 = t3 ? l : null;
        break;
      case Object:
      case Array:
        t3 = null == t3 ? t3 : JSON.stringify(t3);
    }
    return t3;
  }, fromAttribute(t3, s4) {
    let i4 = t3;
    switch (s4) {
      case Boolean:
        i4 = null !== t3;
        break;
      case Number:
        i4 = null === t3 ? null : Number(t3);
        break;
      case Object:
      case Array:
        try {
          i4 = JSON.parse(t3);
        } catch (t4) {
          i4 = null;
        }
    }
    return i4;
  } };
  var f = (t3, s4) => !i2(t3, s4);
  var y = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
  var _a, _b;
  (_a = Symbol.metadata) != null ? _a : Symbol.metadata = Symbol("metadata"), (_b = a.litPropertyMetadata) != null ? _b : a.litPropertyMetadata = /* @__PURE__ */ new WeakMap();
  var b = class extends HTMLElement {
    static addInitializer(t3) {
      var _a6;
      this._$Ei(), ((_a6 = this.l) != null ? _a6 : this.l = []).push(t3);
    }
    static get observedAttributes() {
      return this.finalize(), this._$Eh && [...this._$Eh.keys()];
    }
    static createProperty(t3, s4 = y) {
      if (s4.state && (s4.attribute = false), this._$Ei(), this.elementProperties.set(t3, s4), !s4.noAccessor) {
        const i4 = Symbol(), r5 = this.getPropertyDescriptor(t3, i4, s4);
        void 0 !== r5 && e2(this.prototype, t3, r5);
      }
    }
    static getPropertyDescriptor(t3, s4, i4) {
      var _a6;
      const { get: e4, set: h3 } = (_a6 = r2(this.prototype, t3)) != null ? _a6 : { get() {
        return this[s4];
      }, set(t4) {
        this[s4] = t4;
      } };
      return { get() {
        return e4 == null ? void 0 : e4.call(this);
      }, set(s5) {
        const r5 = e4 == null ? void 0 : e4.call(this);
        h3.call(this, s5), this.requestUpdate(t3, r5, i4);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t3) {
      var _a6;
      return (_a6 = this.elementProperties.get(t3)) != null ? _a6 : y;
    }
    static _$Ei() {
      if (this.hasOwnProperty(d("elementProperties")))
        return;
      const t3 = n2(this);
      t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
    }
    static finalize() {
      if (this.hasOwnProperty(d("finalized")))
        return;
      if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
        const t4 = this.properties, s4 = [...h(t4), ...o2(t4)];
        for (const i4 of s4)
          this.createProperty(i4, t4[i4]);
      }
      const t3 = this[Symbol.metadata];
      if (null !== t3) {
        const s4 = litPropertyMetadata.get(t3);
        if (void 0 !== s4)
          for (const [t4, i4] of s4)
            this.elementProperties.set(t4, i4);
      }
      this._$Eh = /* @__PURE__ */ new Map();
      for (const [t4, s4] of this.elementProperties) {
        const i4 = this._$Eu(t4, s4);
        void 0 !== i4 && this._$Eh.set(i4, t4);
      }
      this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s4) {
      const i4 = [];
      if (Array.isArray(s4)) {
        const e4 = new Set(s4.flat(1 / 0).reverse());
        for (const s5 of e4)
          i4.unshift(c(s5));
      } else
        void 0 !== s4 && i4.push(c(s4));
      return i4;
    }
    static _$Eu(t3, s4) {
      const i4 = s4.attribute;
      return false === i4 ? void 0 : "string" == typeof i4 ? i4 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
    }
    constructor() {
      super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
    }
    _$Ev() {
      var _a6;
      this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (_a6 = this.constructor.l) == null ? void 0 : _a6.forEach((t3) => t3(this));
    }
    addController(t3) {
      var _a6, _b3;
      ((_a6 = this._$EO) != null ? _a6 : this._$EO = /* @__PURE__ */ new Set()).add(t3), void 0 !== this.renderRoot && this.isConnected && ((_b3 = t3.hostConnected) == null ? void 0 : _b3.call(t3));
    }
    removeController(t3) {
      var _a6;
      (_a6 = this._$EO) == null ? void 0 : _a6.delete(t3);
    }
    _$E_() {
      const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
      for (const i4 of s4.keys())
        this.hasOwnProperty(i4) && (t3.set(i4, this[i4]), delete this[i4]);
      t3.size > 0 && (this._$Ep = t3);
    }
    createRenderRoot() {
      var _a6;
      const t3 = (_a6 = this.shadowRoot) != null ? _a6 : this.attachShadow(this.constructor.shadowRootOptions);
      return S(t3, this.constructor.elementStyles), t3;
    }
    connectedCallback() {
      var _a6, _b3;
      (_a6 = this.renderRoot) != null ? _a6 : this.renderRoot = this.createRenderRoot(), this.enableUpdating(true), (_b3 = this._$EO) == null ? void 0 : _b3.forEach((t3) => {
        var _a7;
        return (_a7 = t3.hostConnected) == null ? void 0 : _a7.call(t3);
      });
    }
    enableUpdating(t3) {
    }
    disconnectedCallback() {
      var _a6;
      (_a6 = this._$EO) == null ? void 0 : _a6.forEach((t3) => {
        var _a7;
        return (_a7 = t3.hostDisconnected) == null ? void 0 : _a7.call(t3);
      });
    }
    attributeChangedCallback(t3, s4, i4) {
      this._$AK(t3, i4);
    }
    _$EC(t3, s4) {
      var _a6;
      const i4 = this.constructor.elementProperties.get(t3), e4 = this.constructor._$Eu(t3, i4);
      if (void 0 !== e4 && true === i4.reflect) {
        const r5 = (void 0 !== ((_a6 = i4.converter) == null ? void 0 : _a6.toAttribute) ? i4.converter : u).toAttribute(s4, i4.type);
        this._$Em = t3, null == r5 ? this.removeAttribute(e4) : this.setAttribute(e4, r5), this._$Em = null;
      }
    }
    _$AK(t3, s4) {
      var _a6;
      const i4 = this.constructor, e4 = i4._$Eh.get(t3);
      if (void 0 !== e4 && this._$Em !== e4) {
        const t4 = i4.getPropertyOptions(e4), r5 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== ((_a6 = t4.converter) == null ? void 0 : _a6.fromAttribute) ? t4.converter : u;
        this._$Em = e4, this[e4] = r5.fromAttribute(s4, t4.type), this._$Em = null;
      }
    }
    requestUpdate(t3, s4, i4) {
      var _a6;
      if (void 0 !== t3) {
        if (i4 != null ? i4 : i4 = this.constructor.getPropertyOptions(t3), !((_a6 = i4.hasChanged) != null ? _a6 : f)(this[t3], s4))
          return;
        this.P(t3, s4, i4);
      }
      false === this.isUpdatePending && (this._$ES = this._$ET());
    }
    P(t3, s4, i4) {
      var _a6;
      this._$AL.has(t3) || this._$AL.set(t3, s4), true === i4.reflect && this._$Em !== t3 && ((_a6 = this._$Ej) != null ? _a6 : this._$Ej = /* @__PURE__ */ new Set()).add(t3);
    }
    _$ET() {
      return __async(this, null, function* () {
        this.isUpdatePending = true;
        try {
          yield this._$ES;
        } catch (t4) {
          Promise.reject(t4);
        }
        const t3 = this.scheduleUpdate();
        return null != t3 && (yield t3), !this.isUpdatePending;
      });
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      var _a6, _b3;
      if (!this.isUpdatePending)
        return;
      if (!this.hasUpdated) {
        if ((_a6 = this.renderRoot) != null ? _a6 : this.renderRoot = this.createRenderRoot(), this._$Ep) {
          for (const [t5, s5] of this._$Ep)
            this[t5] = s5;
          this._$Ep = void 0;
        }
        const t4 = this.constructor.elementProperties;
        if (t4.size > 0)
          for (const [s5, i4] of t4)
            true !== i4.wrapped || this._$AL.has(s5) || void 0 === this[s5] || this.P(s5, this[s5], i4);
      }
      let t3 = false;
      const s4 = this._$AL;
      try {
        t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), (_b3 = this._$EO) == null ? void 0 : _b3.forEach((t4) => {
          var _a7;
          return (_a7 = t4.hostUpdate) == null ? void 0 : _a7.call(t4);
        }), this.update(s4)) : this._$EU();
      } catch (s5) {
        throw t3 = false, this._$EU(), s5;
      }
      t3 && this._$AE(s4);
    }
    willUpdate(t3) {
    }
    _$AE(t3) {
      var _a6;
      (_a6 = this._$EO) == null ? void 0 : _a6.forEach((t4) => {
        var _a7;
        return (_a7 = t4.hostUpdated) == null ? void 0 : _a7.call(t4);
      }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
    }
    _$EU() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$ES;
    }
    shouldUpdate(t3) {
      return true;
    }
    update(t3) {
      this._$Ej && (this._$Ej = this._$Ej.forEach((t4) => this._$EC(t4, this[t4]))), this._$EU();
    }
    updated(t3) {
    }
    firstUpdated(t3) {
    }
  };
  var _a2;
  b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[d("elementProperties")] = /* @__PURE__ */ new Map(), b[d("finalized")] = /* @__PURE__ */ new Map(), p == null ? void 0 : p({ ReactiveElement: b }), ((_a2 = a.reactiveElementVersions) != null ? _a2 : a.reactiveElementVersions = []).push("2.0.4");

  // node_modules/lit-html/lit-html.js
  var t2 = globalThis;
  var i3 = t2.trustedTypes;
  var s2 = i3 ? i3.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
  var e3 = "$lit$";
  var h2 = `lit$${(Math.random() + "").slice(9)}$`;
  var o3 = "?" + h2;
  var n3 = `<${o3}>`;
  var r3 = document;
  var l2 = () => r3.createComment("");
  var c3 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
  var a2 = Array.isArray;
  var u2 = (t3) => a2(t3) || "function" == typeof (t3 == null ? void 0 : t3[Symbol.iterator]);
  var d2 = "[ 	\n\f\r]";
  var f2 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var v = /-->/g;
  var _ = />/g;
  var m = RegExp(`>|${d2}(?:([^\\s"'>=/]+)(${d2}*=${d2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var p2 = /'/g;
  var g = /"/g;
  var $ = /^(?:script|style|textarea|title)$/i;
  var y2 = (t3) => (i4, ...s4) => ({ _$litType$: t3, strings: i4, values: s4 });
  var x = y2(1);
  var b2 = y2(2);
  var w = Symbol.for("lit-noChange");
  var T = Symbol.for("lit-nothing");
  var A = /* @__PURE__ */ new WeakMap();
  var E = r3.createTreeWalker(r3, 129);
  function C(t3, i4) {
    if (!Array.isArray(t3) || !t3.hasOwnProperty("raw"))
      throw Error("invalid template strings array");
    return void 0 !== s2 ? s2.createHTML(i4) : i4;
  }
  var P = (t3, i4) => {
    const s4 = t3.length - 1, o4 = [];
    let r5, l3 = 2 === i4 ? "<svg>" : "", c4 = f2;
    for (let i5 = 0; i5 < s4; i5++) {
      const s5 = t3[i5];
      let a3, u3, d3 = -1, y3 = 0;
      for (; y3 < s5.length && (c4.lastIndex = y3, u3 = c4.exec(s5), null !== u3); )
        y3 = c4.lastIndex, c4 === f2 ? "!--" === u3[1] ? c4 = v : void 0 !== u3[1] ? c4 = _ : void 0 !== u3[2] ? ($.test(u3[2]) && (r5 = RegExp("</" + u3[2], "g")), c4 = m) : void 0 !== u3[3] && (c4 = m) : c4 === m ? ">" === u3[0] ? (c4 = r5 != null ? r5 : f2, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? m : '"' === u3[3] ? g : p2) : c4 === g || c4 === p2 ? c4 = m : c4 === v || c4 === _ ? c4 = f2 : (c4 = m, r5 = void 0);
      const x2 = c4 === m && t3[i5 + 1].startsWith("/>") ? " " : "";
      l3 += c4 === f2 ? s5 + n3 : d3 >= 0 ? (o4.push(a3), s5.slice(0, d3) + e3 + s5.slice(d3) + h2 + x2) : s5 + h2 + (-2 === d3 ? i5 : x2);
    }
    return [C(t3, l3 + (t3[s4] || "<?>") + (2 === i4 ? "</svg>" : "")), o4];
  };
  var V = class _V {
    constructor({ strings: t3, _$litType$: s4 }, n4) {
      let r5;
      this.parts = [];
      let c4 = 0, a3 = 0;
      const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = P(t3, s4);
      if (this.el = _V.createElement(f3, n4), E.currentNode = this.el.content, 2 === s4) {
        const t4 = this.el.content.firstChild;
        t4.replaceWith(...t4.childNodes);
      }
      for (; null !== (r5 = E.nextNode()) && d3.length < u3; ) {
        if (1 === r5.nodeType) {
          if (r5.hasAttributes())
            for (const t4 of r5.getAttributeNames())
              if (t4.endsWith(e3)) {
                const i4 = v2[a3++], s5 = r5.getAttribute(t4).split(h2), e4 = /([.?@])?(.*)/.exec(i4);
                d3.push({ type: 1, index: c4, name: e4[2], strings: s5, ctor: "." === e4[1] ? k : "?" === e4[1] ? H : "@" === e4[1] ? I : R }), r5.removeAttribute(t4);
              } else
                t4.startsWith(h2) && (d3.push({ type: 6, index: c4 }), r5.removeAttribute(t4));
          if ($.test(r5.tagName)) {
            const t4 = r5.textContent.split(h2), s5 = t4.length - 1;
            if (s5 > 0) {
              r5.textContent = i3 ? i3.emptyScript : "";
              for (let i4 = 0; i4 < s5; i4++)
                r5.append(t4[i4], l2()), E.nextNode(), d3.push({ type: 2, index: ++c4 });
              r5.append(t4[s5], l2());
            }
          }
        } else if (8 === r5.nodeType)
          if (r5.data === o3)
            d3.push({ type: 2, index: c4 });
          else {
            let t4 = -1;
            for (; -1 !== (t4 = r5.data.indexOf(h2, t4 + 1)); )
              d3.push({ type: 7, index: c4 }), t4 += h2.length - 1;
          }
        c4++;
      }
    }
    static createElement(t3, i4) {
      const s4 = r3.createElement("template");
      return s4.innerHTML = t3, s4;
    }
  };
  function N(t3, i4, s4 = t3, e4) {
    var _a6, _b2, _c;
    if (i4 === w)
      return i4;
    let h3 = void 0 !== e4 ? (_a6 = s4._$Co) == null ? void 0 : _a6[e4] : s4._$Cl;
    const o4 = c3(i4) ? void 0 : i4._$litDirective$;
    return (h3 == null ? void 0 : h3.constructor) !== o4 && ((_b2 = h3 == null ? void 0 : h3._$AO) == null ? void 0 : _b2.call(h3, false), void 0 === o4 ? h3 = void 0 : (h3 = new o4(t3), h3._$AT(t3, s4, e4)), void 0 !== e4 ? ((_c = s4._$Co) != null ? _c : s4._$Co = [])[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i4 = N(t3, h3._$AS(t3, i4.values), h3, e4)), i4;
  }
  var S2 = class {
    constructor(t3, i4) {
      this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i4;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t3) {
      var _a6;
      const { el: { content: i4 }, parts: s4 } = this._$AD, e4 = ((_a6 = t3 == null ? void 0 : t3.creationScope) != null ? _a6 : r3).importNode(i4, true);
      E.currentNode = e4;
      let h3 = E.nextNode(), o4 = 0, n4 = 0, l3 = s4[0];
      for (; void 0 !== l3; ) {
        if (o4 === l3.index) {
          let i5;
          2 === l3.type ? i5 = new M(h3, h3.nextSibling, this, t3) : 1 === l3.type ? i5 = new l3.ctor(h3, l3.name, l3.strings, this, t3) : 6 === l3.type && (i5 = new L(h3, this, t3)), this._$AV.push(i5), l3 = s4[++n4];
        }
        o4 !== (l3 == null ? void 0 : l3.index) && (h3 = E.nextNode(), o4++);
      }
      return E.currentNode = r3, e4;
    }
    p(t3) {
      let i4 = 0;
      for (const s4 of this._$AV)
        void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i4), i4 += s4.strings.length - 2) : s4._$AI(t3[i4])), i4++;
    }
  };
  var M = class _M {
    get _$AU() {
      var _a6, _b2;
      return (_b2 = (_a6 = this._$AM) == null ? void 0 : _a6._$AU) != null ? _b2 : this._$Cv;
    }
    constructor(t3, i4, s4, e4) {
      var _a6;
      this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = t3, this._$AB = i4, this._$AM = s4, this.options = e4, this._$Cv = (_a6 = e4 == null ? void 0 : e4.isConnected) != null ? _a6 : true;
    }
    get parentNode() {
      let t3 = this._$AA.parentNode;
      const i4 = this._$AM;
      return void 0 !== i4 && 11 === (t3 == null ? void 0 : t3.nodeType) && (t3 = i4.parentNode), t3;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t3, i4 = this) {
      t3 = N(this, t3, i4), c3(t3) ? t3 === T || null == t3 || "" === t3 ? (this._$AH !== T && this._$AR(), this._$AH = T) : t3 !== this._$AH && t3 !== w && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : u2(t3) ? this.k(t3) : this._(t3);
    }
    S(t3) {
      return this._$AA.parentNode.insertBefore(t3, this._$AB);
    }
    T(t3) {
      this._$AH !== t3 && (this._$AR(), this._$AH = this.S(t3));
    }
    _(t3) {
      this._$AH !== T && c3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(r3.createTextNode(t3)), this._$AH = t3;
    }
    $(t3) {
      var _a6;
      const { values: i4, _$litType$: s4 } = t3, e4 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = V.createElement(C(s4.h, s4.h[0]), this.options)), s4);
      if (((_a6 = this._$AH) == null ? void 0 : _a6._$AD) === e4)
        this._$AH.p(i4);
      else {
        const t4 = new S2(e4, this), s5 = t4.u(this.options);
        t4.p(i4), this.T(s5), this._$AH = t4;
      }
    }
    _$AC(t3) {
      let i4 = A.get(t3.strings);
      return void 0 === i4 && A.set(t3.strings, i4 = new V(t3)), i4;
    }
    k(t3) {
      a2(this._$AH) || (this._$AH = [], this._$AR());
      const i4 = this._$AH;
      let s4, e4 = 0;
      for (const h3 of t3)
        e4 === i4.length ? i4.push(s4 = new _M(this.S(l2()), this.S(l2()), this, this.options)) : s4 = i4[e4], s4._$AI(h3), e4++;
      e4 < i4.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i4.length = e4);
    }
    _$AR(t3 = this._$AA.nextSibling, i4) {
      var _a6;
      for ((_a6 = this._$AP) == null ? void 0 : _a6.call(this, false, true, i4); t3 && t3 !== this._$AB; ) {
        const i5 = t3.nextSibling;
        t3.remove(), t3 = i5;
      }
    }
    setConnected(t3) {
      var _a6;
      void 0 === this._$AM && (this._$Cv = t3, (_a6 = this._$AP) == null ? void 0 : _a6.call(this, t3));
    }
  };
  var R = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t3, i4, s4, e4, h3) {
      this.type = 1, this._$AH = T, this._$AN = void 0, this.element = t3, this.name = i4, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = T;
    }
    _$AI(t3, i4 = this, s4, e4) {
      const h3 = this.strings;
      let o4 = false;
      if (void 0 === h3)
        t3 = N(this, t3, i4, 0), o4 = !c3(t3) || t3 !== this._$AH && t3 !== w, o4 && (this._$AH = t3);
      else {
        const e5 = t3;
        let n4, r5;
        for (t3 = h3[0], n4 = 0; n4 < h3.length - 1; n4++)
          r5 = N(this, e5[s4 + n4], i4, n4), r5 === w && (r5 = this._$AH[n4]), o4 || (o4 = !c3(r5) || r5 !== this._$AH[n4]), r5 === T ? t3 = T : t3 !== T && (t3 += (r5 != null ? r5 : "") + h3[n4 + 1]), this._$AH[n4] = r5;
      }
      o4 && !e4 && this.j(t3);
    }
    j(t3) {
      t3 === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
    }
  };
  var k = class extends R {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t3) {
      this.element[this.name] = t3 === T ? void 0 : t3;
    }
  };
  var H = class extends R {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t3) {
      this.element.toggleAttribute(this.name, !!t3 && t3 !== T);
    }
  };
  var I = class extends R {
    constructor(t3, i4, s4, e4, h3) {
      super(t3, i4, s4, e4, h3), this.type = 5;
    }
    _$AI(t3, i4 = this) {
      var _a6;
      if ((t3 = (_a6 = N(this, t3, i4, 0)) != null ? _a6 : T) === w)
        return;
      const s4 = this._$AH, e4 = t3 === T && s4 !== T || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== T && (s4 === T || e4);
      e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
    }
    handleEvent(t3) {
      var _a6, _b2;
      "function" == typeof this._$AH ? this._$AH.call((_b2 = (_a6 = this.options) == null ? void 0 : _a6.host) != null ? _b2 : this.element, t3) : this._$AH.handleEvent(t3);
    }
  };
  var L = class {
    constructor(t3, i4, s4) {
      this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i4, this.options = s4;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3) {
      N(this, t3);
    }
  };
  var Z = t2.litHtmlPolyfillSupport;
  var _a3;
  Z == null ? void 0 : Z(V, M), ((_a3 = t2.litHtmlVersions) != null ? _a3 : t2.litHtmlVersions = []).push("3.1.2");
  var j = (t3, i4, s4) => {
    var _a6, _b2;
    const e4 = (_a6 = s4 == null ? void 0 : s4.renderBefore) != null ? _a6 : i4;
    let h3 = e4._$litPart$;
    if (void 0 === h3) {
      const t4 = (_b2 = s4 == null ? void 0 : s4.renderBefore) != null ? _b2 : null;
      e4._$litPart$ = h3 = new M(i4.insertBefore(l2(), t4), t4, void 0, s4 != null ? s4 : {});
    }
    return h3._$AI(t3), h3;
  };

  // node_modules/lit-element/lit-element.js
  var s3 = class extends b {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
    }
    createRenderRoot() {
      var _a6, _b2;
      const t3 = super.createRenderRoot();
      return (_b2 = (_a6 = this.renderOptions).renderBefore) != null ? _b2 : _a6.renderBefore = t3.firstChild, t3;
    }
    update(t3) {
      const i4 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = j(i4, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      var _a6;
      super.connectedCallback(), (_a6 = this._$Do) == null ? void 0 : _a6.setConnected(true);
    }
    disconnectedCallback() {
      var _a6;
      super.disconnectedCallback(), (_a6 = this._$Do) == null ? void 0 : _a6.setConnected(false);
    }
    render() {
      return w;
    }
  };
  var _a4;
  s3._$litElement$ = true, s3["finalized", "finalized"] = true, (_a4 = globalThis.litElementHydrateSupport) == null ? void 0 : _a4.call(globalThis, { LitElement: s3 });
  var r4 = globalThis.litElementPolyfillSupport;
  r4 == null ? void 0 : r4({ LitElement: s3 });
  var _a5;
  ((_a5 = globalThis.litElementVersions) != null ? _a5 : globalThis.litElementVersions = []).push("4.0.4");

  // htdocs/js/CPUDisplayBit.mjs
  var CPUDisplayBit = class extends s3 {
    static get properties() {
      return {
        bit: { reflect: false, attribute: false }
      };
    }
    constructor() {
      super();
      this.bit = 0;
    }
    // Render the UI as a function of component state
    render() {
      return x`${this.bit == 1 ? "\u{1F534}" : "\u26AA\uFE0F"}`;
    }
  };
  customElements.define("cpu-display-bit", CPUDisplayBit);

  // htdocs/js/CPUDisplay.mjs
  var _CPUDisplay = class _CPUDisplay extends s3 {
    static formatWord(word) {
      return word.toString(16).padStart(4, "0").toUpperCase();
    }
    static formatByte(byte) {
      return byte.toString(16).padStart(2, "0").toUpperCase();
    }
    static get properties() {
      return {
        registers: {
          type: Object,
          reflect: true,
          attribute: true
        }
      };
    }
    constructor() {
      super();
      this.registers = {
        pc: 0,
        ac: 0,
        x: 0,
        y: 0,
        sp: 0,
        sr: {
          n: 0,
          v: 0,
          b: 0,
          d: 0,
          i: 0,
          z: 0,
          c: 0
        }
      };
    }
    step() {
      this.cpu.step();
    }
    start() {
      this.cpu.start();
    }
    stop() {
      this.cpu.stop();
    }
    fastForward() {
      this.cpu.fastForward();
    }
    // Render the UI as a function of component state
    render() {
      const offset = 1536;
      let memDisplay = [];
      let j2 = 0;
      for (let i4 = 0; i4 < 8; i4++) {
        memDisplay.push(x`0x${_CPUDisplay.formatWord(offset + i4 * 8 + j2)}: `);
        for (let j3 = 0; j3 < 8; j3++) {
          let addr = offset + i4 * 8 + j3;
          if (this.registers.pc == addr) {
            memDisplay.push(x`<span>${_CPUDisplay.formatByte(this.memory._mem[addr])}</span> `);
          } else {
            memDisplay.push(x`${_CPUDisplay.formatByte(this.memory._mem[addr])} `);
          }
        }
        memDisplay.push(x`<br>\n`);
      }
      return x`<table>
        <tr>
            <th>PC</th>
            <td>0x${_CPUDisplay.formatWord(this.registers.pc)}</td>
        </tr>
        <tr>
            <th>AC</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.a)}</td>
        </tr>
        <tr>
            <th>X</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.x)}</td>
        </tr>
        <tr>
            <th>Y</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.y)}</td>
        </tr>        
        <tr>
            <th>SP</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.sp)}</td>
        </tr>
        <tr>
            <th>SR</th>
            <td>       
            <table class=flags>
            <tr>
                <th>N</th>
                <th>V</th>
                <th>-</th>
                <th>B</th>
                <th>D</th>
                <th>I</th>
                <th>Z</th>
                <th>C</th>
            </tr>
            <tr>
                <td><cpu-display-bit .bit=${this.registers.sr.n}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.v}></cpu-display-bit></td>
                <td>-</td>
                <td><cpu-display-bit .bit=${this.registers.sr.b}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.d}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.i}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.z}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.c}></cpu-display-bit></td>
            </tr>
        </table>
            </td>
        </tr>
        <tr>
            <th>Cycles</th>
            <td>${this.ticks}</td>
        </tr>        
        <tr>
            <th>c/s</th>
            <td>${this.cps}</td>
        </tr>        
    </table>

    
    <div class=memory>
    <textarea></textarea>
    ${memDisplay}
    </div>

    <div class=buttons>
        <button @click="${this.step}" title='Step' ?disabled=${this.cpu.isRunning}>⏯</button>
        <button @click="${this.start}" title='Start'  ?disabled=${this.cpu.isRunning}>▶️</button>
        <button @click="${this.fastForward}" title='Fast forward' ?disabled=${this.cpu.isRunning}>⏩</button>
        <button @click="${this.stop}" title='Stop' ?disabled=${!this.cpu.isRunning}>⏹</button>
    </div>
`;
    }
  };
  __publicField(_CPUDisplay, "styles", i`
        :root {
            color: var(--fg-color);
            background-color: var(--bg-color);
        }

        table,
        button {
            color: var(--fg-color);
            background-color: var(--bg-color);
            appearance: none;
            font-family: var(--font-family);
        }

        button {
            /* font-family: system-ui, sans-serif; */
            padding: 0;
            border: 0;
            font-size: 400%;
            cursor: pointer;
            margin-right: 0.125em;
            position: relative;
        }

        button:active {
            left: 1px;
            top: 1px;
        }

        button[disabled] {
            opacity: 0.5;
            pointer-events: none;
        }

        .buttons {
            clear: both;
            font-family: sans-serif;
        }

		table {
			background-color: #999;
            margin-bottom: 0.5em;
            margin-right: 2em;
            float: left;
		}

        .active  {
            background-color: #df0808;
            color: white;
        }

		th {
			text-align: right;
		}

		th, 
		td {
			background-color: var(--bg-color);
            color: var(--fg-color);
			padding: 0.5em;
		}

        table.flags th, 
        table.flags td {
            text-align: center;
        }

        textarea {
            width: 30ch;
            font-size: inherit;
            display: none;
        }

        .memory {
            > span {
                background-color: pink;
            }
        }
	`);
  var CPUDisplay = _CPUDisplay;
  customElements.define("cpu-display", CPUDisplay);

  // htdocs/js/InstructionDecoder.mjs
  var _InstructionDecoder = class _InstructionDecoder {
    /**
     * Takes an opcode and returns the instruction mnenomic and the addressing mode
     * 
     * eg 0xA2 returns [LDX, immediate]
     * 
     * @param {byte} opcode 
     * @returns [{String} instruction, {int} mode]
     */
    static decodeOpcode(opcode) {
      const lowByte = opcode & 15;
      const highByte = opcode >> 4 & 15;
      return _InstructionDecoder.opcodes[highByte][lowByte];
    }
  };
  __publicField(_InstructionDecoder, "opcodes", [
    //          0                1                2             3             4                 5                 6                 7             8                9                A                B             C                D                E                F
    /* 0 */
    [["BRK", "IMPL"], ["ORA", "#"], [null, null], [null, null], [null, null], ["ORA", "ZPG"], ["ASL", "ZPG"], [null, null], ["PHP", "IMPL"], ["ORA", "#"], ["ASL", "A"], [null, null], [null, null], ["ORA", "ABS"], ["ASL", "ABS"], [null, null]],
    /* 1 */
    [["BPL", "REL"], ["ORA", "INDY"], [null, null], [null, null], [null, null], ["ORA", "ZPGX"], ["ASL", "ZPGX"], [null, null], ["CLC", "IMPL"], ["ORA", "ABSY"], [null, null], [null, null], [null, null], ["ORA", "ABSX"], ["ASL", "ABSX"], [null, null]],
    /* 2 */
    [["JSR", "ABS"], ["AND", "XIND"], [null, null], [null, null], ["BIT", "ZPG"], ["AND", "ZPG"], ["ROL", "ZPG"], [null, null], ["PLP", "IMPL"], ["AND", "#"], ["ROL", "A"], [null, null], ["BIT", "ABS"], ["AND", "ABS"], ["ROL", "ABS"], [null, null]],
    /* 3 */
    [["BMI", "REL"], ["AND", "INDY"], [null, null], [null, null], [null, null], ["AND", "ZPGX"], ["ROL", "ZPGX"], [null, null], ["SEC", "IMPL"], ["AND", "ABSY"], [null, null], [null, null], [null, null], ["AND", "ABSX"], ["ROL", "ABSX"], [null, null]],
    /* 4 */
    [["RTI", "IMPL"], ["EOR", "XIND"], [null, null], [null, null], [null, null], ["EOR", "ZPG"], ["LSR", "ZPG"], [null, null], ["PHA", "IMPL"], ["EOR", "#"], ["LSR", "A"], [null, null], ["JMP", "ABS"], ["EOR", "ABS"], ["LSR", "ABS"], [null, null]],
    /* 5 */
    [["BVC", "REL"], ["EOR", "INDY"], [null, null], [null, null], [null, null], ["EOR", "ZPGX"], ["LSR", "ZPGX"], [null, null], ["CLI", "IMPL"], ["EOR", "ABSY"], [null, null], [null, null], [null, null], ["EOR", "ABSX"], ["LSR", "ABSX"], [null, null]],
    /* 6 */
    [["RTS", "IMPL"], ["ADC", "XIND"], [null, null], [null, null], [null, null], ["ADC", "ZPG"], ["ROR", "ZPG"], [null, null], ["PLA", "IMPL"], ["ADC", "#"], ["ROR", "A"], [null, null], ["JMP", "IND"], ["ADC", "ABS"], ["ROR", "ABS"], [null, null]],
    /* 7 */
    [["BVS", "REL"], ["ADC", "INDY"], [null, null], [null, null], [null, null], ["ADC", "ZPGX"], ["ROR", "ZPGX"], [null, null], ["SEI", "IMPL"], ["ADC", "ABSY"], [null, null], [null, null], [null, null], ["ADC", "ABSX"], ["ROR", "ABSX"], [null, null]],
    /* 8 */
    [[null, null], ["STA", "XIND"], [null, null], [null, null], ["STY", "ZPG"], ["STA", "ZPG"], ["STX", "ZPG"], [null, null], ["DEY", "IMPL"], [null, null], ["TXA", "IMPL"], [null, null], ["STY", "ABS"], ["STA", "ABS"], ["STX", "ABS"], [null, null]],
    /* 9 */
    [["BCC", "REL"], ["STA", "INDY"], [null, null], [null, null], ["STY", "ZPGX"], ["STA", "ZPGX"], ["STX", "ZPG,Y"], [null, null], ["TYA", "IMPL"], ["STA", "ABSY"], ["TXS", "IMPL"], [null, null], [null, null], ["STA", "ABSX"], [null, null], [null, null]],
    /* A */
    [["LDY", "#"], ["LDA", "XIND"], ["LDX", "#"], [null, null], ["LDY", "ZPG"], ["LDA", "ZPG"], ["LDX", "ZPG"], [null, null], ["TAY", "IMPL"], ["LDA", "#"], ["TAX", "IMPL"], [null, null], ["LDY", "ABS"], ["LDA", "ABS"], ["LDX", "ABS"], [null, null]],
    /* B */
    [["BCS", "REL"], ["LDA", "INDY"], [null, null], [null, null], ["LDY", "ZPGX"], ["LDA", "ZPGX"], ["LDX", "ZPG,Y"], [null, null], ["CLV", "IMPL"], ["LDA", "ABSY"], ["TSX", "IMPL"], [null, null], ["LDY", "ABSX"], ["LDA", "ABSX"], ["LDX", "ABSY"], [null, null]],
    /* C */
    [["CPY", "#"], ["CMP", "XIND"], [null, null], [null, null], ["CPY", "ZPG"], ["CMP", "ZPG"], ["DEC", "ZPG"], [null, null], ["INY", "IMPL"], ["CMP", "#"], ["DEX", "IMPL"], [null, null], ["CPY", "ABS"], ["CMP", "ABS"], ["DEC", "ABS"], [null, null]],
    /* D */
    [["BNE", "REL"], ["CMP", "INDY"], [null, null], [null, null], [null, null], ["CMP", "ZPGX"], ["DEC", "ZPGX"], [null, null], ["CLD", "IMPL"], ["CMP", "ABSY"], [null, null], [null, null], [null, null], ["CMP", "ABSX"], ["DEC", "ABSX"], [null, null]],
    /* E */
    [["CPX", "#"], ["SBC", "XIND"], [null, null], [null, null], ["CPX", "ZPG"], ["SBC", "ZPG"], ["INC", "ZPG"], [null, null], ["INX", "IMPL"], ["SBC", "#"], ["NOP", "IMPL"], [null, null], ["CPX", "ABS"], ["SBC", "ABS"], ["INC", "ABS"], [null, null]],
    /* F */
    [["BEQ", "REL"], ["SBC", "INDY"], [null, null], [null, null], [null, null], ["SBC", "ZPGX"], ["INC", "ZPGX"], [null, null], ["SED", "IMPL"], ["SBC", "ABSY"], [null, null], [null, null], [null, null], ["SBC", "ABSX"], ["INC", "ABSX"], [null, null]]
  ]);
  var InstructionDecoder = _InstructionDecoder;

  // htdocs/js/CPU.mjs
  var _CPU = class _CPU {
    static dec2hexByte(dec) {
      return dec.toString(16).padStart(2, "0").toUpperCase();
    }
    static dec2hexWord(dec) {
      return dec.toString(16).padStart(4, "0").toUpperCase();
    }
    constructor(options) {
      this.initRegisters();
      this.initMemory();
      this.initZeroTimeoutQueue();
      this.isRunning = false;
      this.isFastForwarding = false;
      this.tickCount = 0;
      this.subCycleInstructions = [];
      this.display = void 0;
      if (options && options.displayContainer) {
        this.display = document.createElement("cpu-display");
        this.display.cpu = this;
        this.display.memory = this.memory;
        options.displayContainer.append(this.display);
      }
      return this;
    }
    doTick() {
      this.tickCount++;
      this.processTick();
      if (this.isFastForwarding) {
        for (let i4 = 0; i4 < _CPU.FAST_FORWARD_CYCLE_BATCH_SIZE; i4++) {
          this.tickCount++;
          this.processTick();
        }
        this.updateDisplay();
        this.newZeroTimeout(this.doTick.bind(this));
      } else {
        this.updateDisplay();
        if (this.isRunning) {
          this.newZeroTimeout(this.doTick.bind(this));
        }
      }
    }
    initRegisters() {
      this.registers = {
        pc: 0,
        a: 0,
        x: 0,
        y: 0,
        sp: 255,
        sr: {
          n: 0,
          v: 0,
          b: 1,
          d: 0,
          i: 0,
          z: 0,
          c: 0
        }
      };
    }
    initMemory() {
      this.memory = new Memory();
    }
    /**
     * Do something in response to a clock tick
     */
    processTick() {
      if (this.subCycleInstructions.length) {
        const subCycleInstruction = this.subCycleInstructions.shift();
        subCycleInstruction();
      } else {
        this.fetchAndExecute();
        this.registers.pc++;
      }
    }
    boot() {
      this.updateDisplay();
    }
    /**
     * Fetches an instruction and executes it
     */
    fetchAndExecute() {
      let instruction, mode;
      const opcode = this.memory.readByte(this.registers.pc);
      [instruction, mode] = InstructionDecoder.decodeOpcode(opcode);
      console.log(`instruction: ${instruction}, mode: ${mode}`);
      switch (instruction) {
        case "ADC":
          (() => {
            let operand = {};
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              if (mode === "#") {
                this.getOperand(mode, operand);
                this.registers.a += operand.value;
              } else {
                this.registers.a += this.memory.readByte(operand.value);
              }
              if (this.registers.a > 255) {
                this.registers.a -= 256;
                this.registers.sr.c = 1;
              } else {
                this.registers.sr.c = 0;
              }
              this.updateFlags(this.registers.a);
            });
          })();
          break;
        case "BNE":
          this.queueStep(() => {
            let operand = {};
            this.getOperand(mode, operand);
            if (this.registers.sr.z !== 0) {
              console.log(`BNE,  z not 0 but ${_CPU.dec2hexByte(this.registers.sr.z)}`);
              return;
            }
            let newAddr = null;
            if (operand.value > 127) {
              newAddr = this.registers.pc - (256 - operand.value);
            } else {
              newAddr = this.registers.pc + operand.value;
            }
            console.log(`BNE jump to ${_CPU.dec2hexWord(newAddr)}`);
            this.registers.pc = newAddr;
          });
          break;
        case "BRK":
          this.stop();
          break;
        case "CLC":
          this.queueStep(() => {
            this.registers.sr.c = 0;
          });
          break;
        case "CPX":
          (() => {
            let operand = {};
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              if (mode === "#") {
                this.getOperand(mode, operand);
              }
              let result = this.registers.x - operand.value;
              if (result < 0) {
                this.registers.sr.c = 0;
              } else {
                this.registers.sr.c = 1;
              }
              this.updateFlags(result);
            });
          })();
          break;
        case "CMP":
          (() => {
            let operand = {};
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              if (mode === "#") {
                this.getOperand(mode, operand);
              }
              let result = this.registers.a - operand.value;
              if (result < 0) {
                this.registers.sr.c = 0;
              } else {
                this.registers.sr.c = 1;
              }
              this.updateFlags(result);
            });
          })();
          break;
        case "DEX":
          this.queueStep(() => {
            this.registers.x = this.registers.x - 1 & 255;
            this.updateFlags(this.registers.x);
          });
          break;
        case "INX":
          this.queueStep(() => {
            this.registers.x = this.registers.x + 1 & 255;
            this.updateFlags(this.registers.x);
          });
          break;
        case "INY":
          this.queueStep(() => {
            this.registers.y = this.registers.y + 1 & 255;
            this.updateFlags(this.registers.y);
          });
          break;
        case "JMP":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              console.log(`JMP to ${_CPU.dec2hexByte(operand.value)}`);
              this.registers.pc = operand.value;
            });
          })();
          break;
        case "LDA":
          this.loadRegister("a", mode);
          break;
        case "LDX":
          this.loadRegister("x", mode);
          break;
        case "LDY":
          this.loadRegister("y", mode);
          break;
        case "PHA":
          this.queueStep(() => {
          });
          this.queueStep(() => {
            this.pushToStack(this.registers.a);
          });
          break;
        case "STA":
          this.storeRegister("a", mode);
          break;
        case "STX":
          this.storeRegister("x", mode);
          break;
        case "STY":
          this.storeRegister("y", mode);
          break;
        case "TAX":
          this.queueStep(() => {
            this.registers.x = this.registers.a;
            this.updateFlags(this.registers.x);
          });
          break;
        case "TAY":
          this.queueStep(() => {
            this.registers.y = this.registers.a;
            this.updateFlags(this.registers.y);
          });
          break;
        case "TSX":
          this.queueStep(() => {
            this.registers.x = this.registers.sp;
            this.updateFlags(this.registers.x);
          });
          break;
        case "TXA":
          this.queueStep(() => {
            this.registers.a = this.registers.x;
            this.updateFlags(this.registers.a);
          });
          break;
        case "TXS":
          this.queueStep(() => {
            this.registers.sp = this.registers.x;
          });
          break;
        default:
          console.log(`Unknown instruction ${instruction}`);
      }
    }
    /**
     * Push a value onto the stack, and adjust the stack pointer
     * @param {byte} value 
     */
    pushToStack(value) {
      this.memory.writeByte(this.registers.sp + 256, value);
      this.registers.sp--;
      if (this.registers.sp < 0) {
        console.log("Stack has overflowed! Wrapping...");
        this.registers.sp = this.registers.sp & 255;
      }
    }
    /**
     * Load a register
     * 
     * @param {char} reg 
     */
    loadRegister(reg, mode) {
      let operand = {};
      if (mode === "#") {
        this.queueStep(() => {
          this.getOperand(mode, operand);
          console.log(`LD${reg.toUpperCase()} immediate  ${_CPU.dec2hexByte(operand.value)}, PC ${_CPU.dec2hexWord(this.registers.pc)}`);
          this.registers[reg] = operand.value;
          this.updateFlags(this.registers[reg]);
        });
      } else {
        this.getOperand(mode, operand);
        this.queueStep(() => {
          console.log(`LD${reg.toUpperCase()} ${mode} from 0x${_CPU.dec2hexByte(operand.value)}`);
          this.registers[reg] = this.memory.readByte(operand.value);
          this.updateFlags(this.registers[reg]);
        });
      }
    }
    /**
     * Store a register in a memory address
     * 
     * @param {char} reg
     * @param {String} mode 
     */
    storeRegister(reg, mode) {
      let operand = {};
      this.getOperand(mode, operand);
      this.queueStep(() => {
        console.log(`ST${reg.toUpperCase()} ${_CPU.dec2hexByte(this.registers[reg])} to ${_CPU.dec2hexWord(operand.value)}`);
        this.memory.writeByte(operand.value, this.registers[reg]);
      });
    }
    /**
     * Gets the operand depending on the addressing mode. 
     * The operand is modified in place
     * @param {*} mode 
     * @param {*} operand 
     */
    getOperand(mode, operand) {
      switch (mode) {
        case "#":
          operand.value = this.popByte();
          break;
        case "REL":
          operand.value = this.popByte();
          break;
        case "ABS":
          (() => {
            let lowByte, highByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              highByte = this.popByte();
              const addr = lowByte + (highByte << 8);
              operand.value = addr;
            });
          })();
          break;
        case "ABSY":
          (() => {
            let lowByte, highByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              highByte = this.popByte();
              const addr = lowByte + (highByte << 8) + this.registers.y;
              operand.value = addr;
            });
          })();
          break;
        case "IND":
          (() => {
            let lowByteSrc, highByteSrc, srcAddr;
            let lowByte, highByte;
            this.queueStep(() => {
              lowByteSrc = this.popByte();
            });
            this.queueStep(() => {
              highByteSrc = this.popByte();
              srcAddr = lowByteSrc + (highByteSrc << 8);
            });
            this.queueStep(() => {
              lowByte = this.memory.readByte(srcAddr);
            });
            this.queueStep(() => {
              highByte = this.memory.readByte(srcAddr + 1);
              operand.value = lowByte + (highByte << 8);
            });
          })();
          break;
        case "INDY":
          (() => {
            let zeroAddrSrc, srcLowByte, srcHighByte, srcAddr;
            let lowByte, highByte;
            this.queueStep(() => {
              zeroAddrSrc = this.popByte();
            });
            this.queueStep(() => {
              srcLowByte = this.memory.readByte(zeroAddrSrc);
            });
            this.queueStep(() => {
              srcHighByte = this.memory.readByte(zeroAddrSrc + 1 & 255);
              srcAddr = srcLowByte + (srcHighByte << 8) + this.registers.y;
              operand.value = srcAddr;
            });
          })();
          break;
        case "ZPG":
          (() => {
            let lowByte;
            this.queueStep(() => {
              lowByte = this.popByte();
              const addr = lowByte;
              operand.value = addr;
            });
          })();
          break;
        case "ZPGX":
          (() => {
            let lowByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              const addr = lowByte + this.registers.x & 255;
              operand.value = addr;
            });
          })();
          break;
        case "XIND":
          (() => {
            let zeroAddrSrc, srcAddr;
            let lowByte, highByte;
            this.queueStep(() => {
              zeroAddrSrc = this.popByte();
            });
            this.queueStep(() => {
              srcAddr = zeroAddrSrc + this.registers.x & 255;
            });
            this.queueStep(() => {
              lowByte = this.memory.readByte(srcAddr);
            });
            this.queueStep(() => {
              highByte = this.memory.readByte(srcAddr + 1);
              const finalAddress = lowByte + (highByte << 8);
              operand.value = finalAddress;
            });
          })();
          break;
        default:
          console.log(`Unknown addressing mode '${mode}'`);
          break;
      }
    }
    /**
     * Add a step to the sub instruction queue
     * @param {function} fn 
     */
    queueStep(fn) {
      this.subCycleInstructions.push(fn);
    }
    /**
     * Reads a byte and increments PC
     */
    popByte() {
      return this.memory.readByte(this.registers.pc++);
    }
    /**
     * Reads a word in little-endian format
     * 
     * Shouldn't use this, should use two popBytes, because each one 
     * takes a clock cycle
     */
    // popWord() {
    //     const lowByte = this.popByte();
    //     const highByte = this.popByte();
    //     return lowByte + (highByte << 8);
    // }
    /**
     * 
     * Updates the 6502 SR register flags 
     * 
     */
    updateFlags(result) {
      if (result == 0) {
        this.registers.sr.z = 1;
      } else {
        this.registers.sr.z = 0;
      }
      if (!!(result & 1 << 7)) {
        this.registers.sr.n = 1;
      } else {
        this.registers.sr.n = 0;
      }
    }
    step() {
      if (this.isRunning) {
        return;
      }
      this.doTick();
      this.updateDisplay();
      if (this.display) {
        this.display.cps = "";
      }
    }
    steps(n4) {
      for (let i4 = 0; i4 < n4; i4++) {
        this.doTick();
      }
      this.updateDisplay();
    }
    start() {
      if (this.isRunning) {
        return;
      }
      this.startProfiling();
      this.isRunning = true;
      this.doTick();
    }
    fastForward() {
      this.isFastForwarding = true;
      this.start();
    }
    stop() {
      this.stopProfiling();
      this.isRunning = false;
      this.isFastForwarding = false;
      this.updateDisplay();
    }
    /**
     * the ZeroTimeoutQueue is much faster than setTimeout(fn, 0)
     */
    initZeroTimeoutQueue() {
      this.timeoutsQueue = [];
      if (typeof window !== "undefined") {
        window.addEventListener("message", (event) => {
          if (event.source == window && event.data == "zeroTimeoutPushed") {
            event.stopPropagation();
            if (this.timeoutsQueue.length > 0) {
              var fn = this.timeoutsQueue.shift();
              fn();
            }
          }
        }, true);
      }
    }
    /**
     * Add a closure to the queue to be run as soon as possible
     * 
     * @param {function} fn 
     */
    newZeroTimeout(fn) {
      this.timeoutsQueue.push(fn);
      if (typeof window !== "undefined") {
        window.postMessage("zeroTimeoutPushed", "*");
      } else {
        setTimeout(fn, 0);
      }
    }
    /**
     * Update the display of the CPU (if there is one attached)
     */
    updateDisplay() {
      if (this.display) {
        const registers = __spreadValues({}, this.registers);
        for (const flag in this.registers.sr) {
          registers.sr[flag] = this.registers.sr[flag];
        }
        this.display.registers = registers;
        this.display.ticks = this.tickCount;
        this.display.memory = this.memory;
      }
    }
    startProfiling() {
      this.startTime = performance.now();
      this.startTicks = this.tickCount;
      this.profileUpdateIntervalTimer = setInterval(() => {
        this.updateProfile();
      }, 250);
    }
    updateProfile() {
      const timeTaken = (performance.now() - this.startTime) / 1e3;
      const ticksProcessed = this.tickCount - this.startTicks;
      if (this.display) {
        this.display.cps = Math.round(ticksProcessed / timeTaken);
      }
      this.updateDisplay();
    }
    stopProfiling() {
      clearInterval(this.profileUpdateIntervalTimer);
    }
  };
  __publicField(_CPU, "FAST_FORWARD_CYCLE_BATCH_SIZE", 9973);
  var CPU = _CPU;

  // htdocs/js/scripts.js
  document.addEventListener("DOMContentLoaded", function() {
    const displayElement = document.querySelector(".display");
    const cpu = new CPU({
      displayContainer: displayElement
    });
    let PC = 0;
    cpu.memory.hexLoad(1536, "a2 00 a0 00 8a 99 00 02 48 e8 c8 c0 10 d0 f5 68 99 00 02 c8 c0 20 d0 f7");
    cpu.registers.pc = 1536;
    window.cpu = cpu;
    cpu.boot();
  });
})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=scripts-dist.js.map
