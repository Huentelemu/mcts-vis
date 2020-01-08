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

    show(node, childCircle) {
        this.tooltip.style('opacity', 0.9)
            .style('top', parseInt(childCircle.attr('cy')) + 50 + 'px')
            .style('left', parseInt(childCircle.attr('cx')) + 50 + 'px')
        this.tooltipText.html('asdasdasd')  // '<br/>UCB1: '
        this.tooltipSVG.selectAll("*").remove()
        node.state.drawImage(this.tooltipSVG, true)
    }

    hide() {
        this.tooltip.style('opacity', 0)
    }
}