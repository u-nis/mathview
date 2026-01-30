module.exports = {

"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/components/mathview/Logic/nodeUtils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "logNode": (()=>logNode),
    "logNodeTree": (()=>logNodeTree)
});
const indent = (str, level)=>{
    return '  '.repeat(level) + str;
};
const formatNode = (node, level = 0)=>{
    switch(node.type){
        case 'row':
            return formatRow(node, level);
        case 'symbol':
            return formatSymbol(node, level);
        case 'fraction':
            return formatFraction(node, level);
        case 'cursor':
            return formatCursor(node, level);
        default:
            return indent(`Unknown node type: ${node.type}`, level);
    }
};
const formatRow = (row, level)=>{
    const lines = [
        indent(`Row(id: ${row.id})`, level),
        indent('children:', level)
    ];
    row.children.forEach((child)=>{
        lines.push(formatNode(child, level + 1));
    });
    return lines.join('\n');
};
const formatSymbol = (symbol, level)=>{
    return indent(`Symbol(id: ${symbol.id}, value: "${symbol.value}")`, level);
};
const formatFraction = (fraction, level)=>{
    const lines = [
        indent(`Fraction(id: ${fraction.id})`, level),
        indent('numerator:', level)
    ];
    lines.push(formatNode(fraction.numerator, level + 1));
    lines.push(indent('denominator:', level));
    lines.push(formatNode(fraction.denominator, level + 1));
    return lines.join('\n');
};
const formatCursor = (cursor, level)=>{
    return indent(`Cursor(id: ${cursor.id})`, level);
};
const logNode = (node)=>{
    console.log('\nNode Structure:');
    console.log(formatNode(node));
    console.log('\n');
};
const logNodeTree = (root)=>{
    console.log('\nNode Tree:');
    console.log(formatNode(root));
    console.log('\n');
};
}}),
"[project]/components/mathview/Logic/helperFunctons.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "getAdjacentNodes": (()=>getAdjacentNodes),
    "getIndex": (()=>getIndex),
    "insertNode": (()=>insertNode),
    "moveNode": (()=>moveNode)
});
const getIndex = (node)=>{
    if (!node.parent) {
        return 0;
    }
    // Find the index of the cursor in its parent's children
    return node.parent.children.findIndex((child)=>child.id === node.id);
};
const insertNode = (node, cursor)=>{
    const index = getIndex(cursor);
    cursor.parent.children.splice(index, 0, node);
};
const getAdjacentNodes = (node)=>{
    if (!node.parent) {
        return {
            left: null,
            right: null
        };
    }
    const index = getIndex(node);
    const children = node.parent.children;
    return {
        left: index > 0 ? children[index - 1] : null,
        right: index < children.length - 1 ? children[index + 1] : null
    };
};
const moveNode = (node, newParent, index)=>{
    // Remove node from its current parent
    if (node.parent) {
        const oldChildren = node.parent.children;
        const oldIndex = oldChildren.findIndex((child)=>child.id === node.id);
        if (oldIndex !== -1) {
            oldChildren.splice(oldIndex, 1);
        }
    }
    // Set new parent
    node.parent = newParent;
    // Insert node into new parent's children at the specified index
    newParent.children.splice(index, 0, node);
};
}}),
"[project]/components/mathview/Logic/edit.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "deleteAtCursor": (()=>deleteAtCursor),
    "insertExponent": (()=>insertExponent),
    "insertFraction": (()=>insertFraction),
    "insertSymbol": (()=>insertSymbol)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/helperFunctons.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/MathEditor.tsx [app-ssr] (ecmascript)");
;
;
const insertSymbol = (input, cursor)=>{
    // TODO: Implement symbol insertion logic
    const symbolNode = {
        type: 'symbol',
        value: input,
        parent: cursor.parent,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createId"])()
    };
    console.log('Inserting symbol:', input, symbolNode.id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["insertNode"])(symbolNode, cursor);
};
const insertExponent = (input, cursor)=>{
    const baseNode = {
        type: 'row',
        children: [],
        parent: cursor.parent,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createId"])()
    };
    const raisedNode = {
        type: 'row',
        children: [],
        parent: cursor.parent,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createId"])()
    };
    const exponentNode = {
        type: 'exponent',
        base: baseNode,
        raised: raisedNode,
        parent: cursor.parent,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createId"])()
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAdjacentNodes"])(cursor).left, baseNode, 0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["insertNode"])(exponentNode, cursor);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, raisedNode, 1);
};
const insertFraction = (cursor)=>{
    // TODO: Implement fraction insertion logic
    // console.log('Left:', left)
    // console.log('Right:', right)
    const fractionNode = {
        type: 'fraction',
        numerator: null,
        denominator: null,
        parent: cursor.parent,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createId"])()
    };
    const numeratorNode = {
        type: 'row',
        children: [],
        parent: fractionNode,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createId"])()
    };
    const denominatorNode = {
        type: 'row',
        children: [],
        parent: fractionNode,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createId"])()
    };
    fractionNode.numerator = numeratorNode;
    fractionNode.denominator = denominatorNode;
    const cursorIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getIndex"])(cursor);
    let leftIndex = cursorIndex - 1;
    // Move all consecutive number nodes to the left of the cursor into the numerator node
    const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAdjacentNodes"])(cursor).left;
    if (left.type === 'symbol') {
        const siblings = cursor.parent.children;
        // Collect indices of consecutive number nodes to the left
        const numbers = [];
        while(leftIndex >= 0){
            const node = siblings[leftIndex];
            if (node.type === 'symbol' && typeof node.value === 'string' && /^[0-9]$/.test(node.value)) {
                numbers.unshift(node) // unshift to preserve order
                ;
                leftIndex--;
            } else {
                break;
            }
        }
        // Move each number node into the numerator node
        console.log('Number indices:', numbers);
        for(let i = 0; i < numbers.length; i++){
            const numberNode = numbers[i];
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(numberNode, numeratorNode, numeratorNode.children.length);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(fractionNode, cursor.parent, cursorIndex);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, denominatorNode, 0);
    } else if (left.type === 'fraction') {
        console.log('Left is a fraction');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(fractionNode, cursor.parent, cursorIndex);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(left, numeratorNode, 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, denominatorNode, 0);
    }
};
const deleteAtCursor = (cursor)=>{
    // TODO: Implement deletion logic
    console.log('Deleting at cursor');
};
}}),
"[project]/components/mathview/Logic/navigation.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "moveDown": (()=>moveDown),
    "moveLeft": (()=>moveLeft),
    "moveRight": (()=>moveRight),
    "moveUp": (()=>moveUp)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/helperFunctons.ts [app-ssr] (ecmascript)");
