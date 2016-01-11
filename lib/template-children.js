/**
 * @param {Blaze.Template} template
 */
Blaze.TemplateInstance.prototype._reorderChildren = function () {
    let parentRange = null;
    try {
        parentRange = this._createRange();
    } catch (e) {
        return;
    }

    let parentChildrenCopy = this._children;  // We will manipulate this, and don't want to modify original.
    let parentSortedChildren = [];
    for (let childNode of parentRange.getNodes()) {
        for (let childTemplate of parentChildrenCopy) {
            let childRange = null;
            try {
                 childRange = childTemplate._createRange();
            } catch (e) {
                continue;
            }
            if (childRange.containsNode(childNode)) {
                parentSortedChildren.push(childTemplate);
                parentChildrenCopy.splice(parentChildrenCopy.indexOf(childTemplate), 1);
                break;
            }
        }
    }

    this._setChildren(parentSortedChildren);
};

/**
 * Starts the Template mutation summary. Create's one if it doesn't exist.
 *
 * TODO: This seems to have a lot of possibility. Imagine having a reactive data source in here.
 * @private
 */
Blaze.TemplateInstance.prototype._startMutationSummary = function() {
    // Find the nearest parent that include both first and last node of this template.
    let commonParent = $(this.firstNode).parents().has(this.lastNode).first().get(0);
    if (!this._mutationSummary) {
        this._mutationSummary = new MutationSummary({
            callback: (response) => {
                let range = null;
                try {
                    range = this._createRange();
                } catch (e) {
                    return;
                }
                let reordered = response[0].reordered;
                let childReordered = reordered.length ? _.find(reordered, (node) => range.containsNode(node)) : false;

                // Only reordered if child got reordered.
                if (childReordered) {
                    this._reorderChildren();
                }
            },
            rootNode: commonParent,
            observeOwnChanges: true,
            queries: [
                { all: true }  // TODO: Fine tune this later.
            ]
        });
    }
};

/**
 * Stops and destroys the MutationSummary if it exist.
 * @private
 */
Blaze.TemplateInstance.prototype._endMutationSummary = function() {
    if (!!this._mutationSummary) {
        this._mutationSummary.disconnect();
        delete this._mutationSummary;
    }
};

/**
 * @param {Blaze.Template} template
 * @returns {Range|TextRange}
 * @throws Exception when error occurs. Usually when first node is not preceded by a Node or no node after last node.
 */
Blaze.TemplateInstance.prototype._createRange = function() {
    let range = rangy.createRange();
    try {
        range.setStartBefore(this.firstNode);
        range.setEndAfter(this.lastNode);
        return range;
    } catch (e) {
        throw e;
    }
};

Blaze.TemplateInstance.prototype._setChildren = function(children) {
    this._children = children;
    this._childrenReactive.set(children);
};

/**
 * @returns {Array|*} Array of templates that are child of the current template. They have the same ordering in DOM.
 */
Blaze.TemplateInstance.prototype.children = function() { return this._children; };
/**
 * @returns {Array|*} Array of templates that are child of the current template. They have the same ordering in DOM. Reactive.
 */
Blaze.TemplateInstance.prototype.getChildren = function() { return this._childrenReactive.get(); };

Template.onCreated(function () {
    this._children = [];
    this._childrenReactive = new ReactiveVar([]);
    this._mutationSummary = null;
});

Template.onRendered(function () {
    let parent = this.parent(1, true);
    let parentExist = !!parent;

    if (!parentExist) { return; }

    if (!!parent._children) {  // For some reason, onRendered is called without onCreated, hence this check.
        // See if this template already exist as parent's children.
        let alreadyExist = parent._children.find((child) => { child === this; });

        // If it doesn't exist, add it as parent's child.
        if (!alreadyExist) {
            let newChildren = parent._children;
            newChildren.push(this);
            parent._setChildren(newChildren);
        }

        // Reorder when something is added.
        parent._reorderChildren();
    }

    // onRendered is not called when Templates's DOM representation are being switched, thus we must monitor
    // them ourselves.
    this._startMutationSummary();
});

Template.onDestroyed(function () {
    this._endMutationSummary();

    //let parent = this.parent(1, true);
    if (!!parent && !!parent._children) {
        let parentChildren = parent._children;
        parentChildren.splice(parentChildren.indexOf(this), 1);
        parent._setChildren(parentChildren);
    }
});