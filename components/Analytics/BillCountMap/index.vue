<template>
  <div class="bill-map" >
    <div class="map" id="bills-map" />
    <tooltip :title="tooltipTitle" :count="tooltipSponsors"/>
  </div>
</template>

<script>
import _ from 'lodash'
import * as d3 from 'd3'
import * as topojson from 'topojson'
import tooltip from './tooltip'

export default {
  components: {
    tooltip
  },
  props: ['bills', 'usMap', 'stateToFips', 'fipsToState'],
  data () {
    return {
      tooltipTitle: '',
      tooltipSponsors: [],
      defaultWidth: 900,
      defaultHeight: 500,
      maxCount: 0,
      minCount: 0
    }
  },
  mounted () {
    this.drawMap()
  },
  computed: {
    projection () {
      return d3
        .geoAlbersUsa()
        .scale(this.defaultWidth)
        .translate([this.defaultWidth / 2, this.defaultHeight / 2])
    },
    svg () {
      let zoom = d3
        .zoom()
        .scaleExtent([1, 12])
        .on('zoom', this.zoomed)

      return d3
        .select('#bills-map')
        .classed('svg-container', true)
        .append('svg')
        .attr('viewBox', `0 0 ${this.defaultWidth} ${this.defaultHeight}`)
        .classed('svg-content-responsive', true)
        .append('g')
        .call(zoom)
        .append('g')
    },
    BillCountByState () {
      let stateHashmap = {}
      let max = 0
      let min = 100000

      this.bills.forEach(bill => {
        if (!stateHashmap[bill.sponsor.state]) {
          stateHashmap[bill.sponsor.state] = 0
        }
        stateHashmap[bill.sponsor.state]++
      })

      const countByStateArray = _.map(stateHashmap, (value, prop) => ({ code: prop, count: value }))

      // record the max and min count
      countByStateArray.forEach(countByState => {
        if (countByState.count > max) max = countByState.count
        if (countByState.count < min) min = countByState.count
      })

      this.maxCount = max
      this.minCount = min

      return countByStateArray
    }
  },
  watch: {
    bills () {
      this.drawMap()
      console.log('update!!!')
    }
  },
  methods: {
    zoomed () {
      this.svg.attr('transform', d3.event.transform)
    },
    getGeoNameFromGeoId (id) {
      const fips = id.slice(-2)
      const state = this.fipsToState[fips]
      return state
    },
    getColorFromSponsor (sponsor) {
      let color = 'gray'

      if (sponsor.party === 'Republican') {
        color = 'red'
      }

      if (sponsor.party === 'Democrat') {
        color = 'blue'
      }

      return color
    },

    getFipsFromStateCode (stateCode) {
      return this.stateToFips[stateCode]
    },

    getId (value) {
      return value.length > 2 ? `ID-${value}` : `ID-${Number(value)}`
    },

    getGeoIdFromSponsor (code) {
      const fips = this.getFipsFromStateCode(code)
      return this.getFormattedNumber(fips)
    },

    getFormattedNumber (value) {
      return ('0' + value).slice(-2)
    },
    drawMap () {
      console.log('hhhh', this.BillCountByState, this.maxCount, this.minCount)

      let self = this
      const path = d3.geoPath().projection(this.projection)
      const tooltip = d3.select('#tooltip')

      this.svg
        .append('defs')
        .append('path')
        .attr('id', 'land')
        .datum(topojson.feature(this.usMap, this.usMap.objects.land))
        .attr('d', path)

      this.svg
        .append('clipPath')
        .attr('id', 'clip-land')
        .append('use')
        .attr('xlink:href', '#land')

      this.svg
        .append('g')
        .attr('class', 'states')
        .attr('clip-path', 'url(#clip-land)')
        .selectAll('path')
        .data(topojson.feature(this.usMap, this.usMap.objects.states).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('id', function (d) {
          const fips = d.id
          const id = self.getId(fips)
          return id
        })

      this.svg
        .append('path')
        .attr('class', 'state-boundaries')
        .datum(
          topojson.mesh(this.usMap, this.usMap.objects.states, function (a, b) {
            return a !== b
          })
        )
        .attr('d', path)

      this.BillCountByState.forEach(state => {
        const geoId = self.getGeoIdFromSponsor(state.code)
        const selectedId = self.getId(geoId)
        let color = '#e8e8e8'

        d3
          .select(`#${selectedId}`)
          .attr('class', 'selected')
          .style('fill', color)
          .on('mouseover', function (d) {
            const geoName = self.getGeoNameFromGeoId(geoId)
            self.tooltipTitle = geoName
            self.tooltipSponsors = state.count
            return tooltip.style('visibility', 'visible')
          })
          .on('mousemove', function (d) {
            return tooltip.style('top', event.pageY - 10 + 'px').style('left', event.pageX + 10 + 'px')
          })
          .on('mouseout', function () {
            return tooltip.style('visibility', 'hidden')
          })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.bill-map {
  text-align: left;

  .map {
    background: #fff;
    text-align: center;
  }
}
</style>

<style>
path {
  stroke-linejoin: round;
  stroke-linecap: round;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  padding-bottom: 55%; /* aspect ratio */
  vertical-align: top;
  overflow: hidden;
}
.svg-content-responsive {
  display: inline-block;
  position: absolute;
  left: 0;
}

.states {
  fill: #efefef;
}

.states :hover {
  fill: #a5a5a5;
}

.districts {
  fill: #efefef;
}

.districts :hover {
  fill: #a5a5a5;
}

.district-boundaries {
  pointer-events: none;
  fill: none;
  stroke: #fff;
  stroke-width: 0.5px;
}

.state-boundaries {
  pointer-events: none;
  fill: none;
  stroke: #fff;
  stroke-width: 1.5px;
}

button {
  padding: 10px 20px;
}
</style>