;
const moveLeft = (cursor, setCursor)=>{
    const currentIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getIndex"])(cursor);
    const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAdjacentNodes"])(cursor).left;
    if (currentIndex > 0) {
        if (left.type === 'fraction') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, left.numerator, left.numerator.children.length);
            setCursor({
                ...cursor
            });
        } else {
            // Move cursor one position left
            cursor.parent.children.splice(currentIndex - 1, 0, cursor);
            cursor.parent.children.splice(currentIndex + 1, 1);
            setCursor({
                ...cursor
            });
        }
    } else if (cursor.parent.id === 'root' && left === null) {
        // At the leftmost boundary of the root node
        const event = new CustomEvent('math-navigate-left', {
            detail: {
                nodeKey: window.currentMathNodeKey
            }
        });
        document.dispatchEvent(event);
    } else if (cursor.parent.parent.type === 'fraction') {
        const fracindex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getIndex"])(cursor.parent.parent);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, cursor.parent.parent.parent, fracindex - 1);
        setCursor({
            ...cursor
        });
    }
};
const moveRight = (cursor, setCursor)=>{
    const currentIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getIndex"])(cursor);
    const right = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAdjacentNodes"])(cursor).right;
    if (currentIndex < cursor.parent.children.length - 1) {
        if (right.type === 'fraction') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, right.numerator, 0);
            setCursor({
                ...cursor
            });
        } else {
            // Move cursor one position right
            cursor.parent.children.splice(currentIndex + 2, 0, cursor);
            cursor.parent.children.splice(currentIndex, 1);
            setCursor({
                ...cursor
            });
        }
    }
    if (cursor.parent.id === 'root' && right === null) {
        console.log("RIGHT IS NULL");
        // At the rightmost boundary of the root node
        const event = new CustomEvent('math-navigate-right', {
            detail: {
                nodeKey: window.currentMathNodeKey
            }
        });
        document.dispatchEvent(event);
    } else if (cursor.parent.parent.type === 'fraction') {
        const fracindex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getIndex"])(cursor.parent.parent);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, cursor.parent.parent.parent, fracindex + 1);
        setCursor({
            ...cursor
        });
    }
};
const moveUp = (cursor, setCursor)=>{
    // TODO: Implement vertical navigation
    console.log('Move up');
};
const moveDown = (cursor, setCursor)=>{
    // TODO: Implement vertical navigation
    console.log('Move down');
};
}}),
"[project]/components/mathview/Logic/handleInput.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "handleInput": (()=>handleInput)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$nodeUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/nodeUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$edit$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/edit.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/navigation.ts [app-ssr] (ecmascript)");
;
;
;
const handleInput = (input, cursor, setCursor)=>{
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$nodeUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logNodeTree"])(cursor.root);
    // Handle arrow keys
    if (input === 'ArrowLeft') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveLeft"])(cursor, setCursor);
        return;
    }
    if (input === 'ArrowRight') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveRight"])(cursor, setCursor);
        return;
    }
    if (input === 'ArrowUp') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveUp"])(cursor, setCursor);
        return;
    }
    if (input === 'ArrowDown') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveDown"])(cursor, setCursor);
        return;
    }
    // Handle other inputs
    if ([
        '+',
        '-',
        '*'
    ].includes(input) || /^[0-9]$/.test(input)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$edit$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["insertSymbol"])(input, cursor);
        // Force a re-render by creating a new cursor object
        setCursor({
            ...cursor
        });
    } else if (input === '/') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$edit$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["insertFraction"])(cursor);
        setCursor({
            ...cursor
        });
    } else if (input === '^') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$edit$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["insertExponent"])(input, cursor);
        setCursor({
            ...cursor
        });
    }
};
}}),
"[project]/components/mathview/MathInput.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$handleInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/handleInput.ts [app-ssr] (ecmascript)");
;
;
;
const MathInput = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ cursor, setCursor, onFocus, onBlur }, ref)=>{
    const handleKeyDown = (e)=>{
        if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('key', e.key);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$handleInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleInput"])(e.key, cursor, setCursor);
        } else if (e.key.length === 1) {
            console.log('key', e.key);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$handleInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleInput"])(e.key, cursor, setCursor);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: "w-full h-full outline-none",
        tabIndex: 0,
        role: "textbox",
        "aria-label": "Math input",
        onKeyDown: handleKeyDown,
        onFocus: onFocus,
        onBlur: onBlur
    }, void 0, false, {
        fileName: "[project]/components/mathview/MathInput.tsx",
        lineNumber: 26,
        columnNumber: 9
    }, this);
});
MathInput.displayName = 'MathInput';
const __TURBOPACK__default__export__ = MathInput;
}}),
"[project]/components/mathview/Render/MathRender.module.css [app-ssr] (css module)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v({
  "absoluteCursor": "MathRender-module__1683Gq__absoluteCursor",
  "anchor": "MathRender-module__1683Gq__anchor",
  "binaryOperator": "MathRender-module__1683Gq__binaryOperator",
  "blink": "MathRender-module__1683Gq__blink",
  "content": "MathRender-module__1683Gq__content",
  "cursor": "MathRender-module__1683Gq__cursor",
  "denominator": "MathRender-module__1683Gq__denominator",
  "empty": "MathRender-module__1683Gq__empty",
  "exponent": "MathRender-module__1683Gq__exponent",
  "exponentContent": "MathRender-module__1683Gq__exponentContent",
  "fraction": "MathRender-module__1683Gq__fraction",
  "nonLeaf": "MathRender-module__1683Gq__nonLeaf",
  "numerator": "MathRender-module__1683Gq__numerator",
  "rootBlock": "MathRender-module__1683Gq__rootBlock",
  "symbol": "MathRender-module__1683Gq__symbol",
});
}}),
"[project]/components/mathview/Render/MathRender.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>MathRender)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/mathview/Render/MathRender.module.css [app-ssr] (css module)");
;
;
;
const ZWSP = '\u200B';
function isBinaryOperatorChar(char) {
    if (char.length !== 1) return false;
    const isDigit = /[0-9]/.test(char);
    const isOperator = /[+\-*/=<>]/.test(char);
    return isOperator && !isDigit;
}
function SymbolNode({ node, color }) {
    const displayValue = node.value === '*' ? '·' : node.value === '-' ? '−' : node.value;
    const binary = isBinaryOperatorChar(node.value);
    const className = [
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].symbol,
        binary ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].binaryOperator : ''
    ].filter(Boolean).join(' ');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        "data-symbol": node.value,
        style: {
            color
        },
        children: displayValue
    }, node.id, false, {
        fileName: "[project]/components/mathview/Render/MathRender.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
function RowNode({ node, renderChild }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].row,
        children: node.children.map(renderChild)
    }, node.id, false, {
        fileName: "[project]/components/mathview/Render/MathRender.tsx",
        lineNumber: 33,
        columnNumber: 10
    }, this);
}
function FractionNode({ node, renderChild }) {
    const className = [
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fraction,
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].nonLeaf
    ].join(' ');
    const numeratorEmpty = !node.numerator.children || node.numerator.children.length === 0;
    const denominatorEmpty = !node.denominator.children || node.denominator.children.length === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].numerator,
                children: [
                    renderChild(node.numerator),
                    numeratorEmpty ? ZWSP : ''
                ]
            }, void 0, true, {
                fileName: "[project]/components/mathview/Render/MathRender.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].denominator,
                children: [
                    renderChild(node.denominator),
                    denominatorEmpty ? ZWSP : ''
                ]
            }, void 0, true, {
                fileName: "[project]/components/mathview/Render/MathRender.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    display: 'inline-block',
                    width: 0
                },
                children: ZWSP
            }, void 0, false, {
                fileName: "[project]/components/mathview/Render/MathRender.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, node.id, true, {
        fileName: "[project]/components/mathview/Render/MathRender.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
function ExponentNode({ node, renderChild }) {
    const className = [
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].exponent,
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].nonLeaf
    ].join(' ');
    const raisedEmpty = !node.raised.children || node.raised.children.length === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        children: [
            renderChild(node.base),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].exponentContent,
                children: [
                    renderChild(node.raised),
                    raisedEmpty ? ZWSP : ''
                ]
            }, void 0, true, {
                fileName: "[project]/components/mathview/Render/MathRender.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, node.id, true, {
        fileName: "[project]/components/mathview/Render/MathRender.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
function Caret({ node, color, blinkHidden }) {
    const isFirst = !!node.parent && node.parent.children.length > 0 && node.parent.children[0] === node;
    const className = [
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].cursor,
        blinkHidden ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].blink : ''
    ].filter(Boolean).join(' ');
    if (isFirst) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    "aria-hidden": "true",
                    style: {
                        display: 'inline-block',
                        width: 0,
                        paddingLeft: '1px',
                        marginLeft: '-1px',
                        height: 0
                    }
                }, void 0, false, {
                    fileName: "[project]/components/mathview/Render/MathRender.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: className,
                    style: {
                        borderLeftColor: color
                    },
                    children: ZWSP
                }, void 0, false, {
                    fileName: "[project]/components/mathview/Render/MathRender.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        style: {
            borderLeftColor: color
        },
        children: ZWSP
    }, void 0, false, {
        fileName: "[project]/components/mathview/Render/MathRender.tsx",
        lineNumber: 85,
        columnNumber: 10
    }, this);
}
function MathRender({ cursor, config, showCursor = true, nodeKey }) {
    const [blinkHidden, setBlinkHidden] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const anchorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const contentRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [reservedWidthPx, setReservedWidthPx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const mergedConfig = {
        fontFamily: 'Times New Roman, serif',
        fontSize: '16px',
        fontColor: '#000000',
        backgroundColor: 'transparent',
        cursorColor: '#000000',
        ...config
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const intervalId = setInterval(()=>setBlinkHidden((prev)=>!prev), 500);
        return ()=>clearInterval(intervalId);
    }, []);
    const rootNode = cursor ? cursor.root : null;
    const isEmptyRoot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!rootNode || rootNode.type !== 'row') return true;
        return rootNode.children.filter((c)=>c.type !== 'cursor').length === 0;
    }, [
        rootNode
    ]);
    const rootClassName = [
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].rootBlock,
        isEmptyRoot ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].empty : ''
    ].filter(Boolean).join(' ');
    const renderChild = (child)=>{
        switch(child.type){
            case 'symbol':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SymbolNode, {
                    node: child,
                    color: mergedConfig.fontColor
                }, child.id, false, {
                    fileName: "[project]/components/mathview/Render/MathRender.tsx",
                    lineNumber: 119,
                    columnNumber: 16
                }, this);
            case 'row':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RowNode, {
                    node: child,
                    renderChild: renderChild
                }, child.id, false, {
                    fileName: "[project]/components/mathview/Render/MathRender.tsx",
                    lineNumber: 121,
                    columnNumber: 16
                }, this);
            case 'fraction':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FractionNode, {
                    node: child,
                    renderChild: renderChild
                }, child.id, false, {
                    fileName: "[project]/components/mathview/Render/MathRender.tsx",
                    lineNumber: 123,
                    columnNumber: 16
                }, this);
            case 'exponent':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ExponentNode, {
                    node: child,
                    renderChild: renderChild
                }, child.id, false, {
                    fileName: "[project]/components/mathview/Render/MathRender.tsx",
                    lineNumber: 125,
                    columnNumber: 16
                }, this);
            case 'cursor':
                if (!showCursor) return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Caret, {
                    node: child,
                    color: mergedConfig.cursorColor,
                    blinkHidden: blinkHidden
                }, child.id, false, {
                    fileName: "[project]/components/mathview/Render/MathRender.tsx",
                    lineNumber: 128,
                    columnNumber: 16
                }, this);
            default:
                return null;
        }
    };
    // Measure content size and reserve width while pushing only the following line(s) down
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const anchorEl = anchorRef.current;
        const contentEl = contentRef.current;
        if (!anchorEl || !contentEl) return;
        const recompute = ()=>{
            const rect = contentEl.getBoundingClientRect();
            const width = Math.ceil(rect.width);
            const height = Math.ceil(rect.height);
            setReservedWidthPx(width);
            const paragraph = anchorEl.closest('p');
            let extra = height;
            let lineHeightPx = 0;
            if (paragraph) {
                const cs = window.getComputedStyle(paragraph);
                if (cs.lineHeight === 'normal') {
                    const fontSizePx = parseFloat(cs.fontSize || '15');
                    lineHeightPx = Math.round(fontSizePx * 1.2);
                } else {
                    lineHeightPx = parseFloat(cs.lineHeight);
                }
                if (!Number.isNaN(lineHeightPx) && lineHeightPx > 0) {
                    extra = Math.max(0, height - lineHeightPx);
                }
            }
            anchorEl.dataset.mathExtra = String(extra);
            if (paragraph) {
                const anchors = paragraph.querySelectorAll('[data-math-extra]');
                let maxExtra = 0;
                anchors.forEach((a)=>{
                    const v = Number(a.dataset.mathExtra || '0');
                    if (!Number.isNaN(v)) maxExtra = Math.max(maxExtra, v);
                });
                paragraph.style.paddingBottom = maxExtra > 0 ? `${Math.ceil(maxExtra)}px` : '';
            }
            // Shift rendered math up by one line height to correct the visual baseline offset
            if (lineHeightPx > 0) {
                contentEl.style.top = `-${Math.ceil(lineHeightPx)}px`;
            } else {
                contentEl.style.top = '0px';
            }
            // Notify Lexical layer about overflow so it can split and insert spacer
            if (nodeKey) {
                document.dispatchEvent(new CustomEvent('math-overflow', {
                    detail: {
                        nodeKey,
                        extraPx: extra
                    }
                }));
            }
        };
        const ro = new ResizeObserver(()=>recompute());
        ro.observe(contentEl);
        recompute();
        return ()=>{
            ro.disconnect();
            delete anchorEl.dataset.mathExtra;
            const paragraph = anchorEl.closest('p');
            if (paragraph) {
                const anchors = paragraph.querySelectorAll('[data-math-extra]');
                let maxExtra = 0;
                anchors.forEach((a)=>{
                    const v = Number(a.dataset.mathExtra || '0');
                    if (!Number.isNaN(v)) maxExtra = Math.max(maxExtra, v);
                });
                paragraph.style.paddingBottom = maxExtra > 0 ? `${Math.ceil(maxExtra)}px` : '';
            }
        };
    }, [
        mergedConfig.fontFamily,
        mergedConfig.fontSize,
        rootNode
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: anchorRef,
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].anchor,
        "aria-hidden": "true",
        style: {
            width: reservedWidthPx ? `${reservedWidthPx}px` : undefined
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            ref: contentRef,
            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].content,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: rootClassName,
                children: [
                    rootNode ? renderChild(rootNode) : ZWSP,
                    isEmptyRoot ? ZWSP : ''
                ]
            }, void 0, true, {
                fileName: "[project]/components/mathview/Render/MathRender.tsx",
                lineNumber: 215,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/mathview/Render/MathRender.tsx",
            lineNumber: 214,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/mathview/Render/MathRender.tsx",
        lineNumber: 208,
        columnNumber: 5
    }, this);
}
}}),
"[project]/components/mathview/MathEditor.module.css [app-ssr] (css module)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v({
  "container": "MathEditor-module___d-iqW__container",
});
}}),
"[project]/components/mathview/MathEditor.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "createId": (()=>createId),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/MathInput.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Render/MathRender.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$handleInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/handleInput.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/Logic/helperFunctons.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/mathview/MathEditor.module.css [app-ssr] (css module)");
"use client";
;
;
;
;
;
;
;
let id = 0;
const createId = ()=>{
    id++;
    return id.toString();
};
const MathEditor = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ config = {}, nodeKey }, ref)=>{
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [cursor, setCursor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isFocused, setIsFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    console.log('MathEditor rendering, cursor:', cursor);
    // Default configuration
    const defaultConfig = {
        fontFamily: 'Times New Roman, serif',
        fontSize: '20px',
        fontColor: '#000000',
        backgroundColor: 'transparent',
        cursorColor: '#000000',
        ...config
    };
    // Initialize root and cursor synchronously
    if (!rootRef.current) {
        console.log('MathEditor initializing...');
        const root = {
            id: "root",
            type: 'row',
            children: [],
            parent: null
        };
        rootRef.current = root;
        const newCursor = {
            id: "cursor",
            type: 'cursor',
            parent: root,
            root: root
        };
        setCursor(newCursor);
        root.children = [
            newCursor
        ];
        console.log('MathEditor initialized with cursor:', newCursor);
    }
    // Expose API methods via useImperativeHandle
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>({
            insert: (symbol)=>{
                if (cursor) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$handleInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleInput"])(symbol, cursor, setCursor);
                }
            },
            focus: ()=>{
                inputRef.current?.focus();
            },
            setCursorToStart: ()=>{
                if (cursor && rootRef.current) {
                    // Move cursor to the beginning of the root (index 0)
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, rootRef.current, 0);
                    setCursor({
                        ...cursor
                    });
                    inputRef.current?.focus();
                }
            },
            setCursorToEnd: ()=>{
                if (cursor && rootRef.current) {
                    // Move cursor to the end of the root (after all children)
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Logic$2f$helperFunctons$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moveNode"])(cursor, rootRef.current, rootRef.current.children.length);
                    setCursor({
                        ...cursor
                    });
                    inputRef.current?.focus();
                }
            }
        }), [
        cursor
    ]);
    const handleContainerMouseDown = (e)=>{
        e.preventDefault();
        inputRef.current?.focus();
    };
    const handleFocus = ()=>{
        setIsFocused(true);
        if (nodeKey) {
            window.currentMathNodeKey = nodeKey;
        }
    };
    const handleBlur = ()=>{
        setIsFocused(false);
    };
    const containerStyle = {
        fontFamily: defaultConfig.fontFamily,
        fontSize: defaultConfig.fontSize,
        color: defaultConfig.fontColor,
        backgroundColor: defaultConfig.backgroundColor
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wrapper,
        style: containerStyle,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].container,
            onMouseDown: handleContainerMouseDown,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$Render$2f$MathRender$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    cursor: cursor,
                    config: defaultConfig,
                    showCursor: isFocused,
                    nodeKey: nodeKey
                }, void 0, false, {
                    fileName: "[project]/components/mathview/MathEditor.tsx",
                    lineNumber: 126,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    cursor: cursor,
                    setCursor: setCursor,
                    ref: inputRef,
                    onFocus: handleFocus,
                    onBlur: handleBlur
                }, void 0, false, {
                    fileName: "[project]/components/mathview/MathEditor.tsx",
                    lineNumber: 127,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/mathview/MathEditor.tsx",
            lineNumber: 122,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/mathview/MathEditor.tsx",
        lineNumber: 121,
        columnNumber: 9
    }, this);
});
MathEditor.displayName = 'MathEditor';
const __TURBOPACK__default__export__ = MathEditor;
}}),
"[project]/components/Editor/plugins/UndoRedo.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>UndoRedo)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
;
;
;
;
function UndoRedo() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const onUndo = ()=>{
        editor.dispatchCommand(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UNDO_COMMAND"], undefined);
    };
    const onRedo = ()=>{
        editor.dispatchCommand(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REDO_COMMAND"], undefined);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: onUndo,
                children: "←"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/UndoRedo.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: onRedo,
                children: "→"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/UndoRedo.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}}),
