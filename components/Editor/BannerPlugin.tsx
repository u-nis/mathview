import {ElementNode} from 'lexical';
import React from 'react';

export class BannerNode extends ElementNode {
    constructor(key?: NodeKey) {
        super();
    }
    static clone(node: BannerNode):BannerNode{
        return new BannerNode(node.__key);
    }
    createDOM(config: EditorConfig): HTMLElement{
}