import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type {EditorConfig, LexicalNode, NodeKey} from 'lexical';
import {COMMAND_PRIORITY_LOW, createCommand, ElementNode, $getSelection, $isRangeSelection, $createParagraphNode} from 'lexical';
import {$setBlocksType} from '@lexical/selection';

export class BannerNode extends ElementNode {
    static getType(): string{
        return 'banner';
    }

    static clone(node: BannerNode):BannerNode{
        return new BannerNode(node.__key);
    }
    createDOM(config: EditorConfig): HTMLElement{
        const element = document.createElement('div')
        element.className = config.theme.banner;

        return element;       
    }
    updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean{
        return false;
    }
    collapseAtStart(): boolean{
        const paragraph = $createParagraphNode();
        const children = this.getChildren();
        children.forEach(child=> paragraph.append(child));
        this.replace(paragraph);
        return true;
    }
   
}
export function $createBannerNode(): BannerNode{
    return new BannerNode();
}
    

export function $isBannerNode(node: LexicalNode): node is BannerNode{
    return node instanceof BannerNode;
}

export const INSERT_BANNER_COMMAND = createCommand('insertBanner');

export function BannerPlugin(): null{
    const [editor] = useLexicalComposerContext();
    if (!editor.hasNodes([BannerNode])){
        throw new Error('BannerPlugin: BannerNode is not registered on the editor');
    }
    editor.registerCommand(INSERT_BANNER_COMMAND,() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)){
            $setBlocksType(selection, $createBannerNode);
        }
        return true;
    }, COMMAND_PRIORITY_LOW)
    return null;
}