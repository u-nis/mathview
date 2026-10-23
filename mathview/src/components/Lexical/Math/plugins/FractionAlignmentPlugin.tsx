import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function FractionAlignmentPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const updateFractions = () => {
      const fractions = root.querySelectorAll('[data-lexical-math="fraction"]');
      fractions.forEach((el) => {
        const dom = el as HTMLElement;
        const depth = Math.min(getFractionDepth(dom), 3);
        dom.dataset.mathLevel = String(depth);
      });
    };

    updateFractions();
    const mutationObserver = new MutationObserver(updateFractions);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => mutationObserver.disconnect();
  }, [editor]);

  return null;
}

function getFractionDepth(dom: HTMLElement): number {
  let depth = 0;
  let parent = dom.parentElement;
  while (parent) {
    if (parent.dataset.lexicalMath === "fraction") depth++;
    if (parent.dataset.lexicalMath === "expression") break;
    parent = parent.parentElement;
  }
  return depth;
}
