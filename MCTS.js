class MCTS{
    constructor(state, layers = null, depth = 0){
        this.parents = []
        this.children = []
        this.state = state  
        this.leaf = true
        this.nVisits = 0
        this.value = 0
        this.depth = depth
        if (layers){
            this.layers = layers
        } else {
            this.layers = [[this]]
        }
        this.locationInLayer = 0
        this.meanLocationParents = 0
    }

    iteration(totalVisits) {
        if (!totalVisits) {
            totalVisits = this.nVisits
        }
        if (this.leaf) {
            if (this.nVisits == 0){
                var result = this.rollout()
                this.backpropagation(result)
                return
            } else {
                this.expansion()
            }
        }
        var selectedChild = this.selection(totalVisits)
        if (!selectedChild) {
            console.log('selectedChild', selectedChild)
            console.log('this', this)
        }
        selectedChild.iteration(totalVisits)
    }

    selection(totalVisits) {
        var bestChildren = []
        var bestChildUSB1 = -1
        for (var i=0; i<this.children.length; i++) {
            var childUSB1 = this.children[i].UCB1(totalVisits)
            if (childUSB1 > bestChildUSB1) {
                bestChildren = [this.children[i]]
                bestChildUSB1 = childUSB1
            } else if (childUSB1 == bestChildUSB1) {
                bestChildren.push(this.children[i])
            }
        }
        return bestChildren[Math.floor(Math.random() * bestChildren.length)]
    }

    expansion() {
        this.leaf = false
        // Ensure next layer exists
        if (this.layers.length-1 == this.depth) {
            this.layers.push([])
        }
        
        var stateChildren = this.state.expansion()
        
        for (var i=0; i<stateChildren.length; i++) {
            // Check if child already is present in layers
            var equalSibling = this.alreadyPresent(stateChildren[i])
            if (equalSibling) {
                var newChild = equalSibling
            } else {
                var newChild = new MCTS(stateChildren[i], this.layers, this.depth+1)
                this.layers[this.depth+1].push(newChild)
            }
            newChild.parents.push(this)
            this.children.push(newChild)
            
        }
    }

    rollout() {
        return this.state.rollout()
    }

    backpropagation(result) {
        this.nVisits++
        this.value += result
        this.parents.forEach(parent => {
            parent.backpropagation(result)
        })
    }

    UCB1(totalVisits) {
        if (this.nVisits == 0) {
            return 1e9
        }
        return (this.value / this.nVisits) + 0.002*Math.sqrt(Math.log(totalVisits) / this.nVisits)
    }

    alreadyPresent(child) {
        // Check if child state is has already a sibling
        var siblings = this.layers[this.depth+1]
        for (var i=0; i<siblings.length; i++){
            if (siblings[i].state.isEquals(child)) {
                return siblings[i]
            }
        }
        return false
    }

}