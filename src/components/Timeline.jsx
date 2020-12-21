import React from 'react';
import $ from 'jquery';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCopy, faSave } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';

class Timeline extends React.Component {
    constructor(props) {  
        super(props);

        var lines = props.lines.concat([]);
        lines.forEach(function(line, i) {
            line.events.forEach(function(event, j) {
                event.posn = Math.round(Math.random()*(line.end-line.start) + line.start);
            })
        });

        this.state = {
            lines: lines,
            selectedEvent: props.selectedEvent,

            earliestDate: 0,
            latestDate: 0,
            disabledArray: Array(props.lines.length).fill(false),
            
            trackPosn: -1,
            scrollPosn: 0,
            zoom: 1,
            
            resizeTicker: 0,
            hasMounted: false,
            mouseDown: null,
            readyForTrack: true,
        };

        this.handleSelect = props.handleSelect;

        this.totalLength = this.totalLength.bind(this);
        this.trackerCoord = this.trackerCoord.bind(this);
        this.allDates = this.allDates.bind(this);
        this.updateTimeline = this.updateTimeline.bind(this);
        this.handleToggleLine = this.handleToggleLine.bind(this);
        this.handleTrack = this.handleTrack.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
        this.handleClearSelected = this.handleClearSelected.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        
        this.renderLoad = this.renderLoad.bind(this);
        this.fullRender = this.fullRender.bind(this);
    }
    
    componentDidMount() {
        var thisObj = this;
        window.addEventListener('resize', function() {
            const resizeTicker = thisObj.state.resizeTicker;
            thisObj.setState({
                resizeTicker: resizeTicker + 1,
            });
        });

        this.setState({
            hasMounted: true,
        });
        this.updateTimeline();
    }

    totalLength() {
        return (this.state.latestDate-this.state.earliestDate)/this.state.zoom;
    }

    trackerCoord() {
        if($("ul.timeline > .timeline-item > .line-container").position() !== undefined) {
            const linesLeft = $("ul.timeline > .timeline-item > .line-container").position().left,
                  linesWidth = $("ul.timeline > .timeline-item > .line-container").width();
    
            return 10 + linesWidth*(this.state.trackPosn-Math.max(this.state.earliestDate,this.state.scrollPosn))/this.totalLength() + linesLeft;
        }
        else return 0;
    }

    allDates() {
        var allDates = [];

        this.state.lines.forEach(function(line) {
            if(allDates.indexOf(line.start) < 0) allDates.push(line.start);
            if(allDates.indexOf(line.end) < 0) allDates.push(line.end);
        });
        allDates.sort((a, b) => a-b);

        return allDates;
    }

