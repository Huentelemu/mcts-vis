class TicTacToe{
    constructor(newTTT, turnX, nRemainingMoves){
        if (newTTT){
            this.ttt = newTTT
            this.turnX = turnX
            this.id = this.deriveID(this.ttt)
            this.nRemainingMoves = nRemainingMoves
        } else {
            this.ttt = [
                [
                    0, 0, 0
                ],
                [
                    0, 0, 0
                ],
                [
                    0, 0, 0
                ]
            ]
            this.turnX = true
            this.id = 0
            this.nRemainingMoves = 9
        }
    }

    deriveID(ttt) {
        var id = 0
        for (var i=0; i<ttt.length; i++){
            for (var j=0; j<ttt[i].length; j++){
                if (ttt[i][j] == -1){
                    id += 1 * Math.pow(3, i*3 + j)
                } else if (ttt[i][j] == 1){
                    id += 2 * Math.pow(3, i*3 + j)
                }
            }
        }
        return id
    }

    copyTTT() {
        return this.ttt.map((arr) => {
            return arr.slice();
        })
    }

    rotateTTT(ttt) {
        var newTTT = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        newTTT[0][0] = ttt[0][2]
        newTTT[0][2] = ttt[2][2]
        newTTT[2][2] = ttt[2][0]
        newTTT[2][0] = ttt[0][0]
        newTTT[1][1] = ttt[1][1]
        newTTT[1][0] = ttt[0][1]
        newTTT[0][1] = ttt[1][2]
        newTTT[1][2] = ttt[2][1]
        newTTT[2][1] = ttt[1][0]
        return newTTT
    }

    transposeTTT() {
        var newTTT = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        for (var i=0; i<this.ttt.length; i++){
            for (var j=0; j<this.ttt[i].length; j++){
                newTTT[i][j] = this.ttt[j][i]
            }
        }
        return newTTT
    }

    computeTranspositions() {
        // Rotations of original TTT
        var ttt = this.copyTTT()
        var transpositions = [ttt]
        ttt = this.rotateTTT(ttt)
        transpositions.push(ttt)
        ttt = this.rotateTTT(ttt)
        transpositions.push(ttt)
        ttt = this.rotateTTT(ttt)
        transpositions.push(ttt)
        
        // Rotations of transposed TTT
        ttt = this.transposeTTT()
        transpositions.push(ttt)
        ttt = this.rotateTTT(ttt)
        transpositions.push(ttt)
        ttt = this.rotateTTT(ttt)
        transpositions.push(ttt)
        ttt = this.rotateTTT(ttt)
        transpositions.push(ttt)

        // Derive IDs from ttt
        this.transpositionIDs = []
        transpositions.forEach(ttt => {
            this.transpositionIDs.push(this.deriveID(ttt))
        })

        // Remove repeated IDs
        this.transpositionIDs = [...new Set(this.transpositionIDs)]
    }

    expansion() {
        var stateChildren = []

        // Special case for first expansion
        if (this.id == 0){
            stateChildren.push({
                state: new TicTacToe([[1, 0, 0], [0, 0, 0], [0, 0, 0]], false, 8),
                lastAction: [0, 0]
            })
            stateChildren.push({
                state: new TicTacToe([[0, 1, 0], [0, 0, 0], [0, 0, 0]], false, 8),
                lastAction: [0, 1]
            })
            stateChildren.push({
                state: new TicTacToe([[0, 0, 0], [0, 1, 0], [0, 0, 0]], false, 8),
                lastAction: [1, 1]
            })
            return stateChildren
        }

        for (var i=0; i<this.ttt.length; i++){
            for (var j=0; j<this.ttt[i].length; j++){
                if (this.ttt[i][j] == 0){
                    // Copy new ttt
                    var newTTT = this.copyTTT()
                    if (this.turnX) {
                        newTTT[i][j] = 1
                    } else {
                        newTTT[i][j] = -1
                    }
                    var lastAction = [i, j]
                    stateChildren.push({
                        state: new TicTacToe(newTTT, !this.turnX, this.nRemainingMoves-1),
                        lastAction: lastAction
                    })
                }
            }
        }
        return stateChildren
    }

    rollout() {
        var remainingMoves = []
        for (var i=0; i<this.ttt.length; i++){
            for (var j=0; j<this.ttt[i].length; j++){
                if (this.ttt[i][j] == 0) {
                    remainingMoves.push([i, j])
                }
            }
        }
        remainingMoves = remainingMoves.sort(() => 0.5 - Math.random())
        // Copy new ttt
        var rolloutState = this.copyTTT()
        var rolloutTurnX = this.turnX
        while (remainingMoves.length > 0){
            var nextMove = remainingMoves.pop()
            if (rolloutTurnX) {
                rolloutState[nextMove[0]][nextMove[1]] = 1
            } else {
                rolloutState[nextMove[0]][nextMove[1]] = -1
            }
            //check win condition
            var result = this.checkEndGame(rolloutState)
            if (result != 0){
                return result
            } 
            rolloutTurnX = !rolloutTurnX
        }
        
        return 0
    }

    checkEndGame(s=this.ttt) {
        for (var i=0; i<3; i++) {
            var result = s[i][0] + s[i][1] + s[i][2]
            if (result == 3) return 1
            else if (result == -3) return -1
        }

        for (var i=0; i<3; i++) {
            var result = s[0][i] + s[1][i] + s[2][i]
            if (result == 3) return 1
            else if (result == -3) return -1
        }

        var result = s[0][0] + s[1][1] + s[2][2]
        if (result == 3) return 1
        else if (result == -3) return -1

        var result = s[2][0] + s[1][1] + s[0][2]
        if (result == 3) return 1
        else if (result == -3) return -1

        return 0
    }

    nextTurn() {
        sumValues = 0
        for (var i=0; i<this.ttt.length; i++){
            for (var j=0; j<this.ttt[i].length; j++){
                sumValues += this.ttt[i][j]
            }
        }
        if (sumValues == 1) {
            return -1
        } else return 1
    }

    isEquals(other) {
        for (var i=0; i<this.ttt.length; i++){
            for (var j=0; j<this.ttt[i].length; j++){
                if (other.ttt[i][j] != this.ttt[i][j]){
                    return false
                }
            }
        }
        return true
    }

    print() {
        console.log('TTT1:', this.ttt[0])
        console.log('TTT2:', this.ttt[1])
        console.log('TTT3:', this.ttt[2])
        console.log('-------------------------------')
    }

    drawImage(svg, lastAction=null) {
        var self = this

        // Remove all previous elements
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
        }
        // Base lines
        svg.append('path').attr('d', 'M70,10L70,190 M130,10L130,190 M10,70L190,70 M10,130L190,130')
            .attr('stroke', 'black')
            .attr('stroke-width', 4)
        // Add circles and crosses
        for (var i=0; i<this.ttt.length; i++){
            for (var j=0; j<this.ttt[i].length; j++){
                if (this.ttt[i][j] == -1) {
                    svg.append('circle')
                        .attr('cx', i*60 + 40)
                        .attr('cy', j*60 + 40)
                        .attr('r', 15)
                        .attr('stroke-width', 3)
                        .attr('stroke', function() {
                            if (lastAction){
                                if (lastAction[0] == i && lastAction[1] == j) {
                                    return 'red'
                                }
                            }
                            return 'black'
                        })
                        .attr('fill', 'none')
                } else if (this.ttt[i][j] == 1) {
                    svg.append('path')
                        .attr('d', () => {
                            var o = 15 // offset
                            var x = i*60 +40 
                            var y = j*60 +40
                            return `M${x-o},${y-o}L${x+o},${y+o} M${x-o},${y+o}L${x+o},${y-o}`
                        })
                        .attr('stroke-width', 4)
                        .attr('stroke', function() {
                            if (lastAction){
                                if (lastAction[0] == i && lastAction[1] == j) {
                                    return 'red'
                                }
                            }
                            return 'black'
                        })
                }
            }
        }
    }
}