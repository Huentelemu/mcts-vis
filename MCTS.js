class MCTS{
    constructor(state, layers = null, depth = 0){
        this.parents = []
        this.children = []
        this.state = state
        this.state.computeTranspositions()
        this.id = state.id
        this.leaf = true
        this.nVisits = 0
        this.nWins = 0
        this.nLosses = 0
        this.nTies = 0
        this.depth = depth
        if (layers){
            this.layers = layers
        } else {
            this.layers = [[this]]
        }
        this.locationInLayer = 0
        this.meanLocationParents = 0
        this.endGame = this.state.checkEndGame()
        this.highlightedElement = false
    }

    iteration(UCB1Constant) {
        if (this.endGame || this.state.nRemainingMoves == 0) {
            var result = this.endGame
        } else if (this.leaf) {
            if (this.nVisits < 1){
                var result = this.rollout()
            } else {
                this.expansion()
                var selectedChild = this.selection(UCB1Constant)
                var result = selectedChild.iteration(UCB1Constant)
            }
        } else {
            var selectedChild = this.selection(UCB1Constant)
            var result = selectedChild.iteration(UCB1Constant)
        }
        this.backpropagation(result)
        return result
    }

    selection(UCB1Constant, returnArray=false) {
        var bestChildren = []
        var bestChildUSB1 = -1

        // Collect children with best score in a list
        for (var i=0; i<this.children.length; i++) {
            var childUSB1 = this.children[i].UCB1Score(UCB1Constant)
            if (childUSB1 > bestChildUSB1) {
                bestChildren = [this.children[i]]
                bestChildUSB1 = childUSB1
            } else if (childUSB1 == bestChildUSB1) {
                bestChildren.push(this.children[i])
            }
        }
        
        if (returnArray) {
            // Return all selected children
            return bestChildren
        }
        else {
            // Return one of the selected children chosen randomly
            return bestChildren[Math.floor(Math.random() * bestChildren.length)]
        }
    }

    expansion() {
        this.leaf = false
        // Ensure next layer exists
        if (this.layers.length-1 == this.depth) {
            this.layers.push([])
        }
        
        var stateChildren = this.state.expansion()        
        
        for (var i=0; i<stateChildren.length; i++) {
            var newState = stateChildren[i].state
            var lastAction = stateChildren[i].lastAction

            // Check if child already is present in layers
            var equalSibling = this.alreadyPresent(newState)
            if (equalSibling) {
                // If this sibling is already a child of the present node, skip it
                if (this.children.map(child => child.node.id).includes(equalSibling.id)) continue
                // If child is already present, create a new link connecting this parent and the already present child 'equalSibling'
                var newChildLink = new MCTSLink(equalSibling, this, lastAction)
            } else {
                // If not, create a new node and connect it with this parent
                var newNode = new MCTS(newState, this.layers, this.depth+1)
                var newChildLink =  new MCTSLink(newNode, this, lastAction)
                this.layers[this.depth+1].push(newNode)
            }
            this.children.push(newChildLink)
        }
    }

    rollout() {
        var result = this.state.rollout()
        return result
    }

    backpropagation(result) {
        if (result == 1) {
            this.nWins++
        } else if (result == -1){
            this.nLosses++
        } else {
            this.nTies++
        }
        this.nVisits++
    }

    alreadyPresent(child) {
        // Check if child state is has already a sibling
        var siblings = this.layers[this.depth+1]
        for (var i=0; i<siblings.length; i++){
            if (siblings[i].state.transpositionIDs.includes(child.id)) {
            //if (siblings[i].state.id == child.id) {
                return siblings[i]
            }
        }
        return false
    }

    cleanPreselections() {
        // Reset all preselected states in nodes
        this.preselected = false
        this.children.forEach(childLink => {
            if (childLink.preselected) {
                childLink.cleanPreselections()
            }
        })
    }

    preselection(UCB1Constant) {
        // function to paint links and nodes as preselected for display
        this.preselected = true
        var bestChildren = this.selection(UCB1Constant, true)
        bestChildren.forEach(childLink => {
            childLink.preselection(UCB1Constant)
        })
    }

    highlightElement() {
        this.highlightedElement = true
        this.children.forEach(child => child.propagateHighlightToChildren())
        this.parents.forEach(parent => parent.propagateHighlightToParents())
    }

    propagateHighlightToChildren() {
        this.highlightedElement = true
        this.children.forEach(child => child.propagateHighlightToChildren())
    }

    propagateHighlightToParents() {
        this.highlightedElement = true
        this.parents.forEach(parent => parent.propagateHighlightToParents())
    }

    resetHighlights() {
        this.highlightedElement = false
        this.children.forEach(child => {
            if (child.highlightedElement) {
                child.resetHighlights()
            }
        })
    }
}


class MCTSLink {

    constructor(node, parentNode, lastAction){
        this.node = node
        this.node.parents.push(this)
        this.parentNode = parentNode
        this.lastAction = lastAction

        this.nVisits = 0
        this.preselected = false
        this.highlightedElement = false
    }

    UCB1Score(UCB1Constant=null) {
        // Calculate node value
        if (this.node.nVisits == 0) {
            var value = Infinity
        } else {
            if (this.node.state.turnX) {
                var value = this.node.nLosses / this.node.nVisits
            } else {
                var value = this.node.nWins / this.node.nVisits
            }
        }

        // Calculate nVisits bias
        if (this.nVisits == 0) {
            var visitsBias = Infinity
        } else {
            var visitsBias = Math.sqrt(Math.log(this.parentNode.nVisits) / this.nVisits)
        }

        if (UCB1Constant) {
            return value + UCB1Constant*visitsBias
        } else {
            return {
                value: value,
                bias: visitsBias,
            }
        }
    }

    iteration(UCB1Constant) {
        var result = this.node.iteration(UCB1Constant)
        this.nVisits++
        return result
    }

    cleanPreselections() {
        this.preselected = false
        this.node.cleanPreselections()
    }

    preselection(UCB1Constant) {
        // function to paint links and nodes as preselected for display
        this.preselected = true
        this.node.preselection(UCB1Constant)
    }

    propagateHighlightToChildren() {
        this.highlightedElement = true
        this.node.propagateHighlightToChildren()
    }

    propagateHighlightToParents() {
        this.highlightedElement = true
        this.parentNode.propagateHighlightToParents()
    }

    resetHighlights() {
        this.highlightedElement = false
        this.node.resetHighlights()
    }
}