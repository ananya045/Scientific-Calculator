/* ============================================================
   Scientific Calculator — script.js
   A safe hand-written parser is used instead of eval() so the
   calculator can support sin/cos/tan, logs, factorial, powers,
   constants and implicit multiplication (e.g. "2π") reliably.
   ============================================================ */

const display    = document.getElementById('display');
const exprLine    = document.getElementById('expression');
const angleBtn    = document.getElementById('angleModeBtn');
const invBtn      = document.getElementById('invBtn');
const historyTag  = document.getElementById('historyTag');

let angleMode    = 'DEG';   // 'DEG' or 'RAD'
let inverseMode  = false;   // toggles sin<->asin, cos<->acos, tan<->atan
let lastAnswer   = 0;
let justEvaluated = false;  // true right after pressing '='

/* ---------- Trig / inverse label handling on .fn buttons ---------- */
const fnButtons = document.querySelectorAll('.fn');
// btn.dataset.fn already permanently stores each button's base function
// name (sin, cos, tan, log, ln, sqrt) — no extra lookup table needed.

function refreshFnLabels(){
    fnButtons.forEach(btn => {
        const base = btn.dataset.fn;
        const isTrig = ['sin','cos','tan'].includes(base);
        if (isTrig && inverseMode){
            btn.dataset.activeFn = 'a' + base;
            btn.textContent = (base.charAt(0).toUpperCase() + base.slice(1)) + '⁻¹';
        } else {
            btn.dataset.activeFn = base;
            btn.textContent = base === 'sqrt' ? '√' : base;
        }
    });
}
refreshFnLabels();

fnButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const fname = btn.dataset.activeFn || btn.dataset.fn;
        appendValue(fname + '(');
    });
});

/* ---------- Mode toggles ---------- */
function toggleAngleMode(){
    angleMode = (angleMode === 'DEG') ? 'RAD' : 'DEG';
    angleBtn.textContent = angleMode;
    angleBtn.classList.toggle('active', angleMode === 'RAD');
}

function toggleInverse(){
    inverseMode = !inverseMode;
    invBtn.classList.toggle('active', inverseMode);
    refreshFnLabels();
}

/* ---------- Basic input handling ---------- */
function appendValue(v){
    if (justEvaluated){
        // After '=', an operator continues from the result; anything
        // else (digit, function, paren, constant) starts a fresh entry.
        const isOperatorStart = ['+','−','×','÷','^','!','%'].includes(v);
        if (!isOperatorStart){
            display.value = '';
            exprLine.textContent = '\u00A0';
        }
        justEvaluated = false;
    }
    if (display.value === '0' && !isFunctionOrParenStart(v) && /[0-9.]/.test(v)){
        display.value = v;
    } else if (display.value === '0' && v !== '0'){
        display.value = v;
    } else {
        display.value += v;
    }
}

function isFunctionOrParenStart(v){
    return v.endsWith('(');
}

function cleardisplay(){
    display.value = '0';
    exprLine.textContent = '\u00A0';
    justEvaluated = false;
}

function backspace(){
    if (justEvaluated) { cleardisplay(); return; }
    display.value = display.value.slice(0, -1) || '0';
}

function usePercent(){
    appendValue('%');
}

function useAns(){
    appendValue(formatNumber(lastAnswer));
    justEvaluated = false;
}

function toggleSign(){
    const v = display.value.trim();
    if (v === '0') return;
    if (v.startsWith('-(') && v.endsWith(')')){
        display.value = v.slice(2, -1);
    } else {
        display.value = '-(' + v + ')';
    }
}

/* ============================================================
   Parser: tokenizer + recursive-descent evaluator
   Supports: + - * / ^ ! % ( ) , decimals, implicit multiplication,
   constants (π, e), and functions sin/cos/tan/asin/acos/atan/log/ln/sqrt
   ============================================================ */

function tokenize(raw){
    const expr = raw
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

    const tokens = [];
    let i = 0;
    while (i < expr.length){
        const ch = expr[i];

        if (/\s/.test(ch)){ i++; continue; }

        if (/[0-9.]/.test(ch)){
            let num = '';
            while (i < expr.length && /[0-9.]/.test(expr[i])){ num += expr[i]; i++; }
            tokens.push({ type: 'num', value: parseFloat(num) });
            continue;
        }

        if (/[a-zA-Zπ]/.test(ch)){
            let name = '';
            while (i < expr.length && /[a-zA-Zπ]/.test(expr[i])){ name += expr[i]; i++; }
            tokens.push({ type: 'id', value: name });
            continue;
        }

        if ('+-*/^!%()'.includes(ch)){
            tokens.push({ type: 'op', value: ch });
            i++;
            continue;
        }

        // Unknown character — skip it rather than crash.
        i++;
    }
    return tokens;
}

function factorial(n){
    if (n < 0 || Math.floor(n) !== n) return NaN;
    let r = 1;
    for (let k = 2; k <= n; k++) r *= k;
    return r;
}

