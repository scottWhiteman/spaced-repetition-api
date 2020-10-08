const _Node = require('./_Node')

class LinkedList {
    constructor() {
        this.head = null;
    }

    insertFirst(word) {
        this.head = new _Node(word, this.head)
    }

    insertLast(word) {
        if(this.head === null) {
            this.insertFirst(word);
        }
        else {
            let tempNode = this.head;
            while (tempNode.next !== null) {
                tempNode = tempNode.next;
            }
            tempNode.next = new _Node(word, null);
        }
    }

    find(item) {
        let currNode = this.head;
        if(!this.head) {
            return null
        }
        while (currNode.value !== item) {
            if (currNode.next === null) {
                return null;
            }
            else {
                currNode = currNode.next;
            }
        }
        return currNode;
    }

    remove(item) {
        if(!this.head) {
            return null;
        }
        if (this.head.value === item) {
            this.head = this.head.next;
            return;
        }
        let currentNode = this.head;
        let previousNode = this.head;
        while((currentNode !== null) && (currentNode.value !== item)) {
            previousNode = currentNode;
            currentNode = currentNode.next;
        }
        if (currentNode === null) {
            console.log('Not found');
            return;
        }
        previousNode.next = currentNode.next;
    }

    insertBefore(value, nextValue) {
        let node = this.head;
        let next = this.find(nextValue);
        if (node === next) {
            next = node;
            this.head = new _Node(value, next)
        } else {
            while (node.next.value !== nextValue && node.value !== nextValue) {
                node = node.next;
            }
            const item = new _Node(value, next)
            node.next = item;
        }
    }

    insertAfter(value, beforeValue) {
        let node = this.head;
        let before = this.find(beforeValue);
        while(node !== before) {
            node = node.next;
        }
        if (!node.next) {
            this.insertLast(value);
        } else {
            const item = new _Node(value, node.next);
            before.next = item;
        }
    }

    insertAt(value, position) {
        let node = this.head;
        if(position === 1) {
            this.insertBefore(value, node.value)
        } else {
            for(let i=2; i<position; i++) {
                if(node.next){
                    node = node.next;
                }
            }
            const item = new _Node(value, node.next)
            node.next = item;
        }
    }

    display() {
        let lstArray = []
        let node = this.head;
        while(node) {
            lstArray.push(node.value);
            node = node.next
        }
        return lstArray;
    }

    updateLinks() {
        let node = this.head;
        while(node){
            if(node.next){
                node.value.next = node.next.value.id;
            } else {
                node.value.next = null;
            }
            node = node.next
        }
    }
}

module.exports = LinkedList;