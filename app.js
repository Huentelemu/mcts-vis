var width = 2000//700
var height = 1100
var nMaxLayers = 10
var mainSVG = d3.select('body').append('svg').attr('width', width).attr('height', height)

//var nodes_g = this.mainSVG.append("g")
//var nodes = this.points_g.selectAll('circle').data(this.data)

var nodes_g = []
var nodes = []
var links_g = []
var links = []

var UCB1Constant = 2

var nodeInfo = new NodeInfo()
var linkInfo = new LinkInfo()

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

var colorScale = d3.scaleLinear()
    .range(['red', 'white', 'blue']) // or use hex values
    .domain([0.25, 0.5, 0.75]);

function printNodes(layers) {

    // Reorder nodes in layers for cleaner display of links
    for (var depth=0; depth<layers.length-1; depth++) {
        // Save in MCTS object its relative location in layers array
        for (var parentIndex=0; parentIndex<layers[depth].length; parentIndex++) {
            layers[depth][parentIndex].locationInLayer = parentIndex
        }

        // Recalculate mean location of parents for each child node
        for (var childIndex=0; childIndex<layers[depth+1].length; childIndex++) {
            var sumLocations = 0
            var parents = layers[depth+1][childIndex].parents
            //console.log('parent', layers[depth+1][childIndex].parents)
            for (var childsParentIndex=0; childsParentIndex<parents.length; childsParentIndex++){
                sumLocations += parents[childsParentIndex].locationInLayer
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

        // Build nodes
        nodes[depth] = nodes_g[depth].selectAll('circle').data(layers[depth])
        nodes[depth].exit().remove()
        nodes[depth] = nodes[depth].enter().append("circle").merge(nodes[depth])
            .attr('cx', function(d, i) {
                var separation = width / (layers[depth].length+1)
                return separation * (i + 1)
            })
            .attr('cy', function(d, i) {
                var separation = height / (nMaxLayers+1)
                return separation * (depth + 1)
            })
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
                    .attr('opacity', 1)
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
                    .attr('opacity', 0.5)
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
            links[depth][parentIndex] = links_g[depth][parentIndex].selectAll('path').data(parent.children)
            links[depth][parentIndex].exit().remove()
            links[depth][parentIndex] = links[depth][parentIndex].enter().append('path').merge(links[depth][parentIndex])
                .attr('stroke', 'black')
                .attr('fill', 'none')
                .attr('stroke-width', d => {
                    if (d.preselected && parent.preselected){
                        return 3
                    }
                    return 1
                })
                .attr('opacity', d => {
                    if (d.preselected && parent.preselected) {
                        return 1
                    }
                    return 0.1
                })
                .attr('d', function(d) {
                    var parentsSeparation = width / (layers[depth].length + 1)
                    var x1 = parentsSeparation * (parentIndex + 1)

                    var vertSeparation = height / (nMaxLayers+1)
                    var y1 = vertSeparation * (depth + 1)

                    var childrenSeparation = width / (layers[depth+1].length + 1)
                    var sonIndex = layers[depth+1].findIndex(function(child) {
                        return child.id == d.id
                    })
                    var x2 = childrenSeparation * (sonIndex + 1)
                    
                    var y2 = vertSeparation * (depth + 2)

                    return 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2
                })
                .on('mouseover', function(d) {
                    d3.select(this).transition().duration(10)
                        .attr('opacity', 1)
                        .attr('stroke-width', 5)
                    linkInfo.show(d, d3.select(this))
                })
                .on('mouseout', function() {
                    d3.select(this).transition().duration(300)
                        .attr('opacity', 0.1)
                        .attr('stroke-width', 1)
                    linkInfo.hide()
                })
            links_g[depth][parentIndex].lower()
        }
    }
}



mainSVG.selectAll('circle').enter().append('circle')

// Button for iterations