    updateTimeline() {
        var earliestDate = undefined,
            latestDate = undefined;
        this.state.lines.forEach(function(line) {
            if(earliestDate === undefined) {
                earliestDate = line.start;
                latestDate = line.end;
            }
            else {
                if(line.start < earliestDate) earliestDate = line.start;
                if(line.end > latestDate) latestDate = line.end;
            }
        });

        this.setState({
            earliestDate: earliestDate,
            latestDate: latestDate,
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
        var validEventTypes = ["click", "mousedown", "mousemove"];
        if((validEventTypes.indexOf(e.type) >= 0 && e.buttons === 1) ||
           (e.type==="touchmove" && this.state.readyForTrack)) {
            if($(e.target).hasClass("line-event")) this.handleSelectEvent(e);
            else {
                const totalLength = this.totalLength(),
                      earliestDate = this.state.earliestDate,
                      latestDate = this.state.latestDate,
                      zoom = this.state.zoom,
                      scrollPosn = this.state.scrollPosn,
                      
                      linesLeft = $(".timeline > .timeline-item > .line-container > .line-wrapper")[0].getBoundingClientRect().left,
                      linesWidth = $(".timeline > .timeline-item > .line-container > .line-wrapper").width(),
                      linesPadding = 0;

                var trackPosn = this.state.trackPosn + 0,
                    x = -1;
                    
                if(e.type === 'touchmove') x = e.touches[0].clientX;
                else x = e.clientX;

                trackPosn = totalLength/zoom*(x-linesLeft-linesPadding)/(linesWidth/zoom)+Math.max(earliestDate, scrollPosn);
                if(trackPosn >= earliestDate && trackPosn <= latestDate) {
                    this.setState({
                        trackPosn: trackPosn,
                        selectedEvent: { timeline: null, event: null },
                        readyForTrack: false,
                    }, function() {
                        let thisObj = this;
                        let setState = () => {thisObj.setState({ readyForTrack: true, })};
                        setTimeout(setState, 0);                    
                        this.handleSelect(this.state.selectedEvent);
                    });
                }
            }
        }
    }

    handleSelectEvent(e) {
        e.preventDefault();
        e.stopPropagation();

        const timeline = $(e.target).closest(".timeline-item").attr("label"),
              event = $(e.target).attr("label"),
              trackPosn = $(e.target).attr("posn");

        this.setState({
            selectedEvent: { timeline: timeline, event: event }, 
            trackPosn: trackPosn,
        }, function() { this.handleSelect(this.state.selectedEvent); });
    }

    handleClearSelected() {
        this.setState({
            selectedEvent: { timeline: null, event: null, },
            trackPosn: -1,
        }, function() { this.handleSelect(this.state.selectedEvent); });
    }

    handleZoomIn() {
        const totalLength = this.totalLength() * this.state.zoom,
              oldZoom = this.state.zoom + 0,
              scrollPosn = this.state.scrollPosn + 0;
        const newZoom = Math.min(2, oldZoom + 0.1);

        this.setState({
            zoom: newZoom,
            scrollPosn: Math.max(0, Math.min(totalLength - (totalLength/newZoom), scrollPosn*newZoom/oldZoom)),
        });
    }

    handleZoomOut() {
        const totalLength = this.totalLength() * this.state.zoom,
              oldZoom = this.state.zoom + 0,
              scrollPosn = this.state.scrollPosn + 0;
        const newZoom = Math.max(1, oldZoom - 0.1);

        this.setState({
            zoom: newZoom,
            scrollPosn: Math.max(0, Math.min(totalLength - (totalLength/newZoom), scrollPosn*newZoom/oldZoom)),
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

    handleSave() {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state.lines)));
        element.setAttribute('download', "timeline.json");
        
        element.style.display = 'none';
        document.body.appendChild(element);
        
        element.click();
        
        document.body.removeChild(element);
    }

    handleCopy() {
        var element = document.createElement('input');
        element.setAttribute("type", "text");
        element.value = JSON.stringify(this.state.lines);
        document.body.appendChild(element);
        element.select();
        element.setSelectionRange(0, 99999); /* For mobile devices */
        document.execCommand("copy");
        document.body.removeChild(element);
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
              allDates = this.allDates(),
              disabledArray = this.state.disabledArray,
              trackCoord = this.trackerCoord(),
              trackPosn = this.state.trackPosn,
              zoom = this.state.zoom,
              scrollPosn = this.state.scrollPosn,

              handleToggleLine = this.handleToggleLine,
              handleTrack = this.handleTrack,
              handleClearSelected = this.handleClearSelected,
              handleZoomIn = this.handleZoomIn,
              handleZoomOut = this.handleZoomOut,
              handleScroll = this.handleScroll,
              handleSave = this.handleSave,
              handleCopy = this.handleCopy,

              linesLeft = $("ul.timeline > .timeline-item > .line-container").position() !== undefined ?
                $("ul.timeline > .timeline-item > .line-container").position().left : 0;

        return (
            <div className="timeline-container" onWheel={handleScroll}
                 onMouseDown={(e) => this.setState({ mouseDown: e.target, })}
                 onMouseUp={(e) => {this.setState({ mouseDown: null, })}}>
                <ul className="timeline" dragging={this.state.mouseDown !== null ? "dragging" : undefined}
                    foggedleft={zoom > 1 && scrollPosn > 0 ? "foggedleft" : undefined}
                    foggedright={zoom > 1 && scrollPosn < totalLength ? "foggedleft" : undefined}
                    onMouseDown={handleTrack} onMouseMove={handleTrack} onTouchMove={handleTrack}>
                    {
                        trackPosn >= scrollPosn &&
                            <div className="timeline-tracker" posn={trackPosn}
                                 style={{ "left": trackCoord + "px" }}
                            />
                    }
                    <li className="timeline-item ruler-container">
                        <div />
                        <div />
                        <div className="ruler">
                            <div className="ruler-wrapper">
                                {
                                    allDates.map((posn, i) =>
                                        <div className="rule" posn={posn} key={i}
                                                posnvisible={posn >= scrollPosn ? "posnvisible" : undefined}
                                                style={{ "left": 100*(posn - earliestDate)/totalLength + "%" }} />
                                    )
                                }
                            </div>
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
                                <div className="line-container" tracked={!(line.start>trackPosn || line.end<trackPosn) || trackPosn===-1 ? "tracked" : undefined}>
                                    <div className="line-wrapper"
                                         startvisible={line.start >= scrollPosn ? "startvisible" : undefined}
                                         endvisible={line.end <= totalLength*zoom ? "endvisible" : undefined}>
                                        <div className="line"
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
                                </div>
                            </li>
                        )
                    }
                </ul>
                <div className="timeline-bottom">
                    <div className="timeline-scrollbar">
                        <div className="scrollbar-thumb"
                            style={{ "left": 100*scrollPosn/(totalLength*zoom) + "%",
                                        "width": "calc(" + 100/zoom + "% - " + linesLeft + "px)",
                                        "marginLeft": linesLeft, }} />
                    </div>
                    <div className="timeline-controls">
                        <button className="save-button" onClick={handleSave}>
                            <FontAwesomeIcon icon={faSave} />
                            <span>Save file</span>
                        </button>
                        {/* <button className="copy-button" onClick={handleCopy}>
                            <FontAwesomeIcon icon={faCopy} />
                            <span>Copy JSON</span>
                        </button> */}
                        <span title="Use buttons or Alt+Scroll to zoom timelines">
                            <button className="zoom-in" onMouseDown={handleZoomIn}>+</button>
                            <span zoom={Math.round(this.state.zoom*100)}>
                                <FontAwesomeIcon icon={faSearch} />
                                <span>{Math.floor(zoom*100) + "%"}</span>
                            </span>
                            <button className="zoom-out" onMouseDown={handleZoomOut}>&minus;</button>
                        </span>
                        {/* <div /> */}
                        {
                            trackPosn >= 0 && (
                                <button className="clear-button" onClick={handleClearSelected}>
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Clear selected</span>
                                </button>
                            )
                        }
                        { trackPosn === -1 && <div /> }
                    </div>
                </div>
            </div>
        )
    }
}

export default Timeline;