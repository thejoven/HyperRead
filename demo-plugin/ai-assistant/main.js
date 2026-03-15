// AI Assistant Plugin v2.0 — built with esbuild + marked


// ../../node_modules/marked/lib/marked.esm.js
function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}
var noopTest = { exec: () => null };
function edit(regex, opt = "") {
  let source = typeof regex === "string" ? regex : regex.source;
  const obj = {
    replace: (name, val) => {
      let valSource = typeof val === "string" ? val : val.source;
      valSource = valSource.replace(other.caret, "$1");
      source = source.replace(name, valSource);
      return obj;
    },
    getRegex: () => {
      return new RegExp(source, opt);
    }
  };
  return obj;
}
var other = {
  codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
  outputLinkReplace: /\\([\[\]])/g,
  indentCodeCompensation: /^(\s+)(?:```)/,
  beginningSpace: /^\s+/,
  endingHash: /#$/,
  startingSpaceChar: /^ /,
  endingSpaceChar: / $/,
  nonSpaceChar: /[^ ]/,
  newLineCharGlobal: /\n/g,
  tabCharGlobal: /\t/g,
  multipleSpaceGlobal: /\s+/g,
  blankLine: /^[ \t]*$/,
  doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
  blockquoteStart: /^ {0,3}>/,
  blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
  blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
  listReplaceTabs: /^\t+/,
  listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
  listIsTask: /^\[[ xX]\] /,
  listReplaceTask: /^\[[ xX]\] +/,
  anyLine: /\n.*\n/,
  hrefBrackets: /^<(.*)>$/,
  tableDelimiter: /[:|]/,
  tableAlignChars: /^\||\| *$/g,
  tableRowBlankLine: /\n[ \t]*$/,
  tableAlignRight: /^ *-+: *$/,
  tableAlignCenter: /^ *:-+: *$/,
  tableAlignLeft: /^ *:-+ *$/,
  startATag: /^<a /i,
  endATag: /^<\/a>/i,
  startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
  endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
  startAngleBracket: /^</,
  endAngleBracket: />$/,
  pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
  unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
  escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
  unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
  caret: /(^|[^\[])\^/g,
  percentDecode: /%25/g,
  findPipe: /\|/g,
  splitPipe: / \|/,
  slashPipe: /\\\|/g,
  carriageReturn: /\r\n|\r/g,
  spaceLine: /^ +$/gm,
  notSpaceStart: /^\S*/,
  endingNewline: /\n$/,
  listItemRegex: (bull) => new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`),
  htmlBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, "i")
};
var newline = /^(?:[ \t]*(?:\n|$))+/;
var blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var bullet = /(?:[*+-]|\d{1,9}[.)])/;
var lheadingCore = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var lheading = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var lheadingGfm = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var blockText = /^[^\n]+/;
var _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
var def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _blockLabel).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, bullet).getRegex();
var _tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var html = edit(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", _comment).replace("tag", _tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var paragraph = edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", paragraph).getRegex();
var blockNormal = {
  blockquote,
  code: blockCode,
  def,
  fences,
  heading,
  hr,
  html,
  lheading,
  list,
  newline,
  paragraph,
  table: noopTest,
  text: blockText
};
var gfmTable = edit(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockGfm = {
  ...blockNormal,
  lheading: lheadingGfm,
  table: gfmTable,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", gfmTable).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex()
};
var blockPedantic = {
  ...blockNormal,
  html: edit(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", _comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", lheading).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
};
var escape = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var br = /^( {2,}|\\)\n(?!\s*$)/;
var inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var _punctuation = /[\p{P}\p{S}]/u;
var _punctuationOrSpace = /[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpace = /[^\s\p{P}\p{S}]/u;
var punctuation = edit(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, _punctuationOrSpace).getRegex();
var _punctuationGfmStrongEm = /(?!~)[\p{P}\p{S}]/u;
var _punctuationOrSpaceGfmStrongEm = /(?!~)[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpaceGfmStrongEm = /(?:[^\s\p{P}\p{S}]|~)/u;
var blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
var emStrongLDelimCore = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var emStrongLDelim = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuation).getRegex();
var emStrongLDelimGfm = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimAstCore = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var emStrongRDelimAst = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var emStrongRDelimAstGfm = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpaceGfmStrongEm).replace(/punctSpace/g, _punctuationOrSpaceGfmStrongEm).replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimUnd = edit(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var anyPunctuation = edit(/\\(punct)/, "gu").replace(/punct/g, _punctuation).getRegex();
var autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var _inlineComment = edit(_comment).replace("(?:-->|$)", "-->").getRegex();
var tag = edit(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", _inlineComment).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
var link = edit(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", _inlineLabel).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var reflink = edit(/^!?\[(label)\]\[(ref)\]/).replace("label", _inlineLabel).replace("ref", _blockLabel).getRegex();
var nolink = edit(/^!?\[(ref)\](?:\[\])?/).replace("ref", _blockLabel).getRegex();
var reflinkSearch = edit("reflink|nolink(?!\\()", "g").replace("reflink", reflink).replace("nolink", nolink).getRegex();
var inlineNormal = {
  _backpedal: noopTest,
  // only used for GFM url
  anyPunctuation,
  autolink,
  blockSkip,
  br,
  code: inlineCode,
  del: noopTest,
  emStrongLDelim,
  emStrongRDelimAst,
  emStrongRDelimUnd,
  escape,
  link,
  nolink,
  punctuation,
  reflink,
  reflinkSearch,
  tag,
  text: inlineText,
  url: noopTest
};
var inlinePedantic = {
  ...inlineNormal,
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", _inlineLabel).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", _inlineLabel).getRegex()
};
var inlineGfm = {
  ...inlineNormal,
  emStrongRDelimAst: emStrongRDelimAstGfm,
  emStrongLDelim: emStrongLDelimGfm,
  url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
var inlineBreaks = {
  ...inlineGfm,
  br: edit(br).replace("{2,}", "*").getRegex(),
  text: edit(inlineGfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};
var block = {
  normal: blockNormal,
  gfm: blockGfm,
  pedantic: blockPedantic
};
var inline = {
  normal: inlineNormal,
  gfm: inlineGfm,
  breaks: inlineBreaks,
  pedantic: inlinePedantic
};
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape2(html2, encode) {
  if (encode) {
    if (other.escapeTest.test(html2)) {
      return html2.replace(other.escapeReplace, getEscapeReplacement);
    }
  } else {
    if (other.escapeTestNoEncode.test(html2)) {
      return html2.replace(other.escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html2;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(other.percentDecode, "%");
  } catch {
    return null;
  }
  return href;
}
function splitCells(tableRow, count) {
  const row = tableRow.replace(other.findPipe, (match, offset, str) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\") escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(other.splitPipe);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells.at(-1)?.trim()) {
    cells.pop();
  }
  if (count) {
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) cells.push("");
    }
  }
  for (; i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(other.slashPipe, "|");
  }
  return cells;
}
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  if (level > 0) {
    return -2;
  }
  return -1;
}
function outputLink(cap, link2, raw, lexer2, rules) {
  const href = link2.href;
  const title = link2.title || null;
  const text = cap[1].replace(rules.other.outputLinkReplace, "$1");
  lexer2.state.inLink = true;
  const token = {
    type: cap[0].charAt(0) === "!" ? "image" : "link",
    raw,
    href,
    title,
    text,
    tokens: lexer2.inlineTokens(text)
  };
  lexer2.state.inLink = false;
  return token;
}
function indentCodeCompensation(raw, text, rules) {
  const matchIndentToCode = raw.match(rules.other.indentCodeCompensation);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split("\n").map((node) => {
    const matchIndentInNode = node.match(rules.other.beginningSpace);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join("\n");
}
var _Tokenizer = class {
  options;
  rules;
  // set by the lexer
  lexer;
  // set by the lexer
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, "\n") : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "", this.rules);
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (this.rules.other.endingHash.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || this.rules.other.endingSpaceChar.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: rtrim(cap[0], "\n")
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      let lines = rtrim(cap[0], "\n").split("\n");
      let raw = "";
      let text = "";
      const tokens = [];
      while (lines.length > 0) {
        let inBlockquote = false;
        const currentLines = [];
        let i;
        for (i = 0; i < lines.length; i++) {
          if (this.rules.other.blockquoteStart.test(lines[i])) {
            currentLines.push(lines[i]);
            inBlockquote = true;
          } else if (!inBlockquote) {
            currentLines.push(lines[i]);
          } else {
            break;
          }
        }
        lines = lines.slice(i);
        const currentRaw = currentLines.join("\n");
        const currentText = currentRaw.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
        raw = raw ? `${raw}
${currentRaw}` : currentRaw;
        text = text ? `${text}
${currentText}` : currentText;
        const top = this.lexer.state.top;
        this.lexer.state.top = true;
        this.lexer.blockTokens(currentText, tokens, true);
        this.lexer.state.top = top;
        if (lines.length === 0) {
          break;
        }
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "code") {
          break;
        } else if (lastToken?.type === "blockquote") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.blockquote(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
          break;
        } else if (lastToken?.type === "list") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.list(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
          lines = newText.substring(tokens.at(-1).raw.length).split("\n");
          continue;
        }
      }
      return {
        type: "blockquote",
        raw,
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list2 = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = this.rules.other.listItemRegex(bull);
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        let raw = "";
        let itemContents = "";
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split("\n", 1)[0].replace(this.rules.other.listReplaceTabs, (t) => " ".repeat(3 * t.length));
        let nextLine = src.split("\n", 1)[0];
        let blankLine = !line.trim();
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimStart();
        } else if (blankLine) {
          indent = cap[1].length + 1;
        } else {
          indent = cap[2].search(this.rules.other.nonSpaceChar);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        if (blankLine && this.rules.other.blankLine.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = this.rules.other.nextBulletRegex(indent);
          const hrRegex = this.rules.other.hrRegex(indent);
          const fencesBeginRegex = this.rules.other.fencesBeginRegex(indent);
          const headingBeginRegex = this.rules.other.headingBeginRegex(indent);
          const htmlBeginRegex = this.rules.other.htmlBeginRegex(indent);
          while (src) {
            const rawLine = src.split("\n", 1)[0];
            let nextLineWithoutTabs;
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(this.rules.other.listReplaceNesting, "  ");
              nextLineWithoutTabs = nextLine;
            } else {
              nextLineWithoutTabs = nextLine.replace(this.rules.other.tabCharGlobal, "    ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (htmlBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(nextLine)) {
              break;
            }
            if (nextLineWithoutTabs.search(this.rules.other.nonSpaceChar) >= indent || !nextLine.trim()) {
              itemContents += "\n" + nextLineWithoutTabs.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line = nextLineWithoutTabs.slice(indent);
          }
        }
        if (!list2.loose) {
          if (endsWithBlankLine) {
            list2.loose = true;
          } else if (this.rules.other.doubleBlankLine.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = this.rules.other.listIsTask.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(this.rules.other.listReplaceTask, "");
          }
        }
        list2.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list2.raw += raw;
      }
      const lastItem = list2.items.at(-1);
      if (lastItem) {
        lastItem.raw = lastItem.raw.trimEnd();
        lastItem.text = lastItem.text.trimEnd();
      } else {
        return;
      }
      list2.raw = list2.raw.trimEnd();
      for (let i = 0; i < list2.items.length; i++) {
        this.lexer.state.top = false;
        list2.items[i].tokens = this.lexer.blockTokens(list2.items[i].text, []);
        if (!list2.loose) {
          const spacers = list2.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => this.rules.other.anyLine.test(t.raw));
          list2.loose = hasMultipleLineBreaks;
        }
      }
      if (list2.loose) {
        for (let i = 0; i < list2.items.length; i++) {
          list2.items[i].loose = true;
        }
      }
      return list2;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag2 = cap[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " ");
      const href = cap[2] ? cap[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : cap[3];
      return {
        type: "def",
        tag: tag2,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (!cap) {
      return;
    }
    if (!this.rules.other.tableDelimiter.test(cap[2])) {
      return;
    }
    const headers = splitCells(cap[1]);
    const aligns = cap[2].replace(this.rules.other.tableAlignChars, "").split("|");
    const rows = cap[3]?.trim() ? cap[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [];
    const item = {
      type: "table",
      raw: cap[0],
      header: [],
      align: [],
      rows: []
    };
    if (headers.length !== aligns.length) {
      return;
    }
    for (const align of aligns) {
      if (this.rules.other.tableAlignRight.test(align)) {
        item.align.push("right");
      } else if (this.rules.other.tableAlignCenter.test(align)) {
        item.align.push("center");
      } else if (this.rules.other.tableAlignLeft.test(align)) {
        item.align.push("left");
      } else {
        item.align.push(null);
      }
    }
    for (let i = 0; i < headers.length; i++) {
      item.header.push({
        text: headers[i],
        tokens: this.lexer.inline(headers[i]),
        header: true,
        align: item.align[i]
      });
    }
    for (const row of rows) {
      item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
        return {
          text: cell,
          tokens: this.lexer.inline(cell),
          header: false,
          align: item.align[i]
        };
      }));
    }
    return item;
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: cap[1]
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && this.rules.other.startATag.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && this.rules.other.endATag.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(trimmedUrl)) {
        if (!this.rules.other.endAngleBracket.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex === -2) {
          return;
        }
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link2 = this.rules.other.pedanticHrefTitle.exec(href);
        if (link2) {
          href = link2[1];
          title = link2[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (this.rules.other.startAngleBracket.test(href)) {
        if (this.options.pedantic && !this.rules.other.endAngleBracket.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline.anyPunctuation, "$1") : href,
        title: title ? title.replace(this.rules.inline.anyPunctuation, "$1") : title
      }, cap[0], this.lexer, this.rules);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      const linkString = (cap[2] || cap[1]).replace(this.rules.other.multipleSpaceGlobal, " ");
      const link2 = links[linkString.toLowerCase()];
      if (!link2) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link2, cap[0], this.lexer, this.rules);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrongLDelim.exec(src);
    if (!match) return;
    if (match[3] && prevChar.match(this.rules.other.unicodeAlphaNumeric)) return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim) continue;
        rLength = [...rDelim].length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0) continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const lastCharLength = [...match[0]][0].length;
        const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(this.rules.other.newLineCharGlobal, " ");
      const hasNonSpaceChars = this.rules.other.nonSpaceChar.test(text);
      const hasSpaceCharsOnBothEnds = this.rules.other.startingSpaceChar.test(text) && this.rules.other.endingSpaceChar.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[1];
        href = "mailto:" + text;
      } else {
        text = cap[1];
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[0];
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? "";
        } while (prevCapZero !== cap[0]);
        text = cap[0];
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      const escaped = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        escaped
      };
    }
  }
};
var _Lexer = class __Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options2) {
    this.tokens = [];
    this.tokens.links = /* @__PURE__ */ Object.create(null);
    this.options = options2 || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      other,
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }
  /**
   * Static Lex Method
   */
  static lex(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.lex(src);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.inlineTokens(src);
  }
  /**
   * Preprocessing
   */
  lex(src) {
    src = src.replace(other.carriageReturn, "\n");
    this.blockTokens(src, this.tokens);
    for (let i = 0; i < this.inlineQueue.length; i++) {
      const next = this.inlineQueue[i];
      this.inlineTokens(next.src, next.tokens);
    }
    this.inlineQueue = [];
    return this.tokens;
  }
  blockTokens(src, tokens = [], lastParagraphClipped = false) {
    if (this.options.pedantic) {
      src = src.replace(other.tabCharGlobal, "    ").replace(other.spaceLine, "");
    }
    while (src) {
      let token;
      if (this.options.extensions?.block?.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.raw.length === 1 && lastToken !== void 0) {
          lastToken.raw += "\n";
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.raw;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        const lastToken = tokens.at(-1);
        if (lastParagraphClipped && lastToken?.type === "paragraph") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens = []) {
    let maskedSrc = src;
    let match = null;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    let keepPrevChar = false;
    let prevChar = "";
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      let token;
      if (this.options.extensions?.inline?.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.type === "text" && lastToken?.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
};
var _Renderer = class {
  options;
  parser;
  // set by the parser
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  space(token) {
    return "";
  }
  code({ text, lang, escaped }) {
    const langString = (lang || "").match(other.notSpaceStart)?.[0];
    const code = text.replace(other.endingNewline, "") + "\n";
    if (!langString) {
      return "<pre><code>" + (escaped ? code : escape2(code, true)) + "</code></pre>\n";
    }
    return '<pre><code class="language-' + escape2(langString) + '">' + (escaped ? code : escape2(code, true)) + "</code></pre>\n";
  }
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens);
    return `<blockquote>
${body}</blockquote>
`;
  }
  html({ text }) {
    return text;
  }
  heading({ tokens, depth }) {
    return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>
`;
  }
  hr(token) {
    return "<hr>\n";
  }
  list(token) {
    const ordered = token.ordered;
    const start = token.start;
    let body = "";
    for (let j = 0; j < token.items.length; j++) {
      const item = token.items[j];
      body += this.listitem(item);
    }
    const type = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startAttr + ">\n" + body + "</" + type + ">\n";
  }
  listitem(item) {
    let itemBody = "";
    if (item.task) {
      const checkbox = this.checkbox({ checked: !!item.checked });
      if (item.loose) {
        if (item.tokens[0]?.type === "paragraph") {
          item.tokens[0].text = checkbox + " " + item.tokens[0].text;
          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
            item.tokens[0].tokens[0].text = checkbox + " " + escape2(item.tokens[0].tokens[0].text);
            item.tokens[0].tokens[0].escaped = true;
          }
        } else {
          item.tokens.unshift({
            type: "text",
            raw: checkbox + " ",
            text: checkbox + " ",
            escaped: true
          });
        }
      } else {
        itemBody += checkbox + " ";
      }
    }
    itemBody += this.parser.parse(item.tokens, !!item.loose);
    return `<li>${itemBody}</li>
`;
  }
  checkbox({ checked }) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>
`;
  }
  table(token) {
    let header = "";
    let cell = "";
    for (let j = 0; j < token.header.length; j++) {
      cell += this.tablecell(token.header[j]);
    }
    header += this.tablerow({ text: cell });
    let body = "";
    for (let j = 0; j < token.rows.length; j++) {
      const row = token.rows[j];
      cell = "";
      for (let k = 0; k < row.length; k++) {
        cell += this.tablecell(row[k]);
      }
      body += this.tablerow({ text: cell });
    }
    if (body) body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow({ text }) {
    return `<tr>
${text}</tr>
`;
  }
  tablecell(token) {
    const content = this.parser.parseInline(token.tokens);
    const type = token.header ? "th" : "td";
    const tag2 = token.align ? `<${type} align="${token.align}">` : `<${type}>`;
    return tag2 + content + `</${type}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens }) {
    return `<strong>${this.parser.parseInline(tokens)}</strong>`;
  }
  em({ tokens }) {
    return `<em>${this.parser.parseInline(tokens)}</em>`;
  }
  codespan({ text }) {
    return `<code>${escape2(text, true)}</code>`;
  }
  br(token) {
    return "<br>";
  }
  del({ tokens }) {
    return `<del>${this.parser.parseInline(tokens)}</del>`;
  }
  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + escape2(title) + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image({ href, title, text, tokens }) {
    if (tokens) {
      text = this.parser.parseInline(tokens, this.parser.textRenderer);
    }
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return escape2(text);
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${escape2(title)}"`;
    }
    out += ">";
    return out;
  }
  text(token) {
    return "tokens" in token && token.tokens ? this.parser.parseInline(token.tokens) : "escaped" in token && token.escaped ? token.text : escape2(token.text);
  }
};
var _TextRenderer = class {
  // no need for block level renderers
  strong({ text }) {
    return text;
  }
  em({ text }) {
    return text;
  }
  codespan({ text }) {
    return text;
  }
  del({ text }) {
    return text;
  }
  html({ text }) {
    return text;
  }
  text({ text }) {
    return text;
  }
  link({ text }) {
    return "" + text;
  }
  image({ text }) {
    return "" + text;
  }
  br() {
    return "";
  }
};
var _Parser = class __Parser {
  options;
  renderer;
  textRenderer;
  constructor(options2) {
    this.options = options2 || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer();
  }
  /**
   * Static Parse Method
   */
  static parse(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parse(tokens);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parseInline(tokens);
  }
  /**
   * Parse Loop
   */
  parse(tokens, top = true) {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const genericToken = anyToken;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "space": {
          out += this.renderer.space(token);
          continue;
        }
        case "hr": {
          out += this.renderer.hr(token);
          continue;
        }
        case "heading": {
          out += this.renderer.heading(token);
          continue;
        }
        case "code": {
          out += this.renderer.code(token);
          continue;
        }
        case "table": {
          out += this.renderer.table(token);
          continue;
        }
        case "blockquote": {
          out += this.renderer.blockquote(token);
          continue;
        }
        case "list": {
          out += this.renderer.list(token);
          continue;
        }
        case "html": {
          out += this.renderer.html(token);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(token);
          continue;
        }
        case "text": {
          let textToken = token;
          let body = this.renderer.text(textToken);
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += "\n" + this.renderer.text(textToken);
          }
          if (top) {
            out += this.renderer.paragraph({
              type: "paragraph",
              raw: body,
              text: body,
              tokens: [{ type: "text", raw: body, text: body, escaped: true }]
            });
          } else {
            out += body;
          }
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(tokens, renderer = this.renderer) {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(anyToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "escape": {
          out += renderer.text(token);
          break;
        }
        case "html": {
          out += renderer.html(token);
          break;
        }
        case "link": {
          out += renderer.link(token);
          break;
        }
        case "image": {
          out += renderer.image(token);
          break;
        }
        case "strong": {
          out += renderer.strong(token);
          break;
        }
        case "em": {
          out += renderer.em(token);
          break;
        }
        case "codespan": {
          out += renderer.codespan(token);
          break;
        }
        case "br": {
          out += renderer.br(token);
          break;
        }
        case "del": {
          out += renderer.del(token);
          break;
        }
        case "text": {
          out += renderer.text(token);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};
var _Hooks = class {
  options;
  block;
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  static passThroughHooks = /* @__PURE__ */ new Set([
    "preprocess",
    "postprocess",
    "processAllTokens"
  ]);
  /**
   * Process markdown before marked
   */
  preprocess(markdown) {
    return markdown;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(html2) {
    return html2;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(tokens) {
    return tokens;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? _Lexer.lex : _Lexer.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? _Parser.parse : _Parser.parseInline;
  }
};
var Marked = class {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = _Parser;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  /**
   * Run callback for every token
   */
  walkTokens(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          const tableToken = token;
          for (const cell of tableToken.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token;
          values = values.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              const tokens2 = genericToken[childTokens].flat(Infinity);
              values = values.concat(this.walkTokens(tokens2, callback));
            });
          } else if (genericToken.tokens) {
            values = values.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          if (!(prop in renderer)) {
            throw new Error(`renderer '${prop}' does not exist`);
          }
          if (["options", "parser"].includes(prop)) {
            continue;
          }
          const rendererProp = prop;
          const rendererFunc = pack.renderer[rendererProp];
          const prevRenderer = renderer[rendererProp];
          renderer[rendererProp] = (...args2) => {
            let ret = rendererFunc.apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          if (!(prop in tokenizer)) {
            throw new Error(`tokenizer '${prop}' does not exist`);
          }
          if (["options", "rules", "lexer"].includes(prop)) {
            continue;
          }
          const tokenizerProp = prop;
          const tokenizerFunc = pack.tokenizer[tokenizerProp];
          const prevTokenizer = tokenizer[tokenizerProp];
          tokenizer[tokenizerProp] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks();
        for (const prop in pack.hooks) {
          if (!(prop in hooks)) {
            throw new Error(`hook '${prop}' does not exist`);
          }
          if (["options", "block"].includes(prop)) {
            continue;
          }
          const hooksProp = prop;
          const hooksFunc = pack.hooks[hooksProp];
          const prevHook = hooks[hooksProp];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksProp] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksProp] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens2 = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(packWalktokens.call(this, token));
          if (walkTokens2) {
            values = values.concat(walkTokens2.call(this, token));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  lexer(src, options2) {
    return _Lexer.lex(src, options2 ?? this.defaults);
  }
  parser(tokens, options2) {
    return _Parser.parse(tokens, options2 ?? this.defaults);
  }
  parseMarkdown(blockType) {
    const parse2 = (src, options2) => {
      const origOpt = { ...options2 };
      const opt = { ...this.defaults, ...origOpt };
      const throwError = this.onError(!!opt.silent, !!opt.async);
      if (this.defaults.async === true && origOpt.async === false) {
        return throwError(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      }
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
        opt.hooks.block = blockType;
      }
      const lexer2 = opt.hooks ? opt.hooks.provideLexer() : blockType ? _Lexer.lex : _Lexer.lexInline;
      const parser2 = opt.hooks ? opt.hooks.provideParser() : blockType ? _Parser.parse : _Parser.parseInline;
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer2(src2, opt)).then((tokens) => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser2(tokens, opt)).then((html2) => opt.hooks ? opt.hooks.postprocess(html2) : html2).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        let tokens = lexer2(src, opt);
        if (opt.hooks) {
          tokens = opt.hooks.processAllTokens(tokens);
        }
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html2 = parser2(tokens, opt);
        if (opt.hooks) {
          html2 = opt.hooks.postprocess(html2);
        }
        return html2;
      } catch (e) {
        return throwError(e);
      }
    };
    return parse2;
  }
  onError(silent, async) {
    return (e) => {
      e.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape2(e.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e);
      }
      throw e;
    };
  }
};
var markedInstance = new Marked();
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
marked.options = marked.setOptions = function(options2) {
  markedInstance.setOptions(options2);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

// src/main.js
marked.use({
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
async function loadData(state) {
  const d = await state.api.loadData();
  state.conversations = d.conversations || {};
  state.config = { ...state.config, ...d.config || {} };
  if (state.config.apiKey && state.config.apiUrl && state.config.model) {
    state.config.isConfigured = true;
  }
  state.roles = d.roles && d.roles.length ? d.roles : defaultRoles();
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
    return conv.messages.filter((m) => m.role === "system");
  }
  return conv.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
}
function saveDocMessages(state, filePath, fileName, messages, content) {
  const key = genDocKey(filePath);
  state.conversations[key] = {
    filePath,
    fileName,
    messages: messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp).toISOString() })),
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    documentHash: content ? hashContent(content) : void 0
  };
  const entries = Object.entries(state.conversations);
  if (entries.length > 100) {
    entries.sort((a, b) => new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated));
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
    const res = await fetch(this.config.apiUrl, {
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
function h(tag2, cls, ...children) {
  const el = document.createElement(tag2);
  if (cls) el.className = cls;
  for (const c of children) {
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  }
  return el;
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d) {
  const now = /* @__PURE__ */ new Date(), dd = new Date(d);
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
        el.innerHTML = marked.parse(words.slice(0, i + 1).join(""));
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
        bubble.innerHTML = marked.parse(msg.content);
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
      questions.forEach((q) => {
        const btn = h("button", "ai-sug-btn", q);
        btn.onclick = () => {
          textarea.value = q;
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
    const display = currentMessages.filter((m) => m.role !== "system");
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
        currentMessages = [sysMsg, ...currentMessages.filter((m) => m.role !== "system")];
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
      const aiText = await svc.send(currentMessages.map((m) => ({ role: m.role, content: m.content })));
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
    const cfg = { apiKey: apiKeyInp.value, apiUrl: apiUrlInp.value, model: modelInp.value, isConfigured: true };
    if (!cfg.apiKey || !cfg.apiUrl || !cfg.model) {
      setStatus("error", "\u8BF7\u586B\u5199\u6240\u6709\u5B57\u6BB5");
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
    state.config = {
      apiKey: apiKeyInp.value.trim(),
      apiUrl: apiUrlInp.value.trim(),
      model: modelInp.value.trim(),
      isConfigured: !!(apiKeyInp.value.trim() && apiUrlInp.value.trim() && modelInp.value.trim())
    };
    saveData(state);
    setStatus("success", "\u2713 \u914D\u7F6E\u5DF2\u4FDD\u5B58");
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
    const convs = Object.values(state.conversations).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).slice(0, 50);
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
        const msgCount = conv.messages.filter((m) => m.role !== "system").length;
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
    api.on("document:open", (fileData) => {
      this.state.currentDocument = fileData;
    });
    api.log("AI \u52A9\u624B\u63D2\u4EF6 v2.0 \u5DF2\u52A0\u8F7D (marked \u5DF2\u6346\u7ED1)");
  },
  async onunload() {
    if (this.state) {
      await saveData(this.state);
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
