var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var height = 1100
var nMaxLayers = 10
var mainSVG = d3.select('body').append('svg').attr('width', width).attr('height', height)

document.body.style.background = "#006400"

var colorScale = d3.scaleLinear()
    .range(['red', 'white', 'blue']) // or use hex values
    .domain([0.25, 0.5, 0.75]);

//var nodes_g = this.mainSVG.append("g")
//var nodes = this.points_g.selectAll('circle').data(this.data)

var nodes_g = []
var nodes = []
var links_g = []
var links = []

var UCB1Constant = 2

// Initialize info tooltips
var nodeInfo = new NodeInfo()
var linkInfo = new LinkInfo()

// Initialize MCTS with empty game
root = new MCTS(new TicTacToe)

printNodes(root.layers)

var iterationButton = d3.select('body').append('button').text('1 Iteration')
    .on('click', () => iterationFunction(1))

var multiIterationButton1 = d3.select('body').append('button').text('20 Iterations')
    .on('click', () => iterationFunction(20))

var multiIterationButton2 = d3.select('body').append('button').text('1000 Iterations')
    .on('click', () => iterationFunction(1000))

function iterationFunction(nIterations) {
    for (var i=0; i<nIterations; i++){
        root.iteration(UCB1Constant)
    }
    printNodes(root.layers)
    console.log('Layers:', root.layers)
    console.log('Links:', links)
    console.log('Nodes:', nodes)
}


function printNodes(layers) {

    // Reorder nodes in layers for cleaner display of links
    for (var depth=0; depth<layers.length-1; depth++) {

        // Save in MCTS node its relative location in layers array
        for (var parentIndex=0; parentIndex<layers[depth].length; parentIndex++) {
            layers[depth][parentIndex].locationInLayer = parentIndex
        }

        // Recalculate mean location of parents for each child node
        for (var childIndex=0; childIndex<layers[depth+1].length; childIndex++) {
            var sumLocations = 0
            var parents = layers[depth+1][childIndex].parents
            //console.log('parent', layers[depth+1][childIndex].parents)
            for (var childsParentIndex=0; childsParentIndex<parents.length; childsParentIndex++){
                sumLocations += parents[childsParentIndex].parentNode.locationInLayer
            }
            layers[depth+1][childIndex].meanLocationParents = sumLocations / layers[depth+1][childIndex].parents.length
        }

        // Reorder nodes in layer according to mean locations of their respective parents
        layers[depth+1].sort(function (a, b) {
            return a.meanLocationParents - b.meanLocationParents
        })
    }

    // Clean previous preselected status
    root.cleanPreselections()

    // Paint preselected status
    root.preselection(UCB1Constant)

    // Ensure nodes are initialized
    while (layers.length > nodes_g.length) {
        nodes_g.push(mainSVG.append("g"))
        nodes.push(null)
        links_g.push([])
        links.push([])
    }

    for (var depth=0; depth<layers.length; depth++) {
        var parentsSeparation = width / (layers[depth].length + 1)
        if (layers.length > depth + 1) {
            var childrenSeparation = width / (layers[depth+1].length + 1)
        }
        
        var vertSeparation = height / (nMaxLayers+1)
        var parentsYLocation = vertSeparation * (depth + 1)
        var childrenYLocation = vertSeparation * (depth + 2)

        // Build nodes
        nodes[depth] = nodes_g[depth].selectAll('circle').data(layers[depth])
        nodes[depth].exit().remove()
        nodes[depth] = nodes[depth].enter().append("circle").merge(nodes[depth])
            .attr('cx', function(d, i) {
                return parentsSeparation * (i + 1)
            })
            .attr('cy', parentsYLocation)
            .attr('fill', function(d) {
                if (d.nVisits == 0) {
                    return 'green'
                } else {
                    return colorScale(d.nWins / d.nVisits)
                }
            })
            .attr("stroke", d => {
                if (d.preselected){
                    return 'black'
                } else {
                    return 'black'
                }
            })
            .attr("stroke-width", 1)
            .attr("stroke-width", d => {
                if (d.preselected) {
                    return 5
                }
                return 1
            })
            .attr("opacity", d => {
                if (d.preselected) {
                    return 1
                }
                return 0.5
            })
            .attr('r', function(d) {
                if (root.nVisits>0) {
                    var relativeToRoot = d.nVisits/root.nVisits
                } else {
                    var relativeToRoot = 1
                }
                return relativeToRoot*50 + 5
            }) 
            .style('position', 'absolute')
            .on('mouseover', function(d) {
                d3.select(this).transition().duration(10)
                    .attr('opacity', d => {
                        if (d.preselected) {
                            return 1
                        }
                        return 0.5
                    })
                    .attr('r', function(d) {
                        if (root.nVisits>0) {
                            var relativeToRoot = d.nVisits/root.nVisits
                        } else {
                            var relativeToRoot = 1
                        }
                        return (relativeToRoot*50 + 5) * 2
                    })
                nodeInfo.show(d, d3.select(this))
            })
            .on('mouseout', function() {
                d3.select(this).transition().duration(300)
                    .attr('opacity', d => {
                        if (d.preselected) {
                            return 1
                        }
                        return 0.5
                    })
                    .attr('r', function(d) {
                        if (root.nVisits>0) {
                            var relativeToRoot = d.nVisits/root.nVisits
                        } else {
                            var relativeToRoot = 1
                        }
                        return relativeToRoot*50 + 5
                    })
                    
                nodeInfo.hide()
            })
            .on('click', (d) => console.log('MCTS', d))

        // Build links

        while (layers[depth].length > links_g[depth].length) {
            links_g[depth].push(mainSVG.append("g"))
            links[depth].push(null)
        }
        for (var parentIndex=0; parentIndex<layers[depth].length; parentIndex++){
            var parent = layers[depth][parentIndex]
            var parentXLocation = parentsSeparation * (parentIndex + 1)

            links[depth][parentIndex] = links_g[depth][parentIndex].selectAll('line').data(parent.children)
            links[depth][parentIndex].exit().remove()
            links[depth][parentIndex] = links[depth][parentIndex].enter().append('line').merge(links[depth][parentIndex])
                .attr('stroke', 'black')
                .attr('fill', 'none')
                .attr('stroke-width', d => {
                    if (d.preselected){
                        return 5
                    }
                    return 3
                })
                .attr('opacity', d => {
                    if (d.preselected) {
                        return 1
                    }
                    return 0.1
                })
                .attr('x1', parentXLocation)
                .attr('y1', parentsYLocation)
                .attr('x2', d => {
                    var sonIndex = layers[depth+1].findIndex(function(child) {
                        return child.id == d.node.id
                    })
                    return childrenSeparation * (sonIndex + 1)
                })
                .attr('y2', childrenYLocation)
                .on('mouseover', function(d) {
                    d3.select(this).transition().duration(10)
                        .attr('opacity', 1)
                        .attr('stroke-width', 10)
                    linkInfo.show(d, d3.select(this), UCB1Constant)
                })
                .on('mouseout', function() {
                    d3.select(this).transition().duration(300)
                        .attr('opacity', d => {
                            if (d.preselected) {
                                return 1
                            }
                            return 0.1
                        })
                        .attr('stroke-width', d => {
                            if (d.preselected){
                                return 5
                            }
                            return 3
                        })
                    linkInfo.hide()
                })
            links_g[depth][parentIndex].lower()
        }
    }
}



mainSVG.selectAll('circle').enter().append('circle')

// Button for iterations