"[project]/components/Editor/plugins/BlockType.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TextFormat)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$rich$2d$text$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$rich$2d$text$2f$LexicalRichText$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+rich-text@0.33.1/node_modules/@lexical/rich-text/LexicalRichText.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+selection@0.33.1/node_modules/@lexical/selection/LexicalSelection.dev.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
function TextFormat() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const [isDropdownOpen, setIsDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFormat, setSelectedFormat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Normal Text');
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const onHeadingClick = (tag)=>{
        editor.update(()=>{
            const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$setBlocksType"])(selection, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$rich$2d$text$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$rich$2d$text$2f$LexicalRichText$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createHeadingNode"])(tag));
            }
        });
    };
    const onNormalTextClick = ()=>{
        editor.update(()=>{
            const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$setBlocksType"])(selection, ()=>null);
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative'
        },
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsDropdownOpen(!isDropdownOpen),
                className: "dropdown",
                children: [
                    selectedFormat,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '12px'
                        },
                        children: "▼"
                    }, void 0, false, {
                        fileName: "[project]/components/Editor/plugins/BlockType.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Editor/plugins/BlockType.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            isDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    minWidth: '120px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        style: {
                            padding: '8px',
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'black',
                            borderBottom: '1px solid #eee'
                        },
                        onClick: ()=>{
                            onNormalTextClick();
                            setSelectedFormat('Normal Text');
                            setIsDropdownOpen(false);
                        },
                        children: "Normal Text"
                    }, void 0, false, {
                        fileName: "[project]/components/Editor/plugins/BlockType.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this),
                    [
                        'Header 1',
                        'Header 2',
                        'Header 3'
                    ].map((text, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            style: {
                                padding: '8px',
                                width: '100%',
                                textAlign: 'left',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'black',
                                borderBottom: index < 2 ? '1px solid #eee' : 'none'
                            },
                            onClick: ()=>{
                                onHeadingClick(`h${index + 1}`);
                                setSelectedFormat(text);
                                setIsDropdownOpen(false);
                            },
                            children: text
                        }, text, false, {
                            fileName: "[project]/components/Editor/plugins/BlockType.tsx",
                            lineNumber: 89,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Editor/plugins/BlockType.tsx",
                lineNumber: 55,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Editor/plugins/BlockType.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}}),
