// AI Assistant Plugin v2.0 — built with esbuild + marked
// Demonstrates npm dependency bundling in HyperRead plugins


// ../../node_modules/marked/lib/marked.esm.js
function L() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var T = L();
function G(l3) {
  T = l3;
}
var E = { exec: () => null };
function d(l3, e = "") {
  let t = typeof l3 == "string" ? l3 : l3.source, n = { replace: (r, i) => {
    let s = typeof i == "string" ? i : i.source;
    return s = s.replace(m.caret, "$1"), t = t.replace(r, s), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var be = (() => {
  try {
    return !!new RegExp("(?<=1)(?<!1)");
  } catch {
    return false;
  }
})();
var m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceTabs: /^\t+/, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] /, listReplaceTask: /^\[[ xX]\] +/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l3) => new RegExp(`^( {0,3}${l3})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (l3) => new RegExp(`^ {0,${Math.min(3, l3 - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (l3) => new RegExp(`^ {0,${Math.min(3, l3 - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (l3) => new RegExp(`^ {0,${Math.min(3, l3 - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (l3) => new RegExp(`^ {0,${Math.min(3, l3 - 1)}}#`), htmlBeginRegex: (l3) => new RegExp(`^ {0,${Math.min(3, l3 - 1)}}<(?:[a-z].*>|!--)`, "i") };
var Re = /^(?:[ \t]*(?:\n|$))+/;
var Te = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var Oe = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var I = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var we = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var F = /(?:[*+-]|\d{1,9}[.)])/;
var ie = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var oe = d(ie).replace(/bull/g, F).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var ye = d(ie).replace(/bull/g, F).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var j = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var Pe = /^[^\n]+/;
var Q = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var Se = d(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Q).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var $e = d(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, F).getRegex();
var v = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var U = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var _e = d("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", U).replace("tag", v).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var ae = d(j).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var Le = d(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", ae).getRegex();
var K = { blockquote: Le, code: Te, def: Se, fences: Oe, heading: we, hr: I, html: _e, lheading: oe, list: $e, newline: Re, paragraph: ae, table: E, text: Pe };
var re = d("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var Me = { ...K, lheading: ye, table: re, paragraph: d(j).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", re).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex() };
var ze = { ...K, html: d(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", U).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: E, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: d(j).replace("hr", I).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", oe).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Ae = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var Ee = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var le = /^( {2,}|\\)\n(?!\s*$)/;
var Ie = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var D = /[\p{P}\p{S}]/u;
var W = /[\s\p{P}\p{S}]/u;
var ue = /[^\s\p{P}\p{S}]/u;
var Ce = d(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, W).getRegex();
var pe = /(?!~)[\p{P}\p{S}]/u;
var Be = /(?!~)[\s\p{P}\p{S}]/u;
var qe = /(?:[^\s\p{P}\p{S}]|~)/u;
var ve = d(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", be ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var ce = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var De = d(ce, "u").replace(/punct/g, D).getRegex();
var He = d(ce, "u").replace(/punct/g, pe).getRegex();
var he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var Ze = d(he, "gu").replace(/notPunctSpace/g, ue).replace(/punctSpace/g, W).replace(/punct/g, D).getRegex();
var Ge = d(he, "gu").replace(/notPunctSpace/g, qe).replace(/punctSpace/g, Be).replace(/punct/g, pe).getRegex();
var Ne = d("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, ue).replace(/punctSpace/g, W).replace(/punct/g, D).getRegex();
var Fe = d(/\\(punct)/, "gu").replace(/punct/g, D).getRegex();
var je = d(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var Qe = d(U).replace("(?:-->|$)", "-->").getRegex();
var Ue = d("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Qe).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var q = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/;
var Ke = d(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", q).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var de = d(/^!?\[(label)\]\[(ref)\]/).replace("label", q).replace("ref", Q).getRegex();
var ke = d(/^!?\[(ref)\](?:\[\])?/).replace("ref", Q).getRegex();
var We = d("reflink|nolink(?!\\()", "g").replace("reflink", de).replace("nolink", ke).getRegex();
var se = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var X = { _backpedal: E, anyPunctuation: Fe, autolink: je, blockSkip: ve, br: le, code: Ee, del: E, emStrongLDelim: De, emStrongRDelimAst: Ze, emStrongRDelimUnd: Ne, escape: Ae, link: Ke, nolink: ke, punctuation: Ce, reflink: de, reflinkSearch: We, tag: Ue, text: Ie, url: E };
var Xe = { ...X, link: d(/^!?\[(label)\]\((.*?)\)/).replace("label", q).getRegex(), reflink: d(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", q).getRegex() };
var N = { ...X, emStrongRDelimAst: Ge, emStrongLDelim: He, url: d(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", se).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: d(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", se).getRegex() };
var Je = { ...N, br: d(le).replace("{2,}", "*").getRegex(), text: d(N.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var C = { normal: K, gfm: Me, pedantic: ze };
var M = { normal: X, gfm: N, breaks: Je, pedantic: Xe };
var Ve = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var ge = (l3) => Ve[l3];
function w(l3, e) {
  if (e) {
    if (m.escapeTest.test(l3)) return l3.replace(m.escapeReplace, ge);
  } else if (m.escapeTestNoEncode.test(l3)) return l3.replace(m.escapeReplaceNoEncode, ge);
  return l3;
}
function J(l3) {
  try {
    l3 = encodeURI(l3).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return l3;
}
function V(l3, e) {
  let t = l3.replace(m.findPipe, (i, s, a) => {
    let o = false, p = s;
    for (; --p >= 0 && a[p] === "\\"; ) o = !o;
    return o ? "|" : " |";
  }), n = t.split(m.splitPipe), r = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
  else for (; n.length < e; ) n.push("");
  for (; r < n.length; r++) n[r] = n[r].trim().replace(m.slashPipe, "|");
  return n;
}
function z(l3, e, t) {
  let n = l3.length;
  if (n === 0) return "";
  let r = 0;
  for (; r < n; ) {
    let i = l3.charAt(n - r - 1);
    if (i === e && !t) r++;
    else if (i !== e && t) r++;
    else break;
  }
  return l3.slice(0, n - r);
}
function fe(l3, e) {
  if (l3.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let n = 0; n < l3.length; n++) if (l3[n] === "\\") n++;
  else if (l3[n] === e[0]) t++;
  else if (l3[n] === e[1] && (t--, t < 0)) return n;
  return t > 0 ? -2 : -1;
}
function me(l3, e, t, n, r) {
  let i = e.href, s = e.title || null, a = l3[1].replace(r.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let o = { type: l3[0].charAt(0) === "!" ? "image" : "link", raw: t, href: i, title: s, text: a, tokens: n.inlineTokens(a) };
  return n.state.inLink = false, o;
}
function Ye(l3, e, t) {
  let n = l3.match(t.other.indentCodeCompensation);
  if (n === null) return e;
  let r = n[1];
  return e.split(`
`).map((i) => {
    let s = i.match(t.other.beginningSpace);
    if (s === null) return i;
    let [a] = s;
    return a.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var y = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0) return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = t[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: t[0], codeBlockStyle: "indented", text: this.options.pedantic ? n : z(n, `
`) };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], r = Ye(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: r };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let r = z(n, "#");
        (this.options.pedantic || !r || this.rules.other.endingSpaceChar.test(r)) && (n = r.trim());
      }
      return { type: "heading", raw: t[0], depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t) return { type: "hr", raw: z(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = z(t[0], `
`).split(`
`), r = "", i = "", s = [];
      for (; n.length > 0; ) {
        let a = false, o = [], p;
        for (p = 0; p < n.length; p++) if (this.rules.other.blockquoteStart.test(n[p])) o.push(n[p]), a = true;
        else if (!a) o.push(n[p]);
        else break;
        n = n.slice(p);
        let u = o.join(`
`), c = u.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        r = r ? `${r}
${u}` : u, i = i ? `${i}
${c}` : c;
        let g = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, s, true), this.lexer.state.top = g, n.length === 0) break;
        let h2 = s.at(-1);
        if (h2?.type === "code") break;
        if (h2?.type === "blockquote") {
          let R = h2, f = R.raw + `
` + n.join(`
`), O = this.blockquote(f);
          s[s.length - 1] = O, r = r.substring(0, r.length - R.raw.length) + O.raw, i = i.substring(0, i.length - R.text.length) + O.text;
          break;
        } else if (h2?.type === "list") {
          let R = h2, f = R.raw + `
` + n.join(`
`), O = this.list(f);
          s[s.length - 1] = O, r = r.substring(0, r.length - h2.raw.length) + O.raw, i = i.substring(0, i.length - R.raw.length) + O.raw, n = f.substring(s.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: r, tokens: s, text: i };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), r = n.length > 1, i = { type: "list", raw: "", ordered: r, start: r ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
      let s = this.rules.other.listItemRegex(n), a = false;
      for (; e; ) {
        let p = false, u = "", c = "";
        if (!(t = s.exec(e)) || this.rules.block.hr.test(e)) break;
        u = t[0], e = e.substring(u.length);
        let g = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (H) => " ".repeat(3 * H.length)), h2 = e.split(`
`, 1)[0], R = !g.trim(), f = 0;
        if (this.options.pedantic ? (f = 2, c = g.trimStart()) : R ? f = t[1].length + 1 : (f = t[2].search(this.rules.other.nonSpaceChar), f = f > 4 ? 1 : f, c = g.slice(f), f += t[1].length), R && this.rules.other.blankLine.test(h2) && (u += h2 + `
`, e = e.substring(h2.length + 1), p = true), !p) {
          let H = this.rules.other.nextBulletRegex(f), ee = this.rules.other.hrRegex(f), te = this.rules.other.fencesBeginRegex(f), ne = this.rules.other.headingBeginRegex(f), xe = this.rules.other.htmlBeginRegex(f);
          for (; e; ) {
            let Z = e.split(`
`, 1)[0], A;
            if (h2 = Z, this.options.pedantic ? (h2 = h2.replace(this.rules.other.listReplaceNesting, "  "), A = h2) : A = h2.replace(this.rules.other.tabCharGlobal, "    "), te.test(h2) || ne.test(h2) || xe.test(h2) || H.test(h2) || ee.test(h2)) break;
            if (A.search(this.rules.other.nonSpaceChar) >= f || !h2.trim()) c += `
` + A.slice(f);
            else {
              if (R || g.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || te.test(g) || ne.test(g) || ee.test(g)) break;
              c += `
` + h2;
            }
            !R && !h2.trim() && (R = true), u += Z + `
`, e = e.substring(Z.length + 1), g = A.slice(f);
          }
        }
        i.loose || (a ? i.loose = true : this.rules.other.doubleBlankLine.test(u) && (a = true));
        let O = null, Y;
        this.options.gfm && (O = this.rules.other.listIsTask.exec(c), O && (Y = O[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), i.items.push({ type: "list_item", raw: u, task: !!O, checked: Y, loose: false, text: c, tokens: [] }), i.raw += u;
      }
      let o = i.items.at(-1);
      if (o) o.raw = o.raw.trimEnd(), o.text = o.text.trimEnd();
      else return;
      i.raw = i.raw.trimEnd();
      for (let p = 0; p < i.items.length; p++) if (this.lexer.state.top = false, i.items[p].tokens = this.lexer.blockTokens(i.items[p].text, []), !i.loose) {
        let u = i.items[p].tokens.filter((g) => g.type === "space"), c = u.length > 0 && u.some((g) => this.rules.other.anyLine.test(g.raw));
        i.loose = c;
      }
      if (i.loose) for (let p = 0; p < i.items.length; p++) i.items[p].loose = true;
      return i;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) return { type: "html", block: true, raw: t[0], pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: t[0] };
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), r = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: t[0], href: r, title: i };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
    let n = V(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], s = { type: "table", raw: t[0], header: [], align: [], rows: [] };
    if (n.length === r.length) {
      for (let a of r) this.rules.other.tableAlignRight.test(a) ? s.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? s.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? s.align.push("left") : s.align.push(null);
      for (let a = 0; a < n.length; a++) s.header.push({ text: n[a], tokens: this.lexer.inline(n[a]), header: true, align: s.align[a] });
      for (let a of i) s.rows.push(V(a, s.header.length).map((o, p) => ({ text: o, tokens: this.lexer.inline(o), header: false, align: s.align[p] })));
      return s;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) return { type: "heading", raw: t[0], depth: t[2].charAt(0) === "=" ? 1 : 2, text: t[1], tokens: this.lexer.inline(t[1]) };
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t) return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n)) return;
        let s = z(n.slice(0, -1), "\\");
        if ((n.length - s.length) % 2 === 0) return;
      } else {
        let s = fe(t[2], "()");
        if (s === -2) return;
        if (s > -1) {
          let o = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + s;
          t[2] = t[2].substring(0, s), t[0] = t[0].substring(0, o).trim(), t[3] = "";
        }
      }
      let r = t[2], i = "";
      if (this.options.pedantic) {
        let s = this.rules.other.pedanticHrefTitle.exec(r);
        s && (r = s[1], i = s[3]);
      } else i = t[3] ? t[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? r = r.slice(1) : r = r.slice(1, -1)), me(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: i && i.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t[r.toLowerCase()];
      if (!i) {
        let s = n[0].charAt(0);
        return { type: "text", raw: s, text: s };
      }
      return me(n, i, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let r = this.rules.inline.emStrongLDelim.exec(e);
    if (!r || r[3] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(r[1] || r[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let s = [...r[0]].length - 1, a, o, p = s, u = 0, c = r[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + s); (r = c.exec(t)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a) continue;
        if (o = [...a].length, r[3] || r[4]) {
          p += o;
          continue;
        } else if ((r[5] || r[6]) && s % 3 && !((s + o) % 3)) {
          u += o;
          continue;
        }
        if (p -= o, p > 0) continue;
        o = Math.min(o, o + p + u);
        let g = [...r[0]][0].length, h2 = e.slice(0, s + r.index + g + o);
        if (Math.min(s, o) % 2) {
          let f = h2.slice(1, -1);
          return { type: "em", raw: h2, text: f, tokens: this.lexer.inlineTokens(f) };
        }
        let R = h2.slice(2, -2);
        return { type: "strong", raw: h2, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), r = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return r && i && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t) return { type: "br", raw: t[0] };
  }
  del(e) {
    let t = this.rules.inline.del.exec(e);
    if (t) return { type: "del", raw: t[0], text: t[2], tokens: this.lexer.inlineTokens(t[2]) };
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, r;
      return t[2] === "@" ? (n = t[1], r = "mailto:" + n) : (n = t[1], r = n), { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, r;
      if (t[2] === "@") n = t[0], r = "mailto:" + n;
      else {
        let i;
        do
          i = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (i !== t[0]);
        n = t[0], t[1] === "www." ? r = "http://" + t[0] : r = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
};
var x = class l {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(e) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new y(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t = { other: m, block: C.normal, inline: M.normal };
    this.options.pedantic ? (t.block = C.pedantic, t.inline = M.pedantic) : this.options.gfm && (t.block = C.gfm, this.options.breaks ? t.inline = M.breaks : t.inline = M.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: C, inline: M };
  }
  static lex(e, t) {
    return new l(t).lex(e);
  }
  static lexInline(e, t) {
    return new l(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0; t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    for (this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, "")); e; ) {
      let r;
      if (this.options.extensions?.block?.some((s) => (r = s.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false)) continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        r.raw.length === 1 && s !== void 0 ? s.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let s = 1 / 0, a = e.slice(1), o;
        this.options.extensions.startBlock.forEach((p) => {
          o = p.call({ lexer: this }, a), typeof o == "number" && o >= 0 && (s = Math.min(s, o));
        }), s < 1 / 0 && s >= 0 && (i = e.substring(0, s + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let s = t.at(-1);
        n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (e) {
        let s = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(s);
          break;
        } else throw new Error(s);
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  inlineTokens(e, t = []) {
    let n = e, r = null;
    if (this.tokens.links) {
      let o = Object.keys(this.tokens.links);
      if (o.length > 0) for (; (r = this.tokenizer.rules.inline.reflinkSearch.exec(n)) != null; ) o.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (n = n.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (r = this.tokenizer.rules.inline.anyPunctuation.exec(n)) != null; ) n = n.slice(0, r.index) + "++" + n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let i;
    for (; (r = this.tokenizer.rules.inline.blockSkip.exec(n)) != null; ) i = r[2] ? r[2].length : 0, n = n.slice(0, r.index + i) + "[" + "a".repeat(r[0].length - i - 2) + "]" + n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, a = "";
    for (; e; ) {
      s || (a = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((u) => (o = u.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), true) : false)) continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let u = t.at(-1);
        o.type === "text" && u?.type === "text" ? (u.raw += o.raw, u.text += o.text) : t.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, a)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      let p = e;
      if (this.options.extensions?.startInline) {
        let u = 1 / 0, c = e.slice(1), g;
        this.options.extensions.startInline.forEach((h2) => {
          g = h2.call({ lexer: this }, c), typeof g == "number" && g >= 0 && (u = Math.min(u, g));
        }), u < 1 / 0 && u >= 0 && (p = e.substring(0, u + 1));
      }
      if (o = this.tokenizer.inlineText(p)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (a = o.raw.slice(-1)), s = true;
        let u = t.at(-1);
        u?.type === "text" ? (u.raw += o.raw, u.text += o.text) : t.push(o);
        continue;
      }
      if (e) {
        let u = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(u);
          break;
        } else throw new Error(u);
      }
    }
    return t;
  }
};
var P = class {
  options;
  parser;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let r = (t || "").match(m.notSpaceStart)?.[0], i = e.replace(m.endingNewline, "") + `
`;
    return r ? '<pre><code class="language-' + w(r) + '">' + (n ? i : w(i, true)) + `</code></pre>
` : "<pre><code>" + (n ? i : w(i, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let t = e.ordered, n = e.start, r = "";
    for (let a = 0; a < e.items.length; a++) {
      let o = e.items[a];
      r += this.listitem(o);
    }
    let i = t ? "ol" : "ul", s = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + i + s + `>
` + r + "</" + i + `>
`;
  }
  listitem(e) {
    let t = "";
    if (e.task) {
      let n = this.checkbox({ checked: !!e.checked });
      e.loose ? e.tokens[0]?.type === "paragraph" ? (e.tokens[0].text = n + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = n + " " + w(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = true)) : e.tokens.unshift({ type: "text", raw: n + " ", text: n + " ", escaped: true }) : t += n + " ";
    }
    return t += this.parser.parse(e.tokens, !!e.loose), `<li>${t}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let i = 0; i < e.header.length; i++) n += this.tablecell(e.header[i]);
    t += this.tablerow({ text: n });
    let r = "";
    for (let i = 0; i < e.rows.length; i++) {
      let s = e.rows[i];
      n = "";
      for (let a = 0; a < s.length; a++) n += this.tablecell(s[a]);
      r += this.tablerow({ text: n });
    }
    return r && (r = `<tbody>${r}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + r + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${w(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let r = this.parser.parseInline(n), i = J(e);
    if (i === null) return r;
    e = i;
    let s = '<a href="' + e + '"';
    return t && (s += ' title="' + w(t) + '"'), s += ">" + r + "</a>", s;
  }
  image({ href: e, title: t, text: n, tokens: r }) {
    r && (n = this.parser.parseInline(r, this.parser.textRenderer));
    let i = J(e);
    if (i === null) return w(n);
    e = i;
    let s = `<img src="${e}" alt="${n}"`;
    return t && (s += ` title="${w(t)}"`), s += ">", s;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : w(e.text);
  }
};
var $ = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
};
var b = class l2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || T, this.options.renderer = this.options.renderer || new P(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new $();
  }
  static parse(e, t) {
    return new l2(t).parse(e);
  }
  static parseInline(e, t) {
    return new l2(t).parseInline(e);
  }
  parse(e, t = true) {
    let n = "";
    for (let r = 0; r < e.length; r++) {
      let i = e[r];
      if (this.options.extensions?.renderers?.[i.type]) {
        let a = i, o = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(a.type)) {
          n += o || "";
          continue;
        }
      }
      let s = i;
      switch (s.type) {
        case "space": {
          n += this.renderer.space(s);
          continue;
        }
        case "hr": {
          n += this.renderer.hr(s);
          continue;
        }
        case "heading": {
          n += this.renderer.heading(s);
          continue;
        }
        case "code": {
          n += this.renderer.code(s);
          continue;
        }
        case "table": {
          n += this.renderer.table(s);
          continue;
        }
        case "blockquote": {
          n += this.renderer.blockquote(s);
          continue;
        }
        case "list": {
          n += this.renderer.list(s);
          continue;
        }
        case "html": {
          n += this.renderer.html(s);
          continue;
        }
        case "def": {
          n += this.renderer.def(s);
          continue;
        }
        case "paragraph": {
          n += this.renderer.paragraph(s);
          continue;
        }
        case "text": {
          let a = s, o = this.renderer.text(a);
          for (; r + 1 < e.length && e[r + 1].type === "text"; ) a = e[++r], o += `
` + this.renderer.text(a);
          t ? n += this.renderer.paragraph({ type: "paragraph", raw: o, text: o, tokens: [{ type: "text", raw: o, text: o, escaped: true }] }) : n += o;
          continue;
        }
        default: {
          let a = 'Token with "' + s.type + '" type was not found.';
          if (this.options.silent) return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return n;
  }
  parseInline(e, t = this.renderer) {
    let n = "";
    for (let r = 0; r < e.length; r++) {
      let i = e[r];
      if (this.options.extensions?.renderers?.[i.type]) {
        let a = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (a !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(i.type)) {
          n += a || "";
          continue;
        }
      }
      let s = i;
      switch (s.type) {
        case "escape": {
          n += t.text(s);
          break;
        }
        case "html": {
          n += t.html(s);
          break;
        }
        case "link": {
          n += t.link(s);
          break;
        }
        case "image": {
          n += t.image(s);
          break;
        }
        case "strong": {
          n += t.strong(s);
          break;
        }
        case "em": {
          n += t.em(s);
          break;
        }
        case "codespan": {
          n += t.codespan(s);
          break;
        }
        case "br": {
          n += t.br(s);
          break;
        }
        case "del": {
          n += t.del(s);
          break;
        }
        case "text": {
          n += t.text(s);
          break;
        }
        default: {
          let a = 'Token with "' + s.type + '" type was not found.';
          if (this.options.silent) return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return n;
  }
};
var S = class {
  options;
  block;
  constructor(e) {
    this.options = e || T;
  }
  static passThroughHooks = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer() {
    return this.block ? x.lex : x.lexInline;
  }
  provideParser() {
    return this.block ? b.parse : b.parseInline;
  }
};
var B = class {
  defaults = L();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = P;
  TextRenderer = $;
  Lexer = x;
  Tokenizer = y;
  Hooks = S;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let r of e) switch (n = n.concat(t.call(this, r)), r.type) {
      case "table": {
        let i = r;
        for (let s of i.header) n = n.concat(this.walkTokens(s.tokens, t));
        for (let s of i.rows) for (let a of s) n = n.concat(this.walkTokens(a.tokens, t));
        break;
      }
      case "list": {
        let i = r;
        n = n.concat(this.walkTokens(i.items, t));
        break;
      }
      default: {
        let i = r;
        this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((s) => {
          let a = i[s].flat(1 / 0);
          n = n.concat(this.walkTokens(a, t));
        }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, t)));
      }
    }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let r = { ...n };
      if (r.async = this.defaults.async || r.async || false, n.extensions && (n.extensions.forEach((i) => {
        if (!i.name) throw new Error("extension name required");
        if ("renderer" in i) {
          let s = t.renderers[i.name];
          s ? t.renderers[i.name] = function(...a) {
            let o = i.renderer.apply(this, a);
            return o === false && (o = s.apply(this, a)), o;
          } : t.renderers[i.name] = i.renderer;
        }
        if ("tokenizer" in i) {
          if (!i.level || i.level !== "block" && i.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let s = t[i.level];
          s ? s.unshift(i.tokenizer) : t[i.level] = [i.tokenizer], i.start && (i.level === "block" ? t.startBlock ? t.startBlock.push(i.start) : t.startBlock = [i.start] : i.level === "inline" && (t.startInline ? t.startInline.push(i.start) : t.startInline = [i.start]));
        }
        "childTokens" in i && i.childTokens && (t.childTokens[i.name] = i.childTokens);
      }), r.extensions = t), n.renderer) {
        let i = this.defaults.renderer || new P(this.defaults);
        for (let s in n.renderer) {
          if (!(s in i)) throw new Error(`renderer '${s}' does not exist`);
          if (["options", "parser"].includes(s)) continue;
          let a = s, o = n.renderer[a], p = i[a];
          i[a] = (...u) => {
            let c = o.apply(i, u);
            return c === false && (c = p.apply(i, u)), c || "";
          };
        }
        r.renderer = i;
      }
      if (n.tokenizer) {
        let i = this.defaults.tokenizer || new y(this.defaults);
        for (let s in n.tokenizer) {
          if (!(s in i)) throw new Error(`tokenizer '${s}' does not exist`);
          if (["options", "rules", "lexer"].includes(s)) continue;
          let a = s, o = n.tokenizer[a], p = i[a];
          i[a] = (...u) => {
            let c = o.apply(i, u);
            return c === false && (c = p.apply(i, u)), c;
          };
        }
        r.tokenizer = i;
      }
      if (n.hooks) {
        let i = this.defaults.hooks || new S();
        for (let s in n.hooks) {
          if (!(s in i)) throw new Error(`hook '${s}' does not exist`);
          if (["options", "block"].includes(s)) continue;
          let a = s, o = n.hooks[a], p = i[a];
          S.passThroughHooks.has(s) ? i[a] = (u) => {
            if (this.defaults.async && S.passThroughHooksRespectAsync.has(s)) return (async () => {
              let g = await o.call(i, u);
              return p.call(i, g);
            })();
            let c = o.call(i, u);
            return p.call(i, c);
          } : i[a] = (...u) => {
            if (this.defaults.async) return (async () => {
              let g = await o.apply(i, u);
              return g === false && (g = await p.apply(i, u)), g;
            })();
            let c = o.apply(i, u);
            return c === false && (c = p.apply(i, u)), c;
          };
        }
        r.hooks = i;
      }
      if (n.walkTokens) {
        let i = this.defaults.walkTokens, s = n.walkTokens;
        r.walkTokens = function(a) {
          let o = [];
          return o.push(s.call(this, a)), i && (o = o.concat(i.call(this, a))), o;
        };
      }
      this.defaults = { ...this.defaults, ...r };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, r) => {
      let i = { ...r }, s = { ...this.defaults, ...i }, a = this.onError(!!s.silent, !!s.async);
      if (this.defaults.async === true && i.async === false) return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null) return a(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string") return a(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (s.hooks && (s.hooks.options = s, s.hooks.block = e), s.async) return (async () => {
        let o = s.hooks ? await s.hooks.preprocess(n) : n, u = await (s.hooks ? await s.hooks.provideLexer() : e ? x.lex : x.lexInline)(o, s), c = s.hooks ? await s.hooks.processAllTokens(u) : u;
        s.walkTokens && await Promise.all(this.walkTokens(c, s.walkTokens));
        let h2 = await (s.hooks ? await s.hooks.provideParser() : e ? b.parse : b.parseInline)(c, s);
        return s.hooks ? await s.hooks.postprocess(h2) : h2;
      })().catch(a);
      try {
        s.hooks && (n = s.hooks.preprocess(n));
        let p = (s.hooks ? s.hooks.provideLexer() : e ? x.lex : x.lexInline)(n, s);
        s.hooks && (p = s.hooks.processAllTokens(p)), s.walkTokens && this.walkTokens(p, s.walkTokens);
        let c = (s.hooks ? s.hooks.provideParser() : e ? b.parse : b.parseInline)(p, s);
        return s.hooks && (c = s.hooks.postprocess(c)), c;
      } catch (o) {
        return a(o);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let r = "<p>An error occurred:</p><pre>" + w(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(r) : r;
      }
      if (t) return Promise.reject(n);
      throw n;
    };
  }
};
var _ = new B();
function k(l3, e) {
  return _.parse(l3, e);
}
k.options = k.setOptions = function(l3) {
  return _.setOptions(l3), k.defaults = _.defaults, G(k.defaults), k;
};
k.getDefaults = L;
k.defaults = T;
k.use = function(...l3) {
  return _.use(...l3), k.defaults = _.defaults, G(k.defaults), k;
};
k.walkTokens = function(l3, e) {
  return _.walkTokens(l3, e);
};
k.parseInline = _.parseInline;
k.Parser = b;
k.parser = b.parse;
k.Renderer = P;
k.TextRenderer = $;
k.Lexer = x;
k.lexer = x.lex;
k.Tokenizer = y;
k.Hooks = S;
k.parse = k;
var Zt = k.options;
var Gt = k.setOptions;
var Nt = k.use;
var Ft = k.walkTokens;
var jt = k.parseInline;
var Ut = b.parse;
var Kt = x.lex;

// src/main.js
k.use({
  breaks: true,
  gfm: true,
  renderer: {
    code(code, lang) {
      const language = (lang || "text").trim();
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<div class="ai-code-block" data-lang="${language}">
        <div class="ai-code-header">
          <span class="ai-code-lang">${language}</span>
          <button class="ai-code-copy" title="\u590D\u5236\u4EE3\u7801" onclick="(function(btn){
            const code = btn.closest('.ai-code-block').querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(()=>{
              btn.innerHTML='${ICON_CHECK}';
              setTimeout(()=>{btn.innerHTML='${ICON_COPY}'},1500);
            });
          })(this)">${ICON_COPY}</button>
        </div>
        <pre><code class="ai-code language-${language}">${escaped}</code></pre>
      </div>`;
    },
    codespan(code) {
      return `<code class="ai-inline-code">${code}</code>`;
    }
  }
});
var ICON_COPY = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
var ICON_CHECK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
var ICON_TRASH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
var ICON_SEND = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
var ICON_BOT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`;
var ICON_USER = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
var ICON_CHEVRON = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
var PLUGIN_STYLES = `
.ai-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-size: 13px;
  font-family: inherit;
  background: var(--background);
  color: var(--foreground);
}

/* Header */
.ai-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  min-height: 40px;
}
.ai-header-title {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--foreground);
}
.ai-header-sub {
  font-size: 10px;
  font-weight: 400;
  color: var(--muted-foreground);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ai-icon-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.ai-icon-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}

/* Status bar */
.ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 10px;
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ai-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}
.ai-status-dot.error { background: #ef4444; }

/* Message area */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  scroll-behavior: smooth;
}
.ai-messages::-webkit-scrollbar { width: 4px; }
.ai-messages::-webkit-scrollbar-track { background: transparent; }
.ai-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Message rows */
.ai-msg-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  animation: ai-msg-in 0.2s ease;
}
.ai-msg-row.user { justify-content: flex-end; }
@keyframes ai-msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Avatars */
.ai-avatar {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.ai-avatar.bot {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
}
.ai-avatar.user {
  background: var(--muted);
  color: var(--muted-foreground);
}

/* Bubbles */
.ai-bubble-wrap {
  max-width: 88%;
  display: flex;
  flex-direction: column;
}
.ai-bubble {
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 12.5px;
  line-height: 1.6;
  word-break: break-word;
  position: relative;
}
.ai-msg-row.user .ai-bubble {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: 12px 12px 3px 12px;
}
.ai-msg-row.bot .ai-bubble {
  background: color-mix(in srgb, var(--muted) 60%, transparent);
  border: 1px solid var(--border);
  color: var(--foreground);
  border-radius: 12px 12px 12px 3px;
}

/* Bubble actions */
.ai-bubble-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  height: 18px;
}
.ai-msg-row:hover .ai-bubble-actions { opacity: 1; }
.ai-msg-row.user .ai-bubble-actions { justify-content: flex-end; }
.ai-bubble-action-btn {
  padding: 2px 6px;
  font-size: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: background 0.1s, color 0.1s;
}
.ai-bubble-action-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}

/* Timestamp */
.ai-meta {
  font-size: 10px;
  color: var(--muted-foreground);
  margin-top: 3px;
  padding: 0 2px;
}
.ai-msg-row.user .ai-meta { text-align: right; }

/* Markdown inside bot bubbles */
.ai-bubble p { margin: 0 0 8px; }
.ai-bubble p:last-child { margin-bottom: 0; }
.ai-bubble h1,.ai-bubble h2,.ai-bubble h3,.ai-bubble h4 {
  margin: 10px 0 6px;
  font-weight: 600;
  line-height: 1.3;
}
.ai-bubble h1 { font-size: 15px; }
.ai-bubble h2 { font-size: 14px; }
.ai-bubble h3,.ai-bubble h4 { font-size: 13px; }
.ai-bubble ul,.ai-bubble ol { margin: 4px 0 8px; padding-left: 18px; }
.ai-bubble li { margin-bottom: 3px; }
.ai-bubble blockquote {
  border-left: 3px solid var(--border);
  margin: 6px 0;
  padding: 4px 10px;
  color: var(--muted-foreground);
}
.ai-bubble strong { font-weight: 600; }
.ai-bubble em { font-style: italic; }
.ai-bubble hr { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
.ai-bubble table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; }
.ai-bubble th,.ai-bubble td { border: 1px solid var(--border); padding: 4px 8px; text-align: left; }
.ai-bubble th { background: var(--muted); font-weight: 600; }
.ai-bubble a { color: var(--primary); text-decoration: underline; word-break: break-all; }

/* Inline code */
.ai-inline-code {
  font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
  font-size: 11.5px;
  background: color-mix(in srgb, var(--muted) 80%, transparent);
  border: 1px solid var(--border);
  padding: 1px 5px;
  border-radius: 4px;
}

/* Code blocks (from marked renderer) */
.ai-code-block {
  margin: 8px 0;
  border-radius: 8px;
  border: 1px solid var(--border);
  overflow: hidden;
  background: color-mix(in srgb, var(--background) 95%, var(--muted));
}
.ai-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}
.ai-code-lang {
  font-size: 10px;
  font-family: ui-monospace, monospace;
  color: var(--muted-foreground);
  text-transform: lowercase;
}
.ai-code-copy {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  padding: 2px 4px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  transition: background 0.1s, color 0.1s;
}
.ai-code-copy:hover { background: var(--background); color: var(--foreground); }
.ai-code-block pre {
  margin: 0;
  padding: 10px 12px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}
.ai-code { font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace; }

/* Loading dots */
.ai-typing {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 12px 12px 12px 3px;
  background: color-mix(in srgb, var(--muted) 60%, transparent);
  border: 1px solid var(--border);
  width: fit-content;
}
.ai-typing span {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--muted-foreground);
  display: inline-block;
  animation: ai-bounce 1.2s ease-in-out infinite;
}
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes ai-bounce {
  0%,60%,100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* Welcome screen */
.ai-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: 20px 16px;
  text-align: center;
}
.ai-welcome-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.ai-welcome-title {
  font-size: 14px; font-weight: 600;
  margin: 0 0 4px;
}
.ai-welcome-desc {
  font-size: 11px;
  color: var(--muted-foreground);
  margin: 0 0 14px;
  line-height: 1.5;
  max-width: 200px;
}
.ai-suggestions { width: 100%; }
.ai-sug-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.ai-sug-btn {
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  font-size: 11.5px;
  background: color-mix(in srgb, var(--muted) 50%, transparent);
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  color: var(--foreground);
  margin-bottom: 5px;
  transition: background 0.12s, border-color 0.12s;
  line-height: 1.4;
}
.ai-sug-btn:hover {
  background: color-mix(in srgb, var(--primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
  color: var(--primary);
}

/* Input area */
.ai-input-area {
  padding: 8px 10px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--background);
}
.ai-role-bar {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  position: relative;
}
.ai-role-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 6px;
  border: 1px solid var(--border);
  border-radius: 100px;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  color: var(--muted-foreground);
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.ai-role-btn:hover {
  background: var(--muted);
  color: var(--foreground);
  border-color: var(--border);
}
.ai-role-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}
.ai-role-dropdown {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  z-index: 200;
  min-width: 160px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.ai-role-item {
  width: 100%;
  text-align: left;
  padding: 6px 9px;
  font-size: 12px;
  background: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: var(--foreground);
  display: flex;
  flex-direction: column;
  gap: 1px;
  transition: background 0.1s;
}
.ai-role-item:hover { background: var(--muted); }
.ai-role-item.active { background: color-mix(in srgb, var(--primary) 10%, transparent); }
.ai-role-item-name { font-weight: 500; }
.ai-role-item-desc { font-size: 10px; color: var(--muted-foreground); }

.ai-input-row {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}
.ai-textarea {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12.5px;
  background: color-mix(in srgb, var(--muted) 30%, transparent);
  color: var(--foreground);
  outline: none;
  resize: none;
  min-height: 34px;
  max-height: 120px;
  line-height: 1.5;
  font-family: inherit;
  transition: border-color 0.15s;
  overflow-y: auto;
}
.ai-textarea:focus { border-color: var(--primary); }
.ai-textarea::placeholder { color: var(--muted-foreground); }
.ai-textarea::-webkit-scrollbar { width: 3px; }
.ai-textarea::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.ai-send-btn {
  width: 34px; height: 34px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s, transform 0.1s;
}
.ai-send-btn:hover { opacity: 0.85; }
.ai-send-btn:active { transform: scale(0.93); }
.ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Settings panel */
.ai-settings {
  font-size: 13px;
  color: var(--foreground);
  height: 100%;
  display: flex;
  flex-direction: column;
}
.ai-settings-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 10px 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ai-settings-tab {
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  background: transparent;
  color: var(--muted-foreground);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.1s;
}
.ai-settings-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 6%, transparent);
}
.ai-settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
}
.ai-settings-content::-webkit-scrollbar { width: 4px; }
.ai-settings-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.ai-field { margin-bottom: 12px; }
.ai-label {
  display: block;
  font-size: 11.5px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--foreground);
}
.ai-input {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 12px;
  background: var(--background);
  color: var(--foreground);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.ai-input:focus { border-color: var(--primary); }
.ai-btn-row { display: flex; gap: 8px; margin-top: 4px; }
.ai-btn {
  flex: 1;
  padding: 7px;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  color: var(--foreground);
  transition: background 0.1s;
  font-family: inherit;
}
.ai-btn:hover { background: var(--muted); }
.ai-btn.primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.ai-btn.primary:hover { opacity: 0.85; }
.ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-status-msg {
  font-size: 11px;
  padding: 7px 10px;
  border-radius: 6px;
  margin-top: 8px;
  display: none;
}
.ai-status-msg.success { background: #dcfce7; color: #166534; }
.ai-status-msg.error { background: #fee2e2; color: #991b1b; }
.ai-status-msg.info { background: var(--muted); color: var(--muted-foreground); }
.ai-role-card {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 8px;
}
.ai-role-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.ai-role-name { font-size: 13px; font-weight: 500; }
.ai-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
  border-radius: 3px;
}
.ai-role-desc { font-size: 11px; color: var(--muted-foreground); margin-bottom: 6px; }
.ai-role-actions { display: flex; gap: 4px; }
.ai-role-action-btn {
  padding: 3px 9px;
  font-size: 11px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  color: var(--foreground);
  transition: background 0.1s;
  font-family: inherit;
}
.ai-role-action-btn:hover { background: var(--muted); }
.ai-role-action-btn.danger { color: #dc2626; }
.ai-role-action-btn.danger:hover { background: #fee2e2; }
.ai-add-role-btn {
  width: 100%;
  padding: 8px;
  font-size: 12px;
  border: 1.5px dashed var(--border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  transition: border-color 0.1s, color 0.1s, background 0.1s;
  font-family: inherit;
  margin-top: 4px;
}
.ai-add-role-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, transparent);
}
.ai-hist-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 6px;
  gap: 8px;
}
.ai-hist-info { flex: 1; min-width: 0; }
.ai-hist-name {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ai-hist-meta { font-size: 10px; color: var(--muted-foreground); margin-top: 2px; }
.ai-info-card {
  padding: 8px 10px;
  background: color-mix(in srgb, var(--muted) 50%, transparent);
  border-radius: 7px;
  font-size: 11px;
  color: var(--muted-foreground);
  margin-bottom: 10px;
}
`;
function createState(api) {
  return {
    config: { apiKey: "", apiUrl: "", model: "", isConfigured: false },
    roles: [],
    messages: [],
    currentDocument: null,
    isLoading: false,
    selectedRoleId: "default",
    conversations: {},
    api,
    sidebarHandle: null,
    settingsHandle: null,
    _externalPromptQueue: [],
    _externalSubmitPrompt: null,
    _externalPromptHandler: null,
    // Injected style element
    _styleEl: null
  };
}
function genDocKey(fp) {
  return btoa(encodeURIComponent(fp)).replace(/[/+=]/g, "_");
}
function hashContent(content) {
  let h2 = 0;
  for (let i = 0; i < content.length; i++) {
    h2 = (h2 << 5) - h2 + content.charCodeAt(i);
    h2 = h2 & h2;
  }
  return h2.toString(36);
}
function getConfigError(config) {
  if (!String(config.apiKey || "").trim()) return "\u8BF7\u586B\u5199 API Key";
  if (!String(config.model || "").trim()) return "\u8BF7\u586B\u5199\u6A21\u578B\u540D\u79F0";
  const apiUrl = String(config.apiUrl || "").trim();
  if (!apiUrl) return "\u8BF7\u586B\u5199 API URL";
  try {
    const url = new URL(apiUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "API URL \u5FC5\u987B\u4EE5 http:// \u6216 https:// \u5F00\u5934";
    }
  } catch {
    return "API URL \u5FC5\u987B\u662F\u5B8C\u6574\u5730\u5740\uFF0C\u4F8B\u5982 https://api.openai.com/v1/chat/completions";
  }
  return null;
}
function isConfigured(config) {
  return getConfigError(config) === null;
}
function getValidatedApiUrl(config) {
  const error = getConfigError(config);
  if (error) throw new Error(error);
  return String(config.apiUrl).trim();
}
async function loadData(state) {
  const d2 = await state.api.loadData();
  state.conversations = d2.conversations || {};
  state.config = { ...state.config, ...d2.config || {} };
  state.config.isConfigured = isConfigured(state.config);
  state.roles = d2.roles && d2.roles.length ? d2.roles : defaultRoles();
}
async function saveData(state) {
  await state.api.saveData({
    conversations: state.conversations,
    config: state.config,
    roles: state.roles
  });
}
function getDocMessages(state, filePath, content) {
  const conv = state.conversations[genDocKey(filePath)];
  if (!conv) return [];
  if (content && conv.documentHash && conv.documentHash !== hashContent(content)) {
    return conv.messages.filter((m2) => m2.role === "system");
  }
  return conv.messages.map((m2) => ({ ...m2, timestamp: new Date(m2.timestamp) }));
}
function saveDocMessages(state, filePath, fileName, messages, content) {
  const key = genDocKey(filePath);
  state.conversations[key] = {
    filePath,
    fileName,
    messages: messages.map((m2) => ({ ...m2, timestamp: new Date(m2.timestamp).toISOString() })),
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    documentHash: content ? hashContent(content) : void 0
  };
  const entries = Object.entries(state.conversations);
  if (entries.length > 100) {
    entries.sort((a, b2) => new Date(b2[1].lastUpdated) - new Date(a[1].lastUpdated));
    state.conversations = Object.fromEntries(entries.slice(0, 100));
  }
}
function defaultRoles() {
  return [
    {
      id: "default",
      name: "\u6587\u6863\u52A9\u624B",
      systemPrompt: "You are a professional document analysis assistant. Help users understand, analyze, and extract insights from documents. Be clear, concise, and accurate.",
      description: "\u4E13\u4E1A\u7684\u6587\u6863\u5206\u6790\u548C\u95EE\u7B54\u52A9\u624B",
      isDefault: true
    },
    {
      id: "translator",
      name: "\u7FFB\u8BD1\u52A9\u624B",
      systemPrompt: "You are a professional translator. Translate content accurately while preserving the original meaning and style. Provide natural, fluent translations.",
      description: "\u51C6\u786E\u7FFB\u8BD1\u6587\u6863\u5185\u5BB9"
    },
    {
      id: "summarizer",
      name: "\u6458\u8981\u52A9\u624B",
      systemPrompt: "You are an expert document summarizer. Extract key points and create clear, structured summaries. Focus on the most important information.",
      description: "\u63D0\u53D6\u5173\u952E\u70B9\u5E76\u751F\u6210\u7B80\u6D01\u6458\u8981"
    },
    {
      id: "coder",
      name: "\u4EE3\u7801\u52A9\u624B",
      systemPrompt: "You are an expert programmer. Help analyze code, explain technical concepts, suggest improvements, and write clean code. Format code examples properly.",
      description: "\u4EE3\u7801\u5206\u6790\u548C\u6280\u672F\u95EE\u7B54"
    }
  ];
}
var AiService = class {
  constructor(config) {
    this.config = config;
  }
  async send(messages) {
    if (!this.config.isConfigured) throw new Error("\u672A\u914D\u7F6E AI \u670D\u52A1");
    const apiUrl = getValidatedApiUrl(this.config);
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({ model: this.config.model, messages, temperature: 0.7, max_tokens: 2e3 })
    });
    if (!res.ok) throw new Error(`API \u9519\u8BEF ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.content?.[0]?.text || data.response || data.text;
    if (!text) throw new Error("\u65E0\u6CD5\u89E3\u6790\u54CD\u5E94");
    return text;
  }
  async test() {
    try {
      return !!await this.send([{ role: "user", content: "Hi" }]);
    } catch {
      return false;
    }
  }
};
function h(tag, cls, ...children) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  for (const c of children) {
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  }
  return el;
}
function fmtTime(d2) {
  return new Date(d2).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d2) {
  const now = /* @__PURE__ */ new Date(), dd = new Date(d2);
  const diffDays = Math.floor((now - dd) / 864e5);
  if (diffDays === 0) return "\u4ECA\u5929";
  if (diffDays === 1) return "\u6628\u5929";
  return dd.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
function buildChatPanel(container, state) {
  container.classList.add("ai-panel");
  const header = h("div", "ai-header");
  const titleWrap = h("div", "");
  titleWrap.style.cssText = "flex:1;min-width:0;display:flex;flex-direction:column;";
  const title = h("div", "ai-header-title", "AI \u52A9\u624B");
  const subTitle = h("div", "ai-header-sub", "");
  titleWrap.append(title, subTitle);
  const btnClear = h("button", "ai-icon-btn");
  btnClear.title = "\u6E05\u7A7A\u5BF9\u8BDD";
  btnClear.innerHTML = ICON_TRASH;
  header.append(titleWrap, btnClear);
  container.append(header);
  const statusBar = h("div", "ai-status");
  statusBar.style.display = "none";
  container.append(statusBar);
  const refreshStatus = () => {
    statusBar.innerHTML = "";
    if (state.config.isConfigured) {
      const dot = h("div", "ai-status-dot");
      const label = h("span", "", `\u81EA\u5B9A\u4E49 \xB7 ${state.config.model}`);
      statusBar.append(dot, label);
      statusBar.style.display = "flex";
    } else {
      statusBar.style.display = "none";
    }
  };
  refreshStatus();
  const msgArea = h("div", "ai-messages");
  container.append(msgArea);
  let currentMessages = [];
  function typewrite(el, text, speed = 12) {
    return new Promise((resolve) => {
      const words = text.split(/(\s+)/);
      let i = 0;
      const tick = () => {
        if (i >= words.length) {
          resolve();
          return;
        }
        el.innerHTML = k.parse(words.slice(0, i + 1).join(""));
        i++;
        setTimeout(tick, speed);
      };
      tick();
    });
  }
  function renderMsgBubble(msg, animate = false) {
    const isUser = msg.role === "user";
    const row = h("div", `ai-msg-row ${isUser ? "user" : "bot"}`);
    if (!isUser) {
      const avatar = h("div", "ai-avatar bot");
      avatar.innerHTML = ICON_BOT;
      row.append(avatar);
    }
    const wrap = h("div", "ai-bubble-wrap");
    const bubble = h("div", "ai-bubble");
    if (isUser) {
      bubble.textContent = msg.content;
    } else {
      if (animate) {
        bubble.innerHTML = "";
        wrap.append(bubble);
        const actions2 = makeBubbleActions(msg);
        wrap.append(actions2);
        row.append(wrap);
        return { row, startTypewrite: () => typewrite(bubble, msg.content) };
      } else {
        bubble.innerHTML = k.parse(msg.content);
      }
    }
    const actions = makeBubbleActions(msg);
    const meta = h("div", "ai-meta", fmtTime(msg.timestamp));
    wrap.append(bubble, actions, meta);
    row.append(wrap);
    if (isUser) {
      const avatar = h("div", "ai-avatar user");
      avatar.innerHTML = ICON_USER;
      row.append(avatar);
    }
    return { row };
  }
  function makeBubbleActions(msg) {
    const actions = h("div", "ai-bubble-actions");
    const copyBtn = h("button", "ai-bubble-action-btn");
    copyBtn.innerHTML = `${ICON_COPY} <span>\u590D\u5236</span>`;
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(msg.content).then(() => {
        copyBtn.innerHTML = `${ICON_CHECK} <span>\u5DF2\u590D\u5236</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `${ICON_COPY} <span>\u590D\u5236</span>`;
        }, 1500);
      });
    };
    actions.append(copyBtn);
    return actions;
  }
  function buildTypingIndicator() {
    const row = h("div", "ai-msg-row bot");
    const avatar = h("div", "ai-avatar bot");
    avatar.innerHTML = ICON_BOT;
    const dots = h("div", "ai-typing");
    dots.innerHTML = "<span></span><span></span><span></span>";
    row.append(avatar, dots);
    return row;
  }
  function buildWelcome() {
    const wrap = h("div", "ai-welcome");
    const icon = h("div", "ai-welcome-icon");
    icon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>`;
    const titleEl = h("h4", "ai-welcome-title", state.config.isConfigured ? "\u4F60\u597D\uFF0C\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u4F60\uFF1F" : "\u6B22\u8FCE\u4F7F\u7528 AI \u52A9\u624B");
    const desc = h("p", "ai-welcome-desc");
    if (!state.config.isConfigured) {
      desc.textContent = "\u8BF7\u5728\u8BBE\u7F6E \u2192 \u63D2\u4EF6 \u2192 AI \u52A9\u624B\u8BBE\u7F6E \u4E2D\u914D\u7F6E API";
      wrap.append(icon, titleEl, desc);
      return wrap;
    }
    if (state.currentDocument) {
      desc.textContent = `\u6B63\u5728\u9605\u8BFB\u300C${state.currentDocument.fileName}\u300D\uFF0C\u53EF\u4EE5\u63D0\u95EE\u5173\u4E8E\u8BE5\u6587\u6863\u7684\u4EFB\u4F55\u95EE\u9898`;
    } else {
      desc.textContent = "\u6253\u5F00\u6587\u6863\u540E\uFF0C\u6211\u53EF\u4EE5\u5E2E\u4F60\u5206\u6790\u548C\u7406\u89E3\u5185\u5BB9";
    }
    wrap.append(icon, titleEl, desc);
    if (state.currentDocument) {
      const sugs = h("div", "ai-suggestions");
      const label = h("p", "ai-sug-label", "\u5EFA\u8BAE\u63D0\u95EE");
      sugs.append(label);
      const questions = ["\u8FD9\u7BC7\u6587\u6863\u7684\u4E3B\u8981\u5185\u5BB9\u662F\u4EC0\u4E48\uFF1F", "\u5E2E\u6211\u603B\u7ED3\u4E00\u4E0B\u5173\u952E\u8981\u70B9", "\u6587\u6863\u4E2D\u6709\u54EA\u4E9B\u91CD\u8981\u7684\u6982\u5FF5\uFF1F", "\u5E2E\u6211\u627E\u51FA\u6587\u6863\u4E2D\u7684\u7ED3\u8BBA"];
      questions.forEach((q2) => {
        const btn = h("button", "ai-sug-btn", q2);
        btn.onclick = () => {
          textarea.value = q2;
          autoResize();
          textarea.focus();
        };
        sugs.append(btn);
      });
      wrap.append(sugs);
    }
    return wrap;
  }
  async function renderMessages(animateLast = false) {
    msgArea.innerHTML = "";
    const display = currentMessages.filter((m2) => m2.role !== "system");
    if (display.length === 0) {
      msgArea.append(buildWelcome());
      return;
    }
    for (let i = 0; i < display.length; i++) {
      const msg = display[i];
      const isLast = i === display.length - 1;
      const animate = animateLast && isLast && msg.role === "assistant";
      const result = renderMsgBubble(msg, animate);
      msgArea.append(result.row);
      if (animate && result.startTypewrite) {
        await result.startTypewrite();
        const bubble = result.row.querySelector(".ai-bubble");
        const meta = h("div", "ai-meta", fmtTime(msg.timestamp));
        result.row.querySelector(".ai-bubble-wrap").append(meta);
      }
    }
    if (state.isLoading) {
      msgArea.append(buildTypingIndicator());
    }
    msgArea.scrollTop = msgArea.scrollHeight;
  }
  function buildSystemMsg() {
    const role = state.roles.find((r) => r.id === state.selectedRoleId) || state.roles.find((r) => r.isDefault) || state.roles[0];
    let prompt = role?.systemPrompt || "You are a helpful assistant.";
    if (state.currentDocument) {
      const excerpt = state.currentDocument.content.substring(0, 4e3);
      prompt += `

The user is reading "${state.currentDocument.fileName}".

Document content:
${excerpt}${state.currentDocument.content.length > 4e3 ? "\n\n[content truncated]" : ""}

Answer questions based on this document.`;
    }
    return { id: "__sys__", role: "system", content: prompt, timestamp: /* @__PURE__ */ new Date() };
  }
  function loadDocMsgs() {
    if (state.currentDocument) {
      const saved = getDocMessages(state, state.currentDocument.filePath, state.currentDocument.content);
      currentMessages = saved.length > 0 ? saved : [buildSystemMsg()];
    } else {
      currentMessages = [buildSystemMsg()];
    }
    renderMessages();
  }
  const inputArea = h("div", "ai-input-area");
  const roleBar = h("div", "ai-role-bar");
  const roleBtn = h("button", "ai-role-btn");
  const roleDot = h("span", "ai-role-dot");
  const roleName = h("span", "", "");
  const roleChev = h("span", "");
  roleChev.innerHTML = ICON_CHEVRON;
  roleBtn.append(roleDot, roleName, roleChev);
  const roleDrop = h("div", "ai-role-dropdown");
  roleDrop.style.display = "none";
  let roleDropOpen = false;
  const refreshRoleBtn = () => {
    const cur = state.roles.find((r) => r.id === state.selectedRoleId) || state.roles[0];
    roleName.textContent = cur?.name || "\u9009\u62E9\u89D2\u8272";
  };
  refreshRoleBtn();
  const openRoleDrop = () => {
    roleDrop.innerHTML = "";
    state.roles.forEach((role) => {
      const item = h("button", `ai-role-item${role.id === state.selectedRoleId ? " active" : ""}`);
      const nameEl = h("span", "ai-role-item-name", role.name);
      item.append(nameEl);
      if (role.description) item.append(h("span", "ai-role-item-desc", role.description));
      item.onclick = () => {
        state.selectedRoleId = role.id;
        const sysMsg = buildSystemMsg();
        currentMessages = [sysMsg, ...currentMessages.filter((m2) => m2.role !== "system")];
        refreshRoleBtn();
        roleDrop.style.display = "none";
        roleDropOpen = false;
        renderMessages();
      };
      roleDrop.append(item);
    });
  };
  roleBtn.onclick = () => {
    roleDropOpen = !roleDropOpen;
    if (roleDropOpen) {
      openRoleDrop();
      roleDrop.style.display = "block";
    } else roleDrop.style.display = "none";
  };
  document.addEventListener("click", (e) => {
    if (!roleBar.contains(e.target)) {
      roleDrop.style.display = "none";
      roleDropOpen = false;
    }
  });
  roleBar.append(roleBtn, roleDrop);
  inputArea.append(roleBar);
  const inputRow = h("div", "ai-input-row");
  const textarea = document.createElement("textarea");
  textarea.className = "ai-textarea";
  textarea.placeholder = state.config.isConfigured ? "\u53D1\u9001\u6D88\u606F... (Enter \u53D1\u9001\uFF0CShift+Enter \u6362\u884C)" : "\u8BF7\u5148\u914D\u7F6E API...";
  textarea.disabled = !state.config.isConfigured;
  textarea.rows = 1;
  const autoResize = () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };
  textarea.addEventListener("input", autoResize);
  const sendBtn = h("button", "ai-send-btn");
  sendBtn.innerHTML = ICON_SEND;
  sendBtn.disabled = !state.config.isConfigured;
  const doSend = async () => {
    const text = textarea.value.trim();
    if (!text || state.isLoading || !state.config.isConfigured) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: text, timestamp: /* @__PURE__ */ new Date() };
    currentMessages.push(userMsg);
    textarea.value = "";
    autoResize();
    state.isLoading = true;
    renderMessages();
    try {
      const svc = new AiService(state.config);
      const aiText = await svc.send(currentMessages.map((m2) => ({ role: m2.role, content: m2.content })));
      const aiMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: aiText, timestamp: /* @__PURE__ */ new Date() };
      currentMessages.push(aiMsg);
      state.isLoading = false;
      if (state.currentDocument) {
        saveDocMessages(state, state.currentDocument.filePath, state.currentDocument.fileName, currentMessages, state.currentDocument.content);
      }
      saveData(state);
      renderMessages(true);
    } catch (e) {
      const errMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: `**\u9519\u8BEF**\uFF1A${e.message}`, timestamp: /* @__PURE__ */ new Date() };
      currentMessages.push(errMsg);
      state.isLoading = false;
      renderMessages();
    }
  };
  const submitExternalPrompt = (text) => {
    const prompt = String(text || "").trim();
    if (!prompt) return;
    textarea.value = prompt;
    autoResize();
    if (!state.config.isConfigured || state.isLoading) {
      textarea.focus();
      return;
    }
    doSend();
  };
  state._externalSubmitPrompt = submitExternalPrompt;
  if (state._externalPromptQueue.length > 0) {
    const queuedPrompts = state._externalPromptQueue.splice(0);
    queuedPrompts.forEach((prompt, index) => {
      window.setTimeout(() => submitExternalPrompt(prompt), index * 80);
    });
  }
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });
  sendBtn.onclick = doSend;
  inputRow.append(textarea, sendBtn);
  inputArea.append(inputRow);
  container.append(inputArea);
  const refreshHeaderTitle = () => {
    if (state.currentDocument) {
      title.textContent = state.currentDocument.fileName;
      subTitle.textContent = "AI \u52A9\u624B";
    } else {
      title.textContent = "AI \u52A9\u624B";
      subTitle.textContent = "";
    }
  };
  refreshHeaderTitle();
  btnClear.onclick = () => {
    if (state.currentDocument) {
      delete state.conversations[genDocKey(state.currentDocument.filePath)];
      saveData(state);
    }
    currentMessages = [buildSystemMsg()];
    renderMessages();
  };
  const onDocOpen = (fileData) => {
    state.currentDocument = fileData;
    refreshHeaderTitle();
    refreshStatus();
    textarea.placeholder = state.config.isConfigured ? "\u53D1\u9001\u6D88\u606F... (Enter \u53D1\u9001\uFF0CShift+Enter \u6362\u884C)" : "\u8BF7\u5148\u914D\u7F6E API...";
    textarea.disabled = !state.config.isConfigured;
    sendBtn.disabled = !state.config.isConfigured;
    loadDocMsgs();
  };
  state.api.on("document:open", onDocOpen);
  loadDocMsgs();
  return () => {
    state.api.off("document:open", onDocOpen);
    if (state._externalSubmitPrompt === submitExternalPrompt) {
      state._externalSubmitPrompt = null;
    }
  };
}
function buildSettingsPanel(container, state) {
  container.classList.add("ai-settings");
  const tabNames = ["api", "roles", "history"];
  const tabLabels = { api: "API \u914D\u7F6E", roles: "\u89D2\u8272\u7BA1\u7406", history: "\u5BF9\u8BDD\u5386\u53F2" };
  let activeTab = "api";
  const tabBar = h("div", "ai-settings-tabs");
  const tabBtns = {};
  tabNames.forEach((t) => {
    const btn = h("button", `ai-settings-tab${t === activeTab ? " active" : ""}`, tabLabels[t]);
    btn.onclick = () => {
      activeTab = t;
      tabNames.forEach((name) => {
        tabBtns[name].className = `ai-settings-tab${name === t ? " active" : ""}`;
        panels[name].style.display = name === t ? "" : "none";
      });
    };
    tabBtns[t] = btn;
    tabBar.append(btn);
  });
  container.append(tabBar);
  const panels = {};
  const apiPanel = h("div", "ai-settings-content");
  const mkField = (label, inputEl) => {
    const field = h("div", "ai-field");
    field.append(h("label", "ai-label", label), inputEl);
    return field;
  };
  const apiKeyInp = document.createElement("input");
  apiKeyInp.type = "password";
  apiKeyInp.className = "ai-input";
  apiKeyInp.value = state.config.apiKey || "";
  apiKeyInp.placeholder = "sk-...";
  const apiUrlInp = document.createElement("input");
  apiUrlInp.type = "url";
  apiUrlInp.className = "ai-input";
  apiUrlInp.value = state.config.apiUrl || "";
  apiUrlInp.placeholder = "https://api.openai.com/v1/chat/completions";
  const modelInp = document.createElement("input");
  modelInp.type = "text";
  modelInp.className = "ai-input";
  modelInp.value = state.config.model || "";
  modelInp.placeholder = "gpt-4o";
  const statusMsg = h("div", "ai-status-msg");
  const setStatus = (type, text) => {
    statusMsg.className = `ai-status-msg ${type}`;
    statusMsg.textContent = text;
    statusMsg.style.display = "block";
  };
  const btnRow = h("div", "ai-btn-row");
  const testBtn = h("button", "ai-btn", "\u6D4B\u8BD5\u8FDE\u63A5");
  testBtn.onclick = async () => {
    const cfg = {
      apiKey: apiKeyInp.value.trim(),
      apiUrl: apiUrlInp.value.trim(),
      model: modelInp.value.trim(),
      isConfigured: true
    };
    const configError = getConfigError(cfg);
    if (configError) {
      setStatus("error", configError);
      return;
    }
    testBtn.disabled = true;
    testBtn.textContent = "\u6D4B\u8BD5\u4E2D...";
    setStatus("info", "\u6B63\u5728\u8FDE\u63A5...");
    const ok = await new AiService(cfg).test();
    testBtn.disabled = false;
    testBtn.textContent = "\u6D4B\u8BD5\u8FDE\u63A5";
    setStatus(ok ? "success" : "error", ok ? "\u2713 \u8FDE\u63A5\u6210\u529F" : "\u2717 \u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E");
  };
  const saveBtn = h("button", "ai-btn primary", "\u4FDD\u5B58");
  saveBtn.onclick = () => {
    const nextConfig = {
      apiKey: apiKeyInp.value.trim(),
      apiUrl: apiUrlInp.value.trim(),
      model: modelInp.value.trim()
    };
    const configError = getConfigError(nextConfig);
    state.config = { ...nextConfig, isConfigured: !configError };
    saveData(state);
    setStatus(configError ? "error" : "success", configError || "\u2713 \u914D\u7F6E\u5DF2\u4FDD\u5B58");
  };
  btnRow.append(testBtn, saveBtn);
  apiPanel.append(
    mkField("API Key", apiKeyInp),
    mkField("API URL (\u517C\u5BB9 OpenAI \u683C\u5F0F)", apiUrlInp),
    mkField("\u6A21\u578B\u540D\u79F0", modelInp),
    btnRow,
    statusMsg
  );
  panels.api = apiPanel;
  const rolesPanel = h("div", "ai-settings-content");
  const renderRoles = () => {
    rolesPanel.innerHTML = "";
    state.roles.forEach((role) => {
      const card = h("div", "ai-role-card");
      const hdr = h("div", "ai-role-card-header");
      hdr.append(h("span", "ai-role-name", role.name));
      if (role.isDefault) hdr.append(h("span", "ai-badge", "\u9ED8\u8BA4"));
      if (role.description) card.append(hdr, h("p", "ai-role-desc", role.description));
      else card.append(hdr);
      const editForm = h("div", "");
      editForm.style.display = "none";
      const nameInp = document.createElement("input");
      nameInp.type = "text";
      nameInp.className = "ai-input";
      nameInp.value = role.name;
      nameInp.style.marginBottom = "6px";
      const descInp = document.createElement("input");
      descInp.type = "text";
      descInp.className = "ai-input";
      descInp.value = role.description || "";
      descInp.placeholder = "\u89D2\u8272\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09";
      descInp.style.marginBottom = "6px";
      const promptTa = document.createElement("textarea");
      promptTa.className = "ai-input";
      promptTa.value = role.systemPrompt;
      promptTa.placeholder = "System prompt...";
      promptTa.rows = 4;
      promptTa.style.cssText = "min-height:80px;resize:vertical;font-family:inherit;";
      const fBtnRow = h("div", "ai-btn-row");
      fBtnRow.style.marginTop = "6px";
      const saveRoleBtn = h("button", "ai-btn primary", "\u4FDD\u5B58");
      saveRoleBtn.onclick = () => {
        role.name = nameInp.value.trim() || role.name;
        role.description = descInp.value.trim();
        role.systemPrompt = promptTa.value;
        saveData(state);
        renderRoles();
      };
      const cancelBtn = h("button", "ai-btn", "\u53D6\u6D88");
      cancelBtn.onclick = () => {
        editForm.style.display = "none";
        actRow.style.display = "flex";
      };
      fBtnRow.append(saveRoleBtn, cancelBtn);
      editForm.append(
        h("label", "ai-label", "\u540D\u79F0"),
        nameInp,
        h("label", "ai-label", "\u63CF\u8FF0"),
        descInp,
        h("label", "ai-label", "System Prompt"),
        promptTa,
        fBtnRow
      );
      const actRow = h("div", "ai-role-actions");
      const editBtn = h("button", "ai-role-action-btn", "\u7F16\u8F91");
      editBtn.onclick = () => {
        editForm.style.display = "block";
        actRow.style.display = "none";
      };
      actRow.append(editBtn);
      if (!role.isDefault) {
        const delBtn = h("button", "ai-role-action-btn danger", "\u5220\u9664");
        delBtn.onclick = () => {
          state.roles = state.roles.filter((r) => r.id !== role.id);
          saveData(state);
          renderRoles();
        };
        actRow.append(delBtn);
      }
      card.append(actRow, editForm);
      rolesPanel.append(card);
    });
    const addBtn = h("button", "ai-add-role-btn", "+ \u6DFB\u52A0\u81EA\u5B9A\u4E49\u89D2\u8272");
    addBtn.onclick = () => {
      state.roles.push({ id: `role-${Date.now()}`, name: "\u65B0\u89D2\u8272", systemPrompt: "", description: "" });
      saveData(state);
      renderRoles();
    };
    rolesPanel.append(addBtn);
  };
  renderRoles();
  panels.roles = rolesPanel;
  const histPanel = h("div", "ai-settings-content");
  const renderHistory = () => {
    histPanel.innerHTML = "";
    const convs = Object.values(state.conversations).sort((a, b2) => new Date(b2.lastUpdated) - new Date(a.lastUpdated)).slice(0, 50);
    const infoCard = h("div", "ai-info-card");
    infoCard.innerHTML = `\u5171 <strong>${convs.length}</strong> \u6BB5\u5BF9\u8BDD\u5386\u53F2\uFF08\u6700\u591A\u4FDD\u7559 100 \u6BB5\uFF09`;
    histPanel.append(infoCard);
    if (convs.length === 0) {
      histPanel.append(h("p", "", "\u6682\u65E0\u5BF9\u8BDD\u5386\u53F2"));
    } else {
      convs.forEach((conv) => {
        const item = h("div", "ai-hist-item");
        const info = h("div", "ai-hist-info");
        info.append(h("div", "ai-hist-name", conv.fileName));
        const msgCount = conv.messages.filter((m2) => m2.role !== "system").length;
        info.append(h("div", "ai-hist-meta", `${msgCount} \u6761\u6D88\u606F \xB7 ${fmtDate(conv.lastUpdated)}`));
        const del = h("button", "ai-role-action-btn danger", "\u5220\u9664");
        del.onclick = () => {
          delete state.conversations[genDocKey(conv.filePath)];
          saveData(state);
          renderHistory();
        };
        item.append(info, del);
        histPanel.append(item);
      });
    }
    const row = h("div", "ai-btn-row");
    const clearAll = h("button", "ai-btn", "\u6E05\u7A7A\u5168\u90E8");
    clearAll.onclick = () => {
      if (confirm("\u786E\u5B9A\u8981\u6E05\u7A7A\u6240\u6709\u5BF9\u8BDD\u5386\u53F2\u5417\uFF1F")) {
        state.conversations = {};
        saveData(state);
        renderHistory();
      }
    };
    const exportBtn = h("button", "ai-btn", "\u5BFC\u51FA\u5907\u4EFD");
    exportBtn.onclick = () => {
      const blob = new Blob([JSON.stringify(state.conversations, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-history-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    row.append(clearAll, exportBtn);
    histPanel.append(row);
  };
  renderHistory();
  panels.history = histPanel;
  tabNames.forEach((t) => {
    panels[t].style.display = t === activeTab ? "" : "none";
    container.append(panels[t]);
  });
}
function injectStyles() {
  const el = document.createElement("style");
  el.setAttribute("data-plugin", "ai-assistant");
  el.textContent = PLUGIN_STYLES;
  document.head.appendChild(el);
  return el;
}
var plugin = {
  state: null,
  async onload(api) {
    this.state = createState(api);
    await loadData(this.state);
    this.state._styleEl = injectStyles();
    this.state.sidebarHandle = api.registerSidebarPanel({
      id: "ai-assistant",
      title: "AI \u52A9\u624B",
      icon: "\u{1F916}",
      render: (container) => buildChatPanel(container, this.state)
    });
    this.state.settingsHandle = api.registerSettingsPanel({
      id: "ai-assistant-settings",
      title: "AI \u52A9\u624B\u8BBE\u7F6E",
      render: (container) => buildSettingsPanel(container, this.state)
    });
    this.state._externalPromptHandler = (event) => {
      const detail = event.detail || {};
      const prompt = String(detail.text || detail.prompt || "").trim();
      if (!prompt) return;
      window.dispatchEvent(new CustomEvent("hyperread:open-plugin-panel", {
        detail: { panelId: "ai-assistant" }
      }));
      if (this.state?._externalSubmitPrompt) {
        this.state._externalSubmitPrompt(prompt);
      } else {
        this.state?._externalPromptQueue.push(prompt);
      }
    };
    window.addEventListener("hyperread:ai-assistant:send", this.state._externalPromptHandler);
    api.on("document:open", (fileData) => {
      this.state.currentDocument = fileData;
    });
    api.log("AI \u52A9\u624B\u63D2\u4EF6 v2.0 \u5DF2\u52A0\u8F7D (marked \u5DF2\u6346\u7ED1)");
  },
  async onunload() {
    if (this.state) {
      await saveData(this.state);
      if (this.state._externalPromptHandler) {
        window.removeEventListener("hyperread:ai-assistant:send", this.state._externalPromptHandler);
      }
      if (this.state._styleEl?.parentNode) {
        this.state._styleEl.parentNode.removeChild(this.state._styleEl);
      }
      this.state = null;
    }
  }
};
var main_default = plugin;
export {
  main_default as default
};
