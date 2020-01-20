class LinkInfo {

    constructor () {
        this.tooltip = d3.select('body').append('div')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('border-radius', '8px')
            .style('box-shadow', '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)')
            .style('background', 'lightsteelblue')
            .style('pointer-events', 'none')
        this.tooltipText = this.tooltip.append('div')
            .style('font', '24px sans-serif')
            .style('text-align', 'center')
        this.tooltipSVG = this.tooltip.append('svg')
            .style('height', '200px')
            .style('width', '200px')
            
    }

    show(link, line, UCB1Constant) {
        var UCB1Score = link.UCB1Score(UCB1Constant)
        if (UCB1Score == Infinity) {
            var UCB1String = '&#8734'
        } else {
            var UCB1String = UCB1Score.toFixed(2)
        }
        this.tooltip.style('opacity', 0.9)
            .style('top', parseInt(line.attr('y2')) + 50 + 'px')
            .style('left', parseInt(line.attr('x2')) + 50 + 'px')
        this.tooltipText.html('UCB1: ' + UCB1String)  // '<br/>UCB1: '
        this.tooltipSVG.selectAll("*").remove()
        link.node.state.drawImage(this.tooltipSVG, link.lastAction)
    }

    hide() {
        this.tooltip.style('opacity', 0)
    }
}