"[project]/components/Editor/plugins/Font.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Font)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+selection@0.33.1/node_modules/@lexical/selection/LexicalSelection.dev.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
function Font() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const [isFontDropdownOpen, setIsFontDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFont, setSelectedFont] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Arial');
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsFontDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const onFont = (font)=>{
        editor.update(()=>{
            const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$patchStyleText"])(selection, {
                    'font-family': font
                });
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative'
        },
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsFontDropdownOpen(!isFontDropdownOpen),
                className: "dropdown",
                children: [
                    selectedFont,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '12px'
                        },
                        children: "▼"
                    }, void 0, false, {
                        fileName: "[project]/components/Editor/plugins/Font.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Editor/plugins/Font.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this),
            isFontDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    minWidth: '120px'
                },
                children: [
                    {
                        text: 'Arial',
                        action: ()=>{
                            onFont('Arial');
                            setSelectedFont('Arial');
                        }
                    },
                    {
                        text: 'Verdana',
                        action: ()=>{
                            onFont('Verdana');
                            setSelectedFont('Verdana');
                        }
                    },
                    {
                        text: 'Times New Roman',
                        action: ()=>{
                            onFont('Times New Roman');
                            setSelectedFont('Times New Roman');
                        }
                    },
                    {
                        text: 'Courier New',
                        action: ()=>{
                            onFont('Courier New');
                            setSelectedFont('Courier New');
                        }
                    }
                ].map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        style: {
                            padding: '8px',
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'black',
                            borderBottom: index < 3 ? '1px solid #eee' : 'none'
                        },
                        onClick: ()=>{
                            item.action();
                            setIsFontDropdownOpen(false);
                        },
                        children: item.text
                    }, item.text, false, {
                        fileName: "[project]/components/Editor/plugins/Font.tsx",
                        lineNumber: 65,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/Font.tsx",
                lineNumber: 45,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Editor/plugins/Font.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
}}),
"[project]/components/Editor/plugins/FontSize.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>FontSize)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+selection@0.33.1/node_modules/@lexical/selection/LexicalSelection.dev.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
// Constants
const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 72;
const DEFAULT_FONT_SIZE = 12;
const DRAG_SENSITIVITY = 5;
const EDGE_WIDTH = 8;
function FontSize() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const [fontSize, setFontSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_FONT_SIZE);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_FONT_SIZE.toString());
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dragStart, setDragStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        size: 0
    });
    const [cursorPosition, setCursorPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [selectionStart, setSelectionStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [selectionEnd, setSelectionEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [scrollOffset, setScrollOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const measureRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Update font size in editor
    const updateFontSize = (size)=>{
        const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
        setFontSize(clampedSize);
        setInputValue(clampedSize.toString());
        editor.update(()=>{
            const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$patchStyleText"])(selection, {
                    'font-size': `${clampedSize}px`
                });
            }
        });
    };
    // Handle dragging
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isDragging) return;
        const handleMouseMove = (e)=>{
            const deltaX = e.clientX - dragStart.x;
            const deltaSize = Math.round(deltaX / DRAG_SENSITIVITY);
            const newSize = dragStart.size + deltaSize;
            updateFontSize(newSize);
        };
        const handleMouseUp = ()=>{
            setIsDragging(false);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return ()=>{
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [
        isDragging,
        dragStart,
        editor
    ]);
    // Handle click outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (e)=>{
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsEditing(false);
                setSelectionStart(0);
                setSelectionEnd(0);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Get text width using measurement span
    const getTextWidth = (text)=>{
        if (!measureRef.current) return 0;
        measureRef.current.textContent = text;
        return measureRef.current.offsetWidth;
    };
    // Get cursor position from click
    const getCursorFromClick = (clickX)=>{
        let bestPosition = 0;
        let minDistance = Infinity;
        for(let i = 0; i <= inputValue.length; i++){
            const textWidth = getTextWidth(inputValue.slice(0, i));
            const distance = Math.abs(clickX - textWidth);
            if (distance < minDistance) {
                minDistance = distance;
                bestPosition = i;
            }
        }
        return bestPosition;
    };
    // Handle scrolling to keep cursor visible
    const updateScroll = ()=>{
        const containerWidth = 40 - 16; // 40px width - 16px padding
        const cursorX = getTextWidth(inputValue.slice(0, cursorPosition));
        const visibleStart = scrollOffset;
        const visibleEnd = scrollOffset + containerWidth;
        if (cursorX < visibleStart) {
            setScrollOffset(Math.max(0, cursorX - 5));
        } else if (cursorX > visibleEnd) {
            setScrollOffset(cursorX - containerWidth + 5);
        }
    };
    // Update scroll when cursor moves
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isEditing) {
            updateScroll();
        }
    }, [
        cursorPosition,
        inputValue,
        isEditing
    ]);
    // Handle keyboard input
    const handleKeyDown = (e)=>{
        if (!isEditing) return;
        e.stopPropagation();
        e.preventDefault();
        const hasSelection = selectionStart !== selectionEnd;
        switch(e.key){
            case 'Enter':
                const newSize = parseInt(inputValue) || DEFAULT_FONT_SIZE;
                updateFontSize(newSize);
                setIsEditing(false);
                setSelectionStart(0);
                setSelectionEnd(0);
                containerRef.current?.blur();
                break;
            case 'Escape':
                setInputValue(fontSize.toString());
                setIsEditing(false);
                setSelectionStart(0);
                setSelectionEnd(0);
                setCursorPosition(0);
                setScrollOffset(0);
                containerRef.current?.blur();
                break;
            case 'Backspace':
                if (hasSelection) {
                    const start = Math.min(selectionStart, selectionEnd);
                    const end = Math.max(selectionStart, selectionEnd);
                    const newValue = inputValue.slice(0, start) + inputValue.slice(end);
                    setInputValue(newValue);
                    setCursorPosition(start);
                    setSelectionStart(start);
                    setSelectionEnd(start);
                } else if (cursorPosition > 0) {
                    const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition);
                    setInputValue(newValue);
                    setCursorPosition(cursorPosition - 1);
                }
                break;
            case 'Delete':
                if (hasSelection) {
                    const start = Math.min(selectionStart, selectionEnd);
                    const end = Math.max(selectionStart, selectionEnd);
                    const newValue = inputValue.slice(0, start) + inputValue.slice(end);
                    setInputValue(newValue);
                    setCursorPosition(start);
                    setSelectionStart(start);
                    setSelectionEnd(start);
                } else if (cursorPosition < inputValue.length) {
                    const newValue = inputValue.slice(0, cursorPosition) + inputValue.slice(cursorPosition + 1);
                    setInputValue(newValue);
                }
                break;
            case 'ArrowLeft':
                if (e.shiftKey) {
                    const newPos = Math.max(0, cursorPosition - 1);
                    setCursorPosition(newPos);
                    setSelectionEnd(newPos);
                } else {
                    const newPos = hasSelection ? Math.min(selectionStart, selectionEnd) : Math.max(0, cursorPosition - 1);
                    setCursorPosition(newPos);
                    setSelectionStart(newPos);
                    setSelectionEnd(newPos);
                }
                break;
            case 'ArrowRight':
                if (e.shiftKey) {
                    const newPos = Math.min(inputValue.length, cursorPosition + 1);
                    setCursorPosition(newPos);
                    setSelectionEnd(newPos);
                } else {
                    const newPos = hasSelection ? Math.max(selectionStart, selectionEnd) : Math.min(inputValue.length, cursorPosition + 1);
                    setCursorPosition(newPos);
                    setSelectionStart(newPos);
                    setSelectionEnd(newPos);
                }
                break;
            case 'Home':
                if (e.shiftKey) {
                    setCursorPosition(0);
                    setSelectionEnd(0);
                } else {
                    setCursorPosition(0);
                    setSelectionStart(0);
                    setSelectionEnd(0);
                }
                break;
            case 'End':
                if (e.shiftKey) {
                    setCursorPosition(inputValue.length);
                    setSelectionEnd(inputValue.length);
                } else {
                    setCursorPosition(inputValue.length);
                    setSelectionStart(inputValue.length);
                    setSelectionEnd(inputValue.length);
                }
                break;
            case 'a':
                if (e.ctrlKey || e.metaKey) {
                    setSelectionStart(0);
                    setSelectionEnd(inputValue.length);
                    setCursorPosition(inputValue.length);
                }
                break;
            default:
                if (e.key >= '0' && e.key <= '9') {
                    let newValue;
                    let newCursorPos;
                    if (hasSelection) {
                        const start = Math.min(selectionStart, selectionEnd);
                        const end = Math.max(selectionStart, selectionEnd);
                        newValue = inputValue.slice(0, start) + e.key + inputValue.slice(end);
                        newCursorPos = start + 1;
                    } else {
                        newValue = inputValue.slice(0, cursorPosition) + e.key + inputValue.slice(cursorPosition);
                        newCursorPos = cursorPosition + 1;
                    }
                    setInputValue(newValue);
                    setCursorPosition(newCursorPos);
                    setSelectionStart(newCursorPos);
                    setSelectionEnd(newCursorPos);
                }
        }
    };
    // Handle mouse events
    const handleMouseDown = (e)=>{
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x <= EDGE_WIDTH || x >= rect.width - EDGE_WIDTH) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX,
                size: fontSize
            });
            return;
        }
        const wasEditing = isEditing;
        setIsEditing(true);
        containerRef.current?.focus();
        if (!wasEditing) {
            // First click from outside - select all
            setSelectionStart(0);
            setSelectionEnd(inputValue.length);
            setCursorPosition(inputValue.length);
        } else {
            // Already editing - position cursor at click location
            const clickX = x - 8 + scrollOffset; // Account for padding and scroll
            const position = getCursorFromClick(clickX);
            setCursorPosition(position);
            setSelectionStart(position);
            setSelectionEnd(position);
        }
    };
    // Handle double-click to select all
    const handleDoubleClick = (e)=>{
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        // Don't handle double-click on drag edges
        if (x <= EDGE_WIDTH || x >= rect.width - EDGE_WIDTH) {
            return;
        }
        setSelectionStart(0);
        setSelectionEnd(inputValue.length);
        setCursorPosition(inputValue.length);
    };
    // Keep cursor in bounds
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const maxPos = inputValue.length;
        setCursorPosition((prev)=>Math.max(0, Math.min(maxPos, prev)));
        setSelectionStart((prev)=>Math.max(0, Math.min(maxPos, prev)));
        setSelectionEnd((prev)=>Math.max(0, Math.min(maxPos, prev)));
    }, [
        inputValue
    ]);
    // Render text with selection highlighting
    const renderText = ()=>{
        if (!isEditing) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: inputValue
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                lineNumber: 321,
                columnNumber: 14
            }, this);
        }
        const hasSelection = selectionStart !== selectionEnd;
        if (!hasSelection) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: inputValue
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                lineNumber: 326,
                columnNumber: 14
            }, this);
        }
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: inputValue.slice(0, start)
                }, void 0, false, {
                    fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        backgroundColor: '#0066cc',
                        color: 'white'
                    },
                    children: inputValue.slice(start, end)
                }, void 0, false, {
                    fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                    lineNumber: 335,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: inputValue.slice(end)
                }, void 0, false, {
                    fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                    lineNumber: 338,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    };
    const containerStyles = {
        cursor: isDragging ? 'ew-resize' : 'text'
    };
    const textContainerStyles = {
        position: 'relative',
        transform: `translateX(-${scrollOffset}px)`,
        padding: '0 8px',
        whiteSpace: 'nowrap',
        minWidth: '100%'
    };
    const cursorStyles = {
        position: 'absolute',
        left: `${8 + getTextWidth(inputValue.slice(0, cursorPosition)) - scrollOffset}px`,
        top: '5px',
        width: '1px',
        height: '14px',
        backgroundColor: 'black',
        animation: isEditing && selectionStart === selectionEnd ? 'blink 1s infinite' : 'none',
        display: isEditing && selectionStart === selectionEnd ? 'block' : 'none'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                lineNumber: 368,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "button",
                        onClick: ()=>updateFontSize(fontSize - 1),
                        children: "-"
                    }, void 0, false, {
                        fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                        lineNumber: 379,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: containerRef,
                        tabIndex: 0,
                        onKeyDown: handleKeyDown,
                        onMouseDown: handleMouseDown,
                        onDoubleClick: handleDoubleClick,
                        onMouseMove: (e)=>{
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const onEdge = x <= EDGE_WIDTH || x >= rect.width - EDGE_WIDTH;
                            e.currentTarget.style.cursor = isDragging ? 'ew-resize' : onEdge ? 'ew-resize' : 'text';
                        },
                        className: "font-size-input-container",
                        style: containerStyles,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: textContainerStyles,
                                children: renderText()
                            }, void 0, false, {
                                fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                                lineNumber: 402,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: cursorStyles
                            }, void 0, false, {
                                fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                                lineNumber: 405,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                ref: measureRef,
                                style: {
                                    position: 'absolute',
                                    left: '-9999px',
                                    fontSize: '16px',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                                lineNumber: 408,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                        lineNumber: 387,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "button",
                        onClick: ()=>updateFontSize(fontSize + 1),
                        children: "+"
                    }, void 0, false, {
                        fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                        lineNumber: 421,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Editor/plugins/FontSize.tsx",
                lineNumber: 377,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}}),
