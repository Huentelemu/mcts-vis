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
        const {value, bias} = link.UCB1Score()
        var UCB1Score = value + UCB1Constant*bias
        if (value == Infinity) {
            var valueString = '&#8734'
            var biasString = '&#8734'
            var UCB1String = '&#8734'
        } else {
            var valueString = value.toFixed(2)
            var biasString = bias.toFixed(2)
            var UCB1String = UCB1Score.toFixed(2)
        }
        this.tooltip.style('opacity', 0.9)
            .style('top', parseInt(line.attr('y2')) + 50 + 'px')
            .style('left', parseInt(line.attr('x2')) + 50 + 'px')
        this.tooltipText.html('N Visits: ' + link.nVisits + '<br/>Value: ' + valueString + '<br/>Bias: ' + biasString + '<br/>UCB1: ' + UCB1String)
        this.tooltipSVG.selectAll("*").remove()
        link.parentNode.state.drawImage(this.tooltipSVG, link.lastAction)
    }

    hide() {
        this.tooltip.style('opacity', 0)
    }
}