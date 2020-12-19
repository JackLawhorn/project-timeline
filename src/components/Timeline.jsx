import React from 'react';
import $ from 'jquery';

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lines: props.lines,
            selectedEvent: props.selectedEvent,

            earliestDate: 0,
            latestDate: 0,
            allDates: [],
            disabledArray: Array(props.lines.length).fill(false),
            
            trackPosn: -1,
            trackedArray: Array(props.lines.length).fill(true),
            
            hasMounted: false,
            zoom: 1,
            scrollPosn: 0,
            resizeTicker: 0,
        }
        this.handleSelect = props.handleSelect;

        this.totalLength = this.totalLength.bind(this);
        this.trackerCoord = this.trackerCoord.bind(this);
        this.updateTimeline = this.updateTimeline.bind(this);
        this.handleToggleLine = this.handleToggleLine.bind(this);
        this.handleTrack = this.handleTrack.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
        this.handleClearSelected = this.handleClearSelected.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        
        this.renderLoad = this.renderLoad.bind(this);
        this.fullRender = this.fullRender.bind(this);
    }
    
    componentDidMount() {
        var lines = this.state.lines.concat([]);
        this.state.lines.forEach(function(line, i) {
            line.events.forEach(function(event, j) {
                event.posn = Math.round(Math.random()*(line.end-line.start) + line.start);
            })
        });

        var thisObj = this;
        window.addEventListener('resize', function() {
            const resizeTicker = thisObj.state.resizeTicker + 0;
            thisObj.setState({
                resizeTicker: resizeTicker + 1,
            });
        });

        this.setState({
            lines: lines,
            hasMounted: true,
        });

        this.updateTimeline();
    }

    totalLength() {
        return (this.state.latestDate-this.state.earliestDate)/this.state.zoom;
    }

    trackerCoord() {
        if($("ul.timeline > li > .line-container").position() !== undefined) {
            const linesLeft = $("ul.timeline > li > .line-container").position().left,
                  linesWidth = $("ul.timeline > li > .line-container").width();
    
            return linesWidth*(this.state.trackPosn-Math.max(this.state.earliestDate,this.state.scrollPosn))/this.totalLength() + linesLeft;
        }
        else return 0;
    }

    updateTimeline() {
        var earliestDate = undefined,
            latestDate = undefined,
            allDates = [];
        this.state.lines.forEach(function(line) {
            if(earliestDate === undefined) {
                earliestDate = line.start;
                latestDate = line.end;
            }
            else {
                if(line.start < earliestDate) earliestDate = line.start;
                if(line.end > latestDate) latestDate = line.end;
            }
            
            if(allDates.indexOf(line.start) < 0) allDates.push(line.start);
            if(allDates.indexOf(line.end) < 0) allDates.push(line.end);
        });

        this.setState({
            earliestDate: earliestDate,
            latestDate: latestDate,
            allDates: allDates,
        });
    }

    handleToggleLine(e) {
        var disabledArray = this.state.disabledArray.concat([]);
        this.state.lines.forEach(function(line, i) {
            if(line.label === e.target.parentElement.getAttribute("label"))
                disabledArray[i] = !disabledArray[i];
        })
        this.setState({
            disabledArray: disabledArray,
        });
    }

    handleTrack(e) {
        if(e.type === "click" || e.buttons === 1) {
            if($(e.target).hasClass("line-event")) this.handleSelectEvent(e); 
            else {
                const totalLength = this.totalLength(),
                      earliestDate = this.state.earliestDate,
                      zoom = this.state.zoom,
                      scrollPosn = this.state.scrollPosn,
                      x = e.clientX,
                      linesLeft = $("ul.timeline > li > .line-container").position().left,
                      linesWidth = $("ul.timeline > li > .line-container").width(),
                      linesPadding = 15;
                var trackPosn = this.state.trackPosn + 0,
                    trackedArray = Array(this.state.lines.length).fill(true);

                if(x - linesLeft - linesPadding >= 0) {
                    trackPosn = (totalLength/zoom*(x-linesLeft-linesPadding)/(linesWidth/zoom)+Math.max(earliestDate, scrollPosn)).toFixed(2);
                    
                    this.state.lines.forEach(function(line, i) {
                        if(line.start > trackPosn || line.end < trackPosn)
                            trackedArray[i] = false;
                    });
        
                    this.setState({
                        trackPosn: trackPosn,
                        trackedArray: trackedArray,
                        selectedEvent: { timeline: null, event: null }, 
                    }, function() { this.handleSelect(this.state.selectedEvent); });
                }
            }
        }
    }

    handleSelectEvent(e) {
        e.preventDefault();
        e.stopPropagation();

        const timeline = $(e.target).closest(".timeline-item").attr("label"),
              event = $(e.target).attr("label"),
              trackPosn = $(e.target).attr("posn"),
              trackedArray = Array(this.state.lines.length).fill(true);

        this.state.lines.forEach(function(line, i) {
            if(line.start > trackPosn || line.end < trackPosn)
                trackedArray[i] = false;
        });

        this.setState({
            selectedEvent: { timeline: timeline, event: event }, 
            trackPosn: trackPosn,
            trackedArray: trackedArray,
        }, function() { this.handleSelect(this.state.selectedEvent); });
    }

    handleClearSelected() {
        this.setState({
            selectedEvent: { timeline: null, event: null, },
            trackPosn: -1,
            trackedArray: Array(this.state.lines.length).fill(true),
        }, function() { this.handleSelect(this.state.selectedEvent); });
    }

    handleZoomIn() {
        const zoom = this.state.zoom;
        this.setState({
            zoom: Math.min(zoom + 0.1, 2),
        });
    }

    handleZoomOut() {
        const zoom = this.state.zoom;
        this.setState({
            zoom: Math.max(1, zoom - 0.1),
        });
    }

    handleScroll(e) {
        if(e.altKey || e.shiftKey) {
            if(e.altKey) {
                if(e.deltaY > 0) this.handleZoomOut(e);
                else this.handleZoomIn(e);
            }
            else if(e.shiftKey) {
                const scrollPosn = this.state.scrollPosn,
                      zoom = this.state.zoom,
                      earliestDate = this.state.earliestDate,
                      latestDate = this.state.latestDate,
                      delta = (e.deltaY < 0 ? -1 : 1)*zoom*this.totalLength()/20;
                this.setState({
                    scrollPosn: Math.min(latestDate - this.totalLength(), Math.max(earliestDate, scrollPosn + delta)),
                });
            }
        }
    }

    render() {
        if(this.state.hasMounted) return this.fullRender();
        else return this.renderLoad();
    }

    renderLoad() {
        return (
            <div className="timeline-container">
                <div className="load-spinner" />
            </div>
        )
    }

    fullRender() {
        const selectedEvent = this.state.selectedEvent,
              earliestDate = this.state.earliestDate + this.state.scrollPosn,
              totalLength = this.totalLength(),
              allDates = this.state.allDates,
              disabledArray = this.state.disabledArray,
              trackCoord = this.trackerCoord(),
              trackPosn = this.state.trackPosn,
              trackedArray = this.state.trackedArray,
              zoom = this.state.zoom,
              scrollPosn = this.state.scrollPosn,

              handleToggleLine = this.handleToggleLine,
              handleTrack = this.handleTrack,
              handleClearSelected = this.handleClearSelected,
              handleZoomIn = this.handleZoomIn,
              handleZoomOut = this.handleZoomOut,
              handleScroll = this.handleScroll,

              linesLeft = $("ul.timeline > li > .line-container").position() !== undefined ?
                $("ul.timeline > li > .line-container").position().left : 0;
                
        allDates.sort((a, b) => a-b);

        return (
            <div className="timeline-container">
                <ul className="timeline" zoomed={this.state.zoom > 1 ? "zoomed" : undefined}
                    onMouseDown={handleTrack} onMouseMove={handleTrack} onWheel={handleScroll}>
                    {
                        trackPosn >= scrollPosn &&
                            <div className="timeline-tracker" posn={trackPosn}
                                 style={{ "left": trackCoord + "px" }} />
                    }
                    <li className="timeline-item ruler-container">
                        <div />
                        <div />
                        <div className="ruler">
                            {
                                allDates.map((posn, i) =>
                                    <div className="rule" posn={posn} key={i}
                                         posnvisible={posn >= scrollPosn ? "posnvisible" : undefined}
                                         style={{ "left": 100*(posn - earliestDate)/totalLength + "%" }} />
                                )
                            }
                        </div>
                    </li>
                    {
                        this.state.lines.map((line, i) =>
                            <li className="timeline-item" label={line.label} key={i}
                                style={{ "color": line.color, }}>
                                <div className="line-label" title={line.label}>{line.label}</div>
                                <input type="checkbox" className="line-toggle"
                                       label={line.label} style={{ "backgroundColor": line.color }}
                                       checked={disabledArray[i] ? undefined : "checked"}
                                       onChange={handleToggleLine}/>
                                <div className="line-container" tracked={trackedArray[i] ? "tracked" : undefined}>
                                    <div className="line"
                                         startvisible={line.start >= scrollPosn ? "startvisible" : undefined}
                                         endvisible={line.end >= scrollPosn ? "endvisible" : undefined}
                                         style={{ "backgroundColor": line.color,
                                                  "left": Math.max(0, 100*(line.start - earliestDate)/totalLength) + "%",
                                                  "width": Math.max(0, 100*(line.end-Math.max(line.start, scrollPosn))/totalLength) + "%" }} />
                                    {
                                        line.events.map((event, j) =>
                                            <div className="line-event" posn={event.posn} label={event.label} key={j}
                                                 posnvisible={event.posn >= scrollPosn ? "posnvisible" : undefined}
                                                 isselected={(line.label===selectedEvent.timeline && event.label===selectedEvent.event) ?
                                                              "isselected" : undefined}
                                                 style={{ "left": 100*(event.posn - earliestDate)/totalLength + "%",
                                                          "backgroundColor": line.color, }} />
                                        )
                                    }
                                </div>
                            </li>
                        )
                    }
                </ul>
                <div className="timeline-bottom">
                    {
                        zoom > 1 &&
                            <div className="timeline-scrollbar">
                                <div className="scrollbar-thumb"
                                    style={{ "left": 100*scrollPosn/(totalLength*zoom) + "%",
                                             "width": "calc(" + 100/zoom + "% - " + linesLeft + "px)",
                                             "marginLeft": linesLeft, }} />
                            </div>
                    }
                    <div className="timeline-controls">
                        <button className="zoom-in" onMouseDown={handleZoomIn}>+</button>
                        <span zoom={Math.round(this.state.zoom*100)}>Zoom</span>
                        <button className="zoom-out" onMouseDown={handleZoomOut}>&minus;</button>
                        {
                            trackPosn >= 0 && (
                                <button className="clear-button" onClick={handleClearSelected}>Clear selected</button>
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Timeline;