"[project]/components/Editor/plugins/TextFormatting.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TextFormatting)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
;
;
;
;
function TextFormatting() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const applyFormat = (format)=>{
        editor.dispatchCommand(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FORMAT_TEXT_COMMAND"], format);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            gap: '2px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: ()=>applyFormat('bold'),
                children: "B"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/TextFormatting.tsx",
                lineNumber: 19,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: ()=>applyFormat('italic'),
                children: "I"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/TextFormatting.tsx",
                lineNumber: 20,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: ()=>applyFormat('underline'),
                children: "U"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/TextFormatting.tsx",
                lineNumber: 21,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: ()=>applyFormat('strikethrough'),
                children: "S"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/TextFormatting.tsx",
                lineNumber: 22,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Editor/plugins/TextFormatting.tsx",
        lineNumber: 18,
        columnNumber: 9
    }, this);
}
}}),
"[project]/components/Editor/plugins/TextColor.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TextColor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$colorful$40$5$2e$6$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$react$2d$colorful$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-colorful@5.6.1_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/react-colorful/dist/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
;
function TextColor() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const [isColorPickerOpen, setIsColorPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedColor, setSelectedColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('#000000');
    const colorPickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setIsColorPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const onTextColor = (color)=>{
        editor.update(()=>{
            const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
                $patchStyleText(selection, {
                    color
                });
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: ()=>setIsColorPickerOpen(!isColorPickerOpen),
                children: "A"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/TextColor.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this),
            isColorPickerOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: colorPickerRef,
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    padding: '8px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$colorful$40$5$2e$6$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$react$2d$colorful$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HexColorPicker"], {
                    color: selectedColor,
                    onChange: (color)=>{
                        setSelectedColor(color);
                        onTextColor(color);
                    }
                }, void 0, false, {
                    fileName: "[project]/components/Editor/plugins/TextColor.tsx",
                    lineNumber: 40,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/TextColor.tsx",
                lineNumber: 39,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Editor/plugins/TextColor.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
}}),
"[project]/components/Editor/plugins/Highlight.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Highlight)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+selection@0.33.1/node_modules/@lexical/selection/LexicalSelection.dev.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$colorful$40$5$2e$6$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$react$2d$colorful$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-colorful@5.6.1_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/react-colorful/dist/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
function Highlight() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const [isColorPickerOpen, setIsColorPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedColor, setSelectedColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('#ffffff');
    const colorPickerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setIsColorPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const onHighlight = (color)=>{
        editor.update(()=>{
            const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$patchStyleText"])(selection, {
                    'background-color': color
                });
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                onClick: ()=>setIsColorPickerOpen(!isColorPickerOpen),
                children: "H"
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/Highlight.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this),
            isColorPickerOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: colorPickerRef,
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    padding: '8px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$colorful$40$5$2e$6$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$react$2d$colorful$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HexColorPicker"], {
                    color: selectedColor,
                    onChange: (color)=>{
                        setSelectedColor(color);
                        onHighlight(color);
                    }
                }, void 0, false, {
                    fileName: "[project]/components/Editor/plugins/Highlight.tsx",
                    lineNumber: 41,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/Highlight.tsx",
                lineNumber: 40,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Editor/plugins/Highlight.tsx",
        lineNumber: 37,
        columnNumber: 9
    }, this);
}
}}),
"[project]/components/Editor/plugins/List.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>List)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$list$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$list$2f$LexicalList$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+list@0.33.1/node_modules/@lexical/list/LexicalList.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
;
;
;
function List() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const [isListDropdownOpen, setIsListDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedList, setSelectedList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('None');
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsListDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const onListClick = (tag)=>{
        if (tag === 'number') {
            editor.dispatchCommand(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$list$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$list$2f$LexicalList$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INSERT_ORDERED_LIST_COMMAND"], undefined);
        } else {
            editor.dispatchCommand(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$list$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$list$2f$LexicalList$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INSERT_UNORDERED_LIST_COMMAND"], undefined);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative'
        },
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsListDropdownOpen(!isListDropdownOpen),
                className: "dropdown",
                children: [
                    selectedList,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '12px'
                        },
                        children: "▼"
                    }, void 0, false, {
                        fileName: "[project]/components/Editor/plugins/List.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Editor/plugins/List.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this),
            isListDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    minWidth: '120px'
                },
                children: [
                    {
                        text: 'None',
                        action: ()=>setSelectedList('None')
                    },
                    {
                        text: 'Bullet List',
                        action: ()=>{
                            onListClick('bullet');
                            setSelectedList('Bullet List');
                            setIsListDropdownOpen(false);
                        }
                    },
                    {
                        text: 'Numbered List',
                        action: ()=>{
                            onListClick('number');
                            setSelectedList('Numbered List');
                            setIsListDropdownOpen(false);
                        }
                    }
                ].map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        style: {
                            padding: '8px',
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'black',
                            borderBottom: index < 2 ? '1px solid #eee' : 'none'
                        },
                        onClick: ()=>{
                            item.action();
                            setIsListDropdownOpen(false);
                        },
                        children: item.text
                    }, item.text, false, {
                        fileName: "[project]/components/Editor/plugins/List.tsx",
                        lineNumber: 62,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/Editor/plugins/List.tsx",
                lineNumber: 43,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Editor/plugins/List.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
}}),
"[project]/components/Editor/plugins/BannerPlugin.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "$createBannerNode": (()=>$createBannerNode),
    "$isBannerNode": (()=>$isBannerNode),
    "BannerNode": (()=>BannerNode),
    "BannerPlugin": (()=>BannerPlugin),
    "INSERT_BANNER_COMMAND": (()=>INSERT_BANNER_COMMAND)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+selection@0.33.1/node_modules/@lexical/selection/LexicalSelection.dev.mjs [app-ssr] (ecmascript) <locals>");
