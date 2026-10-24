import { $getRoot, $isElementNode, type LexicalNode } from "lexical";
import { $isFractionNode } from "../nodes/FractionNode";
import { $isExponentNode } from "../nodes/ExponentNode";
import { $isMathExpressionNode } from "../nodes/MathExpressionNode";
import { $isRowNode } from "../nodes/RowNode";

/**
 * Documents saved before importJSON was fixed gained two empty rows at the
 * front of every fraction/exponent (one for expressions) on each reload.
 * Drop those leading empty rows so the real rows are first again.
 */
export function $repairMathRows(): void {
  const visit = (node: LexicalNode) => {
    if (!$isElementNode(node)) return;
    const expected = $isFractionNode(node) || $isExponentNode(node) ? 2 : $isMathExpressionNode(node) ? 1 : 0;
    if (expected) {
      while (node.getChildrenSize() > expected) {
        const first = node.getFirstChild();
        if (!$isRowNode(first) || first.getChildrenSize() > 0) break;
        first.remove();
      }
    }
    for (const child of node.getChildren()) visit(child);
  };
  visit($getRoot());
}