function applyFunction(name, x){
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;

    switch (name){
        case 'sin':  return Math.sin(angleMode === 'DEG' ? toRad(x) : x);
        case 'cos':  return Math.cos(angleMode === 'DEG' ? toRad(x) : x);
        case 'tan':  return Math.tan(angleMode === 'DEG' ? toRad(x) : x);
        case 'asin': { const r = Math.asin(x); return angleMode === 'DEG' ? toDeg(r) : r; }
        case 'acos': { const r = Math.acos(x); return angleMode === 'DEG' ? toDeg(r) : r; }
        case 'atan': { const r = Math.atan(x); return angleMode === 'DEG' ? toDeg(r) : r; }
        case 'log':  return Math.log10(x);
        case 'ln':   return Math.log(x);
        case 'sqrt': return Math.sqrt(x);
        default: throw new Error('Unknown function: ' + name);
    }
}

class Parser {
    constructor(tokens){
        this.tokens = tokens;
        this.pos = 0;
    }
    peek(){ return this.tokens[this.pos]; }
    next(){ return this.tokens[this.pos++]; }
    expectOp(val){
        const t = this.next();
        if (!t || t.type !== 'op' || t.value !== val){
            throw new Error('Expected "' + val + '"');
        }
    }
    canStartPrimary(t){
        return !!t && (t.type === 'num' || t.type === 'id' || (t.type === 'op' && t.value === '('));
    }

    parseExpression(){
        let left = this.parseTerm();
        while (this.peek() && this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '-')){
            const op = this.next().value;
            const right = this.parseTerm();
            left = (op === '+') ? left + right : left - right;
        }
        return left;
    }

    parseTerm(){
        let left = this.parseUnary();
        while (true){
            const t = this.peek();
            if (t && t.type === 'op' && (t.value === '*' || t.value === '/')){
                const op = this.next().value;
                const right = this.parseUnary();
                left = (op === '*') ? left * right : left / right;
            } else if (this.canStartPrimary(t)){
                // implicit multiplication, e.g. "2π", "3(4+5)"
                const right = this.parseUnary();
                left = left * right;
            } else {
                break;
            }
        }
        return left;
    }

    parseUnary(){
        const t = this.peek();
        if (t && t.type === 'op' && t.value === '-'){
            this.next();
            return -this.parseUnary();
        }
        if (t && t.type === 'op' && t.value === '+'){
            this.next();
            return this.parseUnary();
        }
        return this.parsePower();
    }

    parsePower(){
        let base = this.parsePostfix();
        const t = this.peek();
        if (t && t.type === 'op' && t.value === '^'){
            this.next();
            const exp = this.parseUnary();
            base = Math.pow(base, exp);
        }
        return base;
    }

    parsePostfix(){
        let val = this.parsePrimary();
        while (this.peek() && this.peek().type === 'op' && (this.peek().value === '!' || this.peek().value === '%')){
            const op = this.next().value;
            val = (op === '!') ? factorial(val) : val / 100;
        }
        return val;
    }

    parsePrimary(){
        const t = this.peek();
        if (!t) throw new Error('Unexpected end of expression');

        if (t.type === 'num'){ this.next(); return t.value; }

        if (t.type === 'op' && t.value === '('){
            this.next();
            const val = this.parseExpression();
            this.expectOp(')');
            return val;
        }

        if (t.type === 'id'){
            this.next();
            const name = t.value;
            if (name === 'π') return Math.PI;
            if (name === 'e' && !(this.peek() && this.peek().type === 'op' && this.peek().value === '(')){
                return Math.E;
            }
            // function call: name(...)
            if (this.peek() && this.peek().type === 'op' && this.peek().value === '('){
                this.next();
                const arg = this.parseExpression();
                this.expectOp(')');
                return applyFunction(name, arg);
            }
            throw new Error('Unknown identifier: ' + name);
        }

        throw new Error('Unexpected token');
    }
}

function evaluateExpression(raw){
    const tokens = tokenize(raw);
    const parser = new Parser(tokens);
    const result = parser.parseExpression();
    if (parser.pos < tokens.length){
        throw new Error('Unexpected token at end of expression');
    }
    if (typeof result !== 'number' || !isFinite(result)){
        throw new Error('Math error');
    }
    return result;
}

function formatNumber(n){
    if (Object.is(n, -0)) n = 0;
    // Trim floating point noise, keep reasonable precision.
    let s = parseFloat(n.toPrecision(12)).toString();
    return s;
}

function Calculate(){
    const raw = display.value;
    try {
        const result = evaluateExpression(raw);
        exprLine.textContent = raw + ' =';
        display.value = formatNumber(result);
        lastAnswer = result;
        justEvaluated = true;
    } catch (err){
        exprLine.textContent = raw + ' =';
        display.value = 'Error';
        justEvaluated = true;
    }
}

/* ---------- Optional keyboard support ---------- */
window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/[0-9.]/.test(key)){ appendValue(key); return; }
    if (key === '+'){ appendValue('+'); return; }
    if (key === '-'){ appendValue('−'); return; }
    if (key === '*'){ appendValue('×'); return; }
    if (key === '/'){ e.preventDefault(); appendValue('÷'); return; }
    if (key === '^'){ appendValue('^'); return; }
    if (key === '('){ appendValue('('); return; }
    if (key === ')'){ appendValue(')'); return; }
    if (key === '%'){ appendValue('%'); return; }
    if (key === 'Enter' || key === '='){ e.preventDefault(); Calculate(); return; }
    if (key === 'Backspace'){ backspace(); return; }
    if (key === 'Escape'){ cleardisplay(); return; }
});