;
;
;
class BannerNode extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ElementNode"] {
    static getType() {
        return 'banner';
    }
    static clone(node) {
        return new BannerNode(node.__key);
    }
    createDOM(config) {
        const element = document.createElement('div');
        element.className = config.theme.banner;
        return element;
    }
    updateDOM(prevNode, dom) {
        return false;
    }
    collapseAtStart() {
        const paragraph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createParagraphNode"])();
        const children = this.getChildren();
        children.forEach((child)=>paragraph.append(child));
        this.replace(paragraph);
        return true;
    }
}
function $createBannerNode() {
    return new BannerNode();
}
function $isBannerNode(node) {
    return node instanceof BannerNode;
}
const INSERT_BANNER_COMMAND = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createCommand"])('insertBanner');
function BannerPlugin() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    if (!editor.hasNodes([
        BannerNode
    ])) {
        throw new Error('BannerPlugin: BannerNode is not registered on the editor');
    }
    editor.registerCommand(INSERT_BANNER_COMMAND, ()=>{
        const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$selection$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$selection$2f$LexicalSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["$setBlocksType"])(selection, $createBannerNode);
        }
        return true;
    }, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMMAND_PRIORITY_LOW"]);
    return null;
}
}}),
"[project]/components/Editor/ToolBar.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Toolbar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$UndoRedo$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/UndoRedo.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$BlockType$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/BlockType.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$Font$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/Font.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$FontSize$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/FontSize.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$TextFormatting$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/TextFormatting.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$TextColor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/TextColor.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$Highlight$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/Highlight.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$List$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/List.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$BannerPlugin$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/BannerPlugin.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
function BannertoolbarPlugin() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const onClick = (e)=>{
        editor.dispatchCommand(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$BannerPlugin$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INSERT_BANNER_COMMAND"], undefined);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: "button",
        onClick: onClick,
        children: "Banner"
    }, void 0, false, {
        fileName: "[project]/components/Editor/ToolBar.tsx",
        lineNumber: 22,
        columnNumber: 9
    }, this);
}
function Toolbar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "toolbar",
        style: {
            backgroundColor: 'white',
            display: 'flex',
            gap: '0.5rem',
            padding: '8px',
            borderBottom: '1px solid #eee'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$UndoRedo$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 29,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$BlockType$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 30,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$Font$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 31,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$FontSize$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 32,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$TextFormatting$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 33,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$TextColor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 34,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$Highlight$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$List$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 37,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BannertoolbarPlugin, {}, void 0, false, {
                fileName: "[project]/components/Editor/ToolBar.tsx",
                lineNumber: 38,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Editor/ToolBar.tsx",
        lineNumber: 28,
        columnNumber: 9
    }, this);
}
}}),
"[project]/components/Editor/plugins/SpacerNode.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "$createSpacerNode": (()=>$createSpacerNode),
    "$isSpacerNode": (()=>$isSpacerNode),
    "SpacerNode": (()=>SpacerNode)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
;
;
class SpacerNode extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DecoratorNode"] {
    __height;
    __mathKey;
    static getType() {
        return 'math-spacer';
    }
    static clone(node) {
        return new SpacerNode(node.__height, node.__mathKey, node.__key);
    }
    static importJSON(serializedNode) {
        const node = new SpacerNode(serializedNode.height, serializedNode.mathKey);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            height: this.__height,
            mathKey: this.__mathKey,
            type: SpacerNode.getType(),
            version: 1
        };
    }
    constructor(height, mathKey, key){
        super(key);
        this.__height = height;
        this.__mathKey = mathKey;
    }
    setHeight(next) {
        const writable = this.getWritable();
        writable.__height = next;
    }
    getHeight() {
        return this.getLatest().__height;
    }
    getMathKey() {
        return this.getLatest().__mathKey;
    }
    createDOM() {
        const el = document.createElement('div');
        el.setAttribute('data-lexical-math-spacer', 'true');
        el.setAttribute('data-for', this.__mathKey);
        el.style.height = `${Math.max(0, Math.round(this.__height))}px`;
        el.style.display = 'block';
        el.style.width = '100%';
        el.style.pointerEvents = 'none';
        el.style.lineHeight = '0';
        return el;
    }
    updateDOM(dom) {
        dom.setAttribute('data-for', this.__mathKey);
        dom.style.height = `${Math.max(0, Math.round(this.__height))}px`;
        return false;
    }
    decorate() {
        // DOM is enough; no React needed
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {}, void 0, false);
    }
}
function $createSpacerNode(height, mathKey) {
    return new SpacerNode(height, mathKey);
}
function $isSpacerNode(node) {
    return node instanceof SpacerNode;
}
}}),
"[project]/components/Editor/plugins/MathNode.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "$createMathNode": (()=>$createMathNode),
    "$isMathNode": (()=>$isMathNode),
    "INSERT_MATH_COMMAND": (()=>INSERT_MATH_COMMAND),
    "MathNode": (()=>MathNode),
    "MathNodePlugin": (()=>MathNodePlugin),
    "deleteMathString": (()=>deleteMathString),
    "getMathEditorAPI": (()=>getMathEditorAPI)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mathview/MathEditor.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$useLexicalNodeSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/useLexicalNodeSelection.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$SpacerNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/SpacerNode.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
let initMathString = "";
class MathNode extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DecoratorNode"] {
    static getType() {
        return 'math';
    }
    static clone(node) {
        return new MathNode(node.__key);
    }
    static importJSON(serializedNode) {
        return new MathNode();
    }
    constructor(key){
        super(key);
    }
    exportJSON() {
        return {
            ...super.exportJSON()
        };
    }
    createDOM() {
        const element = document.createElement('div');
        element.className = 'math-node-container';
        element.style.display = 'inline-block';
        element.style.verticalAlign = 'bottom';
        return element;
    }
    updateDOM() {
        return false;
    }
    decorate() {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MathNodeComponent, {
            nodeKey: this.__key
        }, void 0, false, {
            fileName: "[project]/components/Editor/plugins/MathNode.tsx",
            lineNumber: 50,
            columnNumber: 12
        }, this);
    }
}
// React component wrapper for the MathEditor
function MathNodeComponent({ nodeKey }) {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    const mathEditorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hasInsertedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [isSelected, setSelected, clearSelection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$useLexicalNodeSelection$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalNodeSelection"])(nodeKey);
    // Effect to handle selection changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isSelected) {
            console.log('MathNode SELECTED via useLexicalNodeSelection');
            if (mathEditorRef.current) {
                mathEditorRef.current.focus();
            }
        }
    }, [
        isSelected
    ]);
    // Listen for measured overflow from MathRender and restructure the document using a spacer paragraph
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handler = (event)=>{
            const detail = event.detail;
            if (!detail || detail.nodeKey !== nodeKey) return;
            const extra = Math.max(0, Math.round(detail.extraPx || 0));
            editor.update(()=>{
                const mathNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getNodeByKey"])(nodeKey);
                if (!mathNode) return;
                const parent = mathNode.getParent();
                if (!parent) return;
                // We operate at the paragraph level
                const paragraph = parent;
                const afterParent = paragraph.getNextSibling();
                // Helper to detect spacer paragraph right after current paragraph
                const isSpacerParagraphForThisMath = (node)=>{
                    if (!node || node.getType?.() !== 'paragraph') return false;
                    const firstChild = node.getFirstChild();
                    return !!firstChild && (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$SpacerNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isSpacerNode"])(firstChild) && firstChild.getMathKey() === nodeKey;
                };
                if (extra > 0) {
                    // Ensure spacer paragraph exists and has correct height
                    if (!isSpacerParagraphForThisMath(afterParent)) {
                        // Create a new paragraph to hold spacer
                        const spacerPara = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createParagraphNode"])();
                        const spacer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$SpacerNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createSpacerNode"])(extra, nodeKey);
                        spacerPara.append(spacer);
                        // Move following siblings of the current paragraph into a new paragraph
                        const newPara = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createParagraphNode"])();
                        while(paragraph.getNextSibling()){
                            const sib = paragraph.getNextSibling();
                            if (!sib) break;
                            newPara.append(sib);
                        }
                        // Insert spacer and the new content paragraph after the current paragraph
                        paragraph.insertAfter(spacerPara);
                        spacerPara.insertAfter(newPara);
                    } else {
                        // Update existing spacer height
                        const spacerPara = afterParent;
                        const spacer = spacerPara.getFirstChild();
                        if (spacer && (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$SpacerNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isSpacerNode"])(spacer)) {
                            spacer.setHeight(extra);
                        }
                    }
                } else {
                    // Remove spacer paragraph and merge content back
                    if (isSpacerParagraphForThisMath(afterParent)) {
                        const spacerPara = afterParent;
                        const contentPara = spacerPara.getNextSibling();
                        // Remove spacer paragraph
                        spacerPara.remove();
                        // Move content back into current paragraph and remove the extra paragraph
                        if (contentPara && contentPara.getType?.() === 'paragraph') {
                            while(contentPara.getFirstChild()){
                                const child = contentPara.getFirstChild();
                                if (!child) break;
                                paragraph.append(child);
                            }
                            contentPara.remove();
                        }
                    }
                }
            });
        };
        document.addEventListener('math-overflow', handler);
        return ()=>document.removeEventListener('math-overflow', handler);
    }, [
        editor,
        nodeKey
    ]);
    // Effect to listen for math navigation events
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleMathNavigation = (event)=>{
            const detail = event.detail;
            if (!detail || detail.nodeKey !== nodeKey) return;
            const isLeft = event.type === 'math-navigate-left';
            const isRight = event.type === 'math-navigate-right';
            if (!isLeft && !isRight) return;
            editor.update(()=>{
                const node = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getNodeByKey"])(nodeKey);
                if (!node) return;
                const parent = node.getParent();
                if (!parent) return;
                const indexWithinParent = node.getIndexWithinParent();
                const offset = isLeft ? indexWithinParent : indexWithinParent + 1;
                const range = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createRangeSelection"])();
                range.anchor.set(parent.getKey(), offset, 'element');
                range.focus.set(parent.getKey(), offset, 'element');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$setSelection"])(range);
            });
        };
        document.addEventListener('math-navigate-left', handleMathNavigation);
        document.addEventListener('math-navigate-right', handleMathNavigation);
        return ()=>{
            document.removeEventListener('math-navigate-left', handleMathNavigation);
            document.removeEventListener('math-navigate-right', handleMathNavigation);
        };
    }, [
        editor,
        nodeKey
    ]);
    // Effect to insert the detected math string when the component mounts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log('MathNodeComponent effect running, initMathString:', initMathString, 'mathEditorRef.current:', mathEditorRef.current);
        if (initMathString && mathEditorRef.current && !hasInsertedRef.current) {
            // Insert each character from the detected math string
            for(let i = 0; i < initMathString.length; i++){
                console.log('Inserting character:', initMathString[i]);
                mathEditorRef.current.insert(initMathString[i]);
            }
            hasInsertedRef.current = true;
            console.log('Insertion completed, hasInserted set to true');
        }
        // Always focus the MathEditor when component mounts
        setTimeout(()=>{
            console.log('Attempting to focus MathEditor, ref available:', mathEditorRef.current);
            if (mathEditorRef.current) {
                mathEditorRef.current.focus();
                console.log('Focus called on MathEditor');
            }
        }, 50);
    }, []);
    const handleClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        editor.update(()=>{
            const nodeSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createNodeSelection"])();
            nodeSelection.add(nodeKey);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$setSelection"])(nodeSelection);
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-lexical-math-editor": true,
        onClick: handleClick,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mathview$2f$MathEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            ref: mathEditorRef,
            nodeKey: nodeKey
        }, void 0, false, {
            fileName: "[project]/components/Editor/plugins/MathNode.tsx",
            lineNumber: 222,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Editor/plugins/MathNode.tsx",
        lineNumber: 218,
        columnNumber: 5
    }, this);
}
function getMathEditorAPI(nodeKey) {
    return null; // No longer needed
}
function $createMathNode() {
    return new MathNode();
}
function $isMathNode(node) {
    return node instanceof MathNode;
}
const INSERT_MATH_COMMAND = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createCommand"])('insertMath');
function MathNodePlugin() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    if (!editor.hasNodes([
        MathNode
    ])) {
        throw new Error('MathNodePlugin: MathNode is not registered on the editor');
    }
    editor.registerCommand(INSERT_MATH_COMMAND, (payload)=>{
        // If replace string is provided, delete it from Lexical first
        if (payload?.replace) {
            deleteMathString(editor, payload.replace);
        }
        editor.update(()=>{
            const mathNode = $createMathNode();
            const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
            if (selection) {
                selection.insertNodes([
                    mathNode
                ]);
                // Set the global variable for the MathNodeComponent to use
                if (payload?.replace) {
                    initMathString = payload.replace;
                }
                // Clear the selection in the Lexical editor
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$setSelection"])(null);
            }
        });
        return true;
    }, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMMAND_PRIORITY_LOW"]);
    return null;
}
function deleteMathString(editor, replace) {
    editor.update(()=>{
        const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getSelection"])();
        if (selection && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$isRangeSelection"])(selection)) {
            const anchor = selection.anchor;
            const focus = selection.focus;
            // Ensure we don't go out of bounds
            const startOffset = Math.max(0, anchor.offset - replace.length);
            // Create a selection that starts 'replace.length' characters behind the current position
            const newSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$createRangeSelection"])();
            newSelection.anchor.set(anchor.key, startOffset, anchor.type);
            newSelection.focus.set(focus.key, focus.offset, focus.type);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$setSelection"])(newSelection);
            // Delete the selected content
            newSelection.removeText();
        }
    });
}
}}),
"[project]/components/Editor/plugins/MathParser.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "MathParserPlugin": (()=>MathParserPlugin)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lexical@0.33.1/node_modules/lexical/Lexical.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$MathNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/MathNode.tsx [app-ssr] (ecmascript)");
;
;
;
;
function MathParserPlugin() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const registerUpdateListener = editor.registerUpdateListener(({ editorState })=>{
            editorState.read(()=>{
                const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lexical$40$0$2e$33$2e$1$2f$node_modules$2f$lexical$2f$Lexical$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["$getRoot"])();
                const text = root.getTextContent();
                // Regex pattern for incomplete mathematical expressions
                // Matches: numbers/variables + operators (incomplete expressions)
                // Examples: a+, 6^, f=, 2+, etc.
                const mathRegex = /([a-zA-Z0-9]+[\+\-\*\/\^=])(?=\s|$)/g;
                const matches = text.match(mathRegex);
                if (matches && matches.length > 0) {
                    console.log('Math detected:', matches);
                    // Trigger the command to insert MathNode with the detected math text
                    editor.dispatchCommand(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$MathNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INSERT_MATH_COMMAND"], {
                        replace: matches[0]
                    });
                }
            });
        });
        return registerUpdateListener;
    }, [
        editor
    ]);
    return null;
}
}}),
"[project]/components/Editor/Editor.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Editor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.3_react-dom@19.1.0_react@19.1.0__react@19.1.0_sass@1.89.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposer$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposer.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalRichTextPlugin$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalRichTextPlugin.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalContentEditable$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalContentEditable.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalHistoryPlugin$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalHistoryPlugin.dev.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalErrorBoundary$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalErrorBoundary.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$rich$2d$text$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$rich$2d$text$2f$LexicalRichText$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+rich-text@0.33.1/node_modules/@lexical/rich-text/LexicalRichText.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalListPlugin$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalListPlugin.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$list$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$list$2f$LexicalList$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+list@0.33.1/node_modules/@lexical/list/LexicalList.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$ToolBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/ToolBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$BannerPlugin$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/BannerPlugin.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$MathParser$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/MathParser.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalTreeView$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalTreeView.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@lexical+react@0.33.1_react-dom@19.1.0_react@19.1.0__react@19.1.0_yjs@13.6.27/node_modules/@lexical/react/LexicalComposerContext.dev.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$MathNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/MathNode.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$SpacerNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Editor/plugins/SpacerNode.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const theme = {
    heading: {
        h1: 'text-2xl font-bold',
        h2: 'text-xl font-bold',
        h3: 'text-lg font-bold'
    },
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline'
    },
    list: {
        ol: 'list-decimal pl-5',
        ul: 'list-disc pl-5'
    },
    banner: 'bg-blue-500 text-white p-2 rounded-md'
};
function onError(error) {
    console.error(error);
}
function TreeViewWrapper() {
    const [editor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposerContext$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLexicalComposerContext"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalTreeView$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TreeView"], {
        editor: editor
    }, void 0, false, {
        fileName: "[project]/components/Editor/Editor.tsx",
        lineNumber: 46,
        columnNumber: 10
    }, this);
}
function Editor() {
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
        nodes: [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$rich$2d$text$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$rich$2d$text$2f$LexicalRichText$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HeadingNode"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$list$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$list$2f$LexicalList$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ListNode"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$list$40$0$2e$33$2e$1$2f$node_modules$2f40$lexical$2f$list$2f$LexicalList$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ListItemNode"],
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$BannerPlugin$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BannerNode"],
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$MathNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathNode"],
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$SpacerNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SpacerNode"]
        ]
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalComposer$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LexicalComposer"], {
        initialConfig: initialConfig,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'flex-start'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$MathParser$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathParserPlugin"], {}, void 0, false, {
                    fileName: "[project]/components/Editor/Editor.tsx",
                    lineNumber: 60,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$MathNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathNodePlugin"], {}, void 0, false, {
                    fileName: "[project]/components/Editor/Editor.tsx",
                    lineNumber: 61,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "editor-container",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$ToolBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/components/Editor/Editor.tsx",
                            lineNumber: 64,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalListPlugin$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ListPlugin"], {}, void 0, false, {
                            fileName: "[project]/components/Editor/Editor.tsx",
                            lineNumber: 65,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalHistoryPlugin$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HistoryPlugin"], {}, void 0, false, {
                            fileName: "[project]/components/Editor/Editor.tsx",
                            lineNumber: 66,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Editor$2f$plugins$2f$BannerPlugin$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BannerPlugin"], {}, void 0, false, {
                            fileName: "[project]/components/Editor/Editor.tsx",
                            lineNumber: 67,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalRichTextPlugin$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RichTextPlugin"], {
                            contentEditable: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalContentEditable$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ContentEditable"], {
                                className: "editor-input"
                            }, void 0, false, {
                                fileName: "[project]/components/Editor/Editor.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, void 0),
                            placeholder: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: "Enter some text..."
                            }, void 0, false, {
                                fileName: "[project]/components/Editor/Editor.tsx",
                                lineNumber: 74,
                                columnNumber: 24
                            }, void 0),
                            ErrorBoundary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$lexical$2b$react$40$0$2e$33$2e$1_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_yjs$40$13$2e$6$2e$27$2f$node_modules$2f40$lexical$2f$react$2f$LexicalErrorBoundary$2e$dev$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LexicalErrorBoundary"]
                        }, void 0, false, {
                            fileName: "[project]/components/Editor/Editor.tsx",
                            lineNumber: 68,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Editor/Editor.tsx",
                    lineNumber: 63,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_sass$40$1$2e$89$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TreeViewWrapper, {}, void 0, false, {
                    fileName: "[project]/components/Editor/Editor.tsx",
                    lineNumber: 78,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Editor/Editor.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Editor/Editor.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__fe355f87._.js.map