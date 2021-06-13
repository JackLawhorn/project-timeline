import React from 'react';
import $ from 'jquery';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBars, faInfo, faSearch, faTimes, faEye, faEyeSlash, faExpand, faCompress, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen, faClipboard } from '@fortawesome/free-regular-svg-icons';

import MainOverlay from './overlays/MainOverlay';

class Timeline extends React.Component {
    constructor(props) {  
        super(props);

        let source = props.source.concat([]);
        source.forEach(function(line, i) {
            line.events.forEach(function(event, j) {
                event.posn = Math.round(Math.random()*(line.end-line.start) + line.start);
            })
        });

        this.state = {
            source: source,
            selectedTimeline: null,
            selectedEvent: null,
            overlay: "none",
            fullscreen: false,
            
            disabledArray: Array(props.source.length).fill(false),
            trackPosn: -1,
            scrollPosn: 0,
            zoom: 1,
            
            hasMounted: false,
            mouseDown: null,
            readyForTrack: true,

            // Component props
            minWidth: props.minWidth,
            width: props.width,
            maxWidth: props.maxWidth,
            minHeight: props.minHeight,
            height: props.height,
            maxHeight: props.maxHeight,
            aspectRatio: props.aspectRatio,
        };
        
        this.isTracked = this.isTracked.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSelectTimeline = this.handleSelectTimeline.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
        this.handleToggleLine = this.handleToggleLine.bind(this);
        this.handleTrack = this.handleTrack.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.handleDragToZoom = this.handleDragToZoom.bind(this);
        this.handleClearState = this.handleClearState.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSaveToFile = this.handleSaveToFile.bind(this);
        this.handleCopyAsJSON = this.handleCopyAsJSON.bind(this);
    }
    
    componentDidMount() {
        let thisObj = this;
        window.addEventListener('resize', function() {
            const resizeTicker = thisObj.state.resizeTicker;
            thisObj.setState({
                resizeTicker: (resizeTicker ?? 0) + 1,
            });
        });
        this.setState({
            hasMounted: true,
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                        //
    //                                Complex Getter Functions                                //
    //                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Finds the selected Timeline and Event objects from their labels
     * @returns {object} an object containing selectedTimeline and selectedEvent (both defaulting to null)
     */
    get selectedObject() {
        let result = {timeline: null, event: null, };
        const { source, selectedTimeline: selectedTimelineLabel, selectedEvent: selectedEventLabel } = this.state;
        if(selectedTimelineLabel === null) return result;

        result.timeline = source.find((line) => {
            return line.label === selectedTimelineLabel;
        });
        if(selectedEventLabel === null) return result;

        result.event = result.timeline.events.find((event) => {
            return event.label === selectedEventLabel;
        });
        return result;
    }

    /**
     * Returns a sorted array of unique numbers representing the start and end dates of all Timelines
     * @returns {Array<number>} Sorted array of unique numbers representing the start and end dates of all Timelines 
     */
    get allUniqueDates() {
        let datesList = [];
        this.state.source.forEach(function(line) {
            if(!(line.start in datesList)) datesList.push(line.start);
            if(!(line.end in datesList)) datesList.push(line.end);
        });
        datesList.sort((a, b) => a-b);
        return datesList;
    }

    /**
     * Finds the earliest date, latest date, and total length between all Timelines
     * @returns {object} an object containing earliestDate, latestDate, and totalLength
     */
    get boundsAndLength() {
        let earliestDate = undefined,
            latestDate = undefined;
        this.state.source.forEach(function(line) {
            if(earliestDate === undefined) {
                earliestDate = line.start;
                latestDate = line.end;
            }
            else {
                if(line.start < earliestDate) earliestDate = line.start;
                if(line.end > latestDate) latestDate = line.end;
            }
        });

        return {
            earliestDate: earliestDate,
            latestDate: latestDate,
            totalLength: (latestDate-earliestDate),
        }
    }

    /**
     * Translates a position on the timeline to the appropriate position in relation to the DOM 
     * @param {number} posn - the timeline posn to use as a reference
     * @returns {number} the cooresponding x-coordinate of the position in pixels
     */
    posnToCoord(posn) {
        const canvas = $("ul.timeline > .timeline-item > .line-container");
        if(canvas.position() === undefined) return 0;
    
        const component = $(".timeline");
        const { scrollPosn, zoom } = this.state,
            totalLength = this.boundsAndLength.totalLength,
            canvasLeft = canvas.position().left,
            componentLeft = component.position().left,
            paddingOffset = parseInt(canvas.css("padding-left")),
            canvasWidth = canvas.width();

        return (canvasLeft - componentLeft + paddingOffset - 2)     // Base value (lowest possible)
            + canvasWidth*((posn - scrollPosn)/(totalLength/zoom)); // Portion of the canvas SVG's width                                                    // 
    }

    /**
     * Translates a coordinate in relation to the DOM to a position on the timeline 
     * @param {number} coord - the x-coordinate to use as a reference
     * @returns {number} the correspdoning position on the timeline
     */
    coordToPosn(coord) {
        const component = $(".timeline"),
            lineWrapper = $(".timeline > .timeline-item > .line-container > .line-wrapper");
        const { zoom, scrollPosn } = this.state,
              { earliestDate, latestDate, totalLength } = this.boundsAndLength,
              linesLeft = lineWrapper[0].getBoundingClientRect().left,
              componentLeft = component.position().left,
              linesWidth = lineWrapper.width();

        return Math.max(earliestDate, Math.min(latestDate,
            (totalLength/zoom**2)*(coord - (linesLeft - componentLeft))/(linesWidth/zoom) + Math.max(earliestDate, scrollPosn)));
    }

    /**
     * Is the current tracker position within the bounds of the given line? 
     * @param {Object} line - the x-coordinate to use as a reference
     * @returns {boolean} whether the given line is currently tracked
     */
     isTracked(line) {
        const trackPosn = this.state.trackPosn;
        return !(line.start>trackPosn || line.end<trackPosn) || trackPosn===-1;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                        //
    //                                    Timeline Controls                                   //
    //                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * Handles the selecting of Timeline or Event objects
     * @param {string} timelineLabel - the label of the selected Timeline or the Timeline of the selected Object
     * @param {string} eventLabel - the label of the selected Event (defaults to null)
     * @param {string} overlayPipeline - the label of the overlay that should be shown on-selection (defaults to the current overlay)
     * @param {function} callback - the callback that should be called on-selection (defaults to an empty function)
     */
    handleSelect(timelineLabel, eventLabel = null, overlayPipeline = this.state.overlay, callback = () => {}) {
        this.setState({
            selectedTimeline: timelineLabel,
            selectedEvent: eventLabel,
            overlay: overlayPipeline,
        }, callback());
    }
    /**
     * Handles the selection of Timelines
     * @param {event} e - the event that initated the selection; used for identifying the selected Timeline
     * @helper {@link Timeline#handleSelect}
     */
    handleSelectTimeline(e) {
        const timeline = $(e.target).closest(".timeline-item").attr("label");
        this.handleSelect(timeline, null, "main");
    }
    /**
     * Handles the selection of Events
     * @param {event} e - the event that initated the selection; used for identifying the selected Event
     * @helper {@link Timeline#handleSelect}
     */
    handleSelectEvent(e) {
        const timeline = $(e.target).closest(".timeline-item").attr("label"),
              event = $(e.target).attr("label");

        this.handleSelect(timeline, event, "main");
    }

    /**
     * Handles zooming the Timelines view in or out
     * @param {number} delta - the degree, positive or negative, to which the view should be zoomed in
     */
    handleZoom(delta) {
        const { zoom: oldZoom, scrollPosn } = this.state;
        const { totalLength } = this.boundsAndLength,
              newZoom = Math.max(1, Math.min(2, oldZoom + delta));
            
        this.setState({
            zoom: newZoom,
            scrollPosn: Math.max(0, Math.min(totalLength - (totalLength/newZoom), scrollPosn*newZoom/oldZoom)),
        });
    }
    /**
     * Handles zooming the Timelines view in
     * @helper {@link Timeline#handleZoom}
     */
    handleZoomIn = () => this.handleZoom(0.1);
    /**
     * Handles zooming the Timelines view out
     * @helper {@link Timeline#handleZoom}
     */
    handleZoomOut = () => this.handleZoom(-0.1);

    /**
     * Handles zooming in and out by dragging horizontally on the zoom indicator
     * @param {event} e - the event that initated the zoom; used for identifying intended zoom direction
     * @helper {@link Timeline#handleZoomIn}
     * @helper {@link Timeline#handleZoomOut}
     */
    handleDragToZoom(e) {
        if(e.movementX > 0) this.handleZoomIn();
        if(e.movementX < 0) this.handleZoomOut();
    }

    /**
     * Handles the zooming and horizontal scrolling of the Timeline view
     * @param {event} e - the event that initated the scroll; used for identifying intended action
     * @helper {@link Timeline#handleZoomIn}
     * @helper {@link Timeline#handleZoomOut}
     */
    handleScroll(e) {
        if(!e.altKey && !e.shiftKey) return;
        
        if(e.altKey) {
            if(e.deltaY > 0) return this.handleZoomOut(e);
            else return this.handleZoomIn(e);
        }
        else if(e.shiftKey) {
            const { scrollPosn, zoom } = this.state,
                  { earliestDate, latestDate, totalLength } = this.boundsAndLength;
            const delta = (e.deltaY < 0 ? -1 : 1)*totalLength/20;
            
            this.setState({
                scrollPosn: Math.min(latestDate - totalLength/zoom, Math.max(earliestDate, scrollPosn + delta)),
            });
        }
    }

    /**
     * Handles the snapping of the tracker to Events in the Timelines view
     * @param {event} e - the event that initated the tracking; used for identifying the snapped Event
     */
    snapToEvent(e) {
        const timeline = $(e.target).closest(".timeline-item").attr("label"),
              event = $(e.target).attr("label"),
              trackPosn = $(e.target).attr("posn");
            
        this.setState({
            trackPosn: trackPosn,
        }, this.handleSelect(timeline, event));
    }
    /**
     * Handles tracking in the Timelines view
     * @param {event} e - the event that initated the tracking; used for identifying the tracking position
     * @helper {@link Timeline#snapToEvent}
     */
    handleTrack(e) {
        let validEventTypes = ["click", "mousedown", "mousemove", "touchmove"];
        if($(e.target).is(".timeline-bottom *") ||
            validEventTypes.indexOf(e.type) < 0 ||
            (e.type==="touchmove" && !this.state.readyForTrack) ||
            e.buttons !== 1) return;
        if($(e.target).hasClass("line-event")) return this.snapToEvent(e);

        const x = e.type === 'touchmove' ?
                  e.touches[0].clientX :
                  e.clientX;
        
        let trackPosn = this.coordToPosn(x);
        this.setState({
            trackPosn: trackPosn,
            readyForTrack: false,
        }, function() {
            let thisObj = this;
            let setState = () => {thisObj.setState({ readyForTrack: true, })};
            setTimeout(setState, 0);                    
        });
    }

    /**
     * Handles toggling a Timeline on and off in the Timelines view
     * @param {event} e - the event that initated the toggling; used for identifying the toggled Timeline
     */
    handleToggleLine(e) {
        let disabledArray = this.state.disabledArray.concat([]);
        this.state.source.forEach(function(line, i) {
            if(line.label === $(e.target).closest(".timeline-item").attr("label"))
                disabledArray[i] = !disabledArray[i];
        })
        this.setState({
            disabledArray: disabledArray,
        });
    }

    /**
     * Handles reseting the selected Timeline and Event objects, the tracker, and the overlay 
     */
    handleClearState() {
        if(this.state.overlay !== "none") this.closeOverlay();
        else this.setState({
            trackPosn: -1,
            selectedTimeline: null,
            selectedEvent: null,
            zoom: 1,
        });
    }

    /**
     * Handles key presses
     * @param {event} e - the keyboard event; used for identifying the intended action
     */
    handleKeyPress(e) {
        if(e.key === "Escape") {
            if(this.state.fullscreen) this.toggleFullscreen();
            else this.handleClearState();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                        //
    //                                      Menu Methods                                      //
    //                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * Sets the overlay that should be displayed on top of the Timelines view
     * @param {string} overlay - the label of the overlay that should be displayed
     */
    setOverlay(overlay) {
        this.setState({
            overlay: overlay,
        });
    }
    /**
     * Closes the overlay displayed on top of the Timelines view
     * @helper {@link Timeline#setOverlay}
     */
    closeOverlay = () => this.setOverlay("none");
    /**
     * Opens the menu overlay
     * @helper {@link Timeline#setOverlay}
     */
    toggleMenu = () => this.setOverlay(this.state.overlay==="none"?"menu":"none");
    /**
     * Opens the navigation overlay
     * @helper {@link Timeline#setOverlay}
     */
    openNavigation = () => this.setOverlay("main");

    toggleFullscreen = () => this.setState({
        fullscreen: !this.state.fullscreen,
    });
    
    /**
     * Saves the list of Timelines and Events to a .JSON file
     */
    handleSaveToFile() {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state.source)));
        element.setAttribute('download', "timeline.json");       
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * Copies the list of Timelines and Events to the clipboard as a JSON object
     */
    handleCopyAsJSON() {
        let element = document.createElement('input');
        element.setAttribute("type", "text");
        element.value = JSON.stringify(this.state.source);
        document.body.appendChild(element);
        element.select();
        element.setSelectionRange(0, 99999); /* For mobile devices */
        document.execCommand("copy");
        document.body.removeChild(element);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                        //
    //                                     Render Methods                                     //
    //                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Renders the component
     * @helper {@link Timeline#renderLoad}
     * @helper {@link Timeline#fullRender}
     */
    render() {
        if(this.state.hasMounted) return this.fullRender();
        return this.renderLoad();
    }

    /**
     * Renders the unmounted component with a loading animation
     */
    renderLoad() {
        return (
            <div className="timeline-container">
                <div className="load-spinner" />
            </div>
        )
    }

    /**
     * Renders the mounted component
     */
    fullRender() {
              // Get all necessary values from the state
        const { source, selectedTimeline, selectedEvent, overlay, disabledArray, mouseDown, zoom, scrollPosn, trackPosn } = this.state,
              styleProps = {
                  minWidth: this.state.minWidth,
                  width: this.state.width,
                  maxWidth: this.state.maxWidth,
                  minHeight: this.state.minHeight,
                  height: this.state.height,
                  maxHeight: this.state.maxHeight,
                  aspectRatio: this.state.aspectRatio,
              },

              // Get all necessary values from complex getters
              earliestDate = this.boundsAndLength.earliestDate + this.state.scrollPosn,
              totalLength = this.boundsAndLength.totalLength,
              selectedObject = this.selectedObject,
              trackCoord = this.posnToCoord(this.state.trackPosn),
              allUniqueDates = this.allUniqueDates,
              isTracked = this.isTracked,
              
              // Get all necessary timeline control methods
              handleSelect = this.handleSelect,
              handleSelectTimeline = this.handleSelectTimeline,
              handleScroll = this.handleScroll,
              handleDragToZoom = this.handleDragToZoom,
              handleToggleLine = this.handleToggleLine,
              handleTrack = this.handleTrack,
              handleClearState = this.handleClearState,
              handleKeyPress = this.handleKeyPress,
              
              // Get all necessary menu methods
              toggleFullscreen = this.toggleFullscreen,
              closeOverlay = this.closeOverlay,
              toggleMenu = this.toggleMenu,
              openNavigation = this.openNavigation,
              handleSaveToFile = this.handleSaveToFile,
              handleCopyAsJSON = this.handleCopyAsJSON,

              // Get all necessary DOM-based values
              linesLeft = $("ul.timeline > .timeline-item > .line-container").position()?.left ?? 0;
        
        return (
            <div className="timeline-container" theme={"light"} style={styleProps} tabIndex="0"
                 fullscreen={this.state.fullscreen===true?"fullscreen":undefined}
                 onMouseDown={(e) => this.setState({ mouseDown: e.target, })}
                 onMouseUp={(e) => {this.setState({ mouseDown: null, })}}
                 onKeyDown={handleKeyPress} >
                <header className="timeline-container-header">
                    <button className="menu-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={this.state.overlay==="none"?faBars:faArrowLeft} />
                        <span>{this.state.overlay==="none"?"Menu":"Back"}</span>
                    </button>
                    <div className="project-title">Project Timelines</div>
                    <button className="expand-collapse-button" onClick={toggleFullscreen}>
                        <FontAwesomeIcon icon={this.state.fullscreen===true?faCompress:faExpand} />
                        <span>{this.state.fullscreen===true?"Collapse":"Expand"}</span>
                    </button>
                </header>
                <div className="timeline-container-body" onMouseMove={handleTrack}>
                    <div className="overlay-layer" expanded={overlay!=="none" ? "expanded" : undefined}>
                        {
                            overlay !== "none" &&
                                <ul className="menu-overlay">
                                    {/* <li className="search-button" tabIndex={overlay==="none"?"-1":"0"} >
                                        <FontAwesomeIcon icon={faSearch} />
                                        <span>Search</span>
                                    </li> */}
                                    <li className="open-navigation" onClick={openNavigation} tabIndex={overlay==="none"?"-1":"0"} >
                                        <FontAwesomeIcon icon={faFolderOpen} />
                                        <span>Navigation view</span>
                                    </li>
                                    <li className="save-button" onClick={handleSaveToFile} tabIndex={overlay==="none"?"-1":"0"} >
                                        <FontAwesomeIcon icon={faFileDownload} />
                                        <span>Download as file</span>
                                    </li>
                                    <li className="copy-button" onClick={handleCopyAsJSON} tabIndex={overlay==="none"?"-1":"0"} >
                                        <FontAwesomeIcon icon={faClipboard} />
                                        <span>Copy as JSON</span>
                                    </li>
                                    {/* <li className="about-button" tabIndex={overlay==="none"?"-1":"0"} >
                                        <FontAwesomeIcon icon={faInfo} />
                                        <span>About</span>
                                    </li> */}
                                </ul>
                        }
                        {
                            overlay === "main" &&
                                <MainOverlay
                                    source={this.state.source}
                                    selectedObject={selectedObject}
                                    handleSelect={handleSelect} />
                        }
                    </div>
                    <ul className="timeline" dragging={mouseDown!==null ? "dragging" : undefined} onWheel={handleScroll} >
                        <li className="timeline-item ruler-container">
                            <div></div>
                            <div className="ruler">
                                <div className="ruler-wrapper">
                                    {
                                        allUniqueDates.map((posn, i) =>
                                            posn >= scrollPosn &&
                                                <div className="rule" posn={posn} key={i}
                                                    style={{ "left": 100*(posn - earliestDate)/(totalLength/zoom) + "%" }} />
                                        )
                                    }
                                </div>
                            </div>
                        </li>
                        {
                            source.map((line, i) =>
                                <li className="timeline-item" label={line.label} key={i}
                                    disabled={disabledArray[i] ? "disabled" : undefined}
                                    tracked={isTracked(line) ? "tracked" : undefined}>
                                    <div className="line-label" title={line.label}
                                        style={{ "color": line.color }}>
                                        <button className="line-toggle" tabIndex={overlay==="none"?"0":"-1"} onClick={handleToggleLine}>
                                            <FontAwesomeIcon icon={disabledArray[i] ? faEyeSlash : faEye} />
                                        </button>
                                        <button className="line-name" tabIndex={overlay==="none"?"0":"-1"} onClick={handleSelectTimeline}>
                                            <span>{line.label}</span>
                                        </button>
                                    </div>
                                    <div className="line-container">
                                        <div className="line-wrapper">
                                            <svg>
                                                {
                                                    (line.start >= scrollPosn || line.end >= scrollPosn) &&
                                                    <line className="line-main" stroke={line.color} y1="50%" y2="50%"
                                                            x1={Math.max(0, 100*(line.start - earliestDate)/(totalLength/zoom)) + "%"}
                                                            x2={Math.max(0, 100*(line.start - earliestDate)/(totalLength/zoom)) + Math.max(0, 100*(line.end - Math.max(line.start, scrollPosn))/(totalLength/zoom)) + "%"}
                                                        />
                                                    }
                                                {
                                                    line.start >= scrollPosn &&
                                                        <line className="line-end" stroke={line.color} y1="35%" y2="65%"
                                                            x1={Math.max(0, 100*(line.start - earliestDate)/(totalLength/zoom)) + "%"}
                                                            x2={Math.max(0, 100*(line.start - earliestDate)/(totalLength/zoom)) + "%"}
                                                        />
                                                }
                                                {
                                                    line.end >= scrollPosn &&
                                                        <line className="line-end" stroke={line.color} y1="35%" y2="65%"
                                                            x1={Math.max(0, 100*(line.start - earliestDate)/(totalLength/zoom)) + Math.max(0, 100*(line.end - Math.max(line.start, scrollPosn))/(totalLength/zoom)) + "%"}
                                                            x2={Math.max(0, 100*(line.start - earliestDate)/(totalLength/zoom)) + Math.max(0, 100*(line.end - Math.max(line.start, scrollPosn))/(totalLength/zoom)) + "%"}
                                                        />
                                                }
                                                {
                                                    line.events.map((event, j) =>
                                                        event.posn >= scrollPosn &&
                                                            <g key={j}>
                                                                <circle className="line-event" posn={event.posn} label={event.label} tabIndex={!disabledArray[i] && isTracked(line) && overlay==="none" ? "0" : undefined}
                                                                    stroke={line.color} cy="50%" cx={100*(event.posn - earliestDate)/(totalLength/zoom) + "%"}
                                                                    onMouseOver={(e) => !(line.label===selectedTimeline && event.label===selectedEvent) && e.target.setAttribute('r', '0.75em') }
                                                                    onMouseOut={(e) => !(line.label===selectedTimeline && event.label===selectedEvent) && e.target.setAttribute('r', '0.5em') }
                                                                    onClick={this.handleSelectEvent} >
                                                                </circle>
                                                                <line y1="50%" y2="0%"
                                                                    x1={100*(event.posn - earliestDate)/(totalLength/zoom) + "%"}
                                                                    x2={100*(event.posn - earliestDate)/(totalLength/zoom) + "%"} />
                                                                <rect fill="white" height="1.5em" y="-0.75em" rx="0.25em" ry="0.25em"
                                                                    width={`[${event.posn}] ${event.label}`.length + "ch"}
                                                                    x={"calc(" + 100*(event.posn - earliestDate)/(totalLength/zoom) + "% - " + (`[${event.posn}] ${event.label}`.length/2) + "ch)"}
                                                                />
                                                                <text x={100*(event.posn - earliestDate)/(totalLength/zoom) + "%"}
                                                                    dominantBaseline="middle" textAnchor="middle">
                                                                    {`[${event.posn}] ${event.label}`}
                                                                </text>
                                                            </g>
                                                    )
                                                }
                                            </svg>
                                        </div>
                                    </div>
                                </li>
                            )
                        }
                    </ul>
                    {
                        trackPosn >= scrollPosn &&
                            <div className="timeline-tracker" posn={trackPosn}
                                style={{ "left": trackCoord + "px" }} />
                    }
                    <div className="timeline-bottom">
                        <div className="timeline-scrollbar">
                            <div className="scrollbar-thumb"
                                style={{ "left": 100*scrollPosn/(totalLength) + "%",
                                            "width": "calc(" + 100/zoom + "% - " + linesLeft + "px)",
                                            "marginLeft": linesLeft,
                                            "opacity": zoom===1?"0":"1" }} />
                        </div>
                        <div className="timeline-controls">
                            <div></div>
                            {/* <button className="about-button">
                                <FontAwesomeIcon icon={faInfo} />
                                <span>About</span>
                            </button> */}
                            <div className="zoom-info" title="Click and drag or use Alt+Scroll to zoom timelines">
                                <span zoom={Math.round(zoom*100)}
                                    onMouseMove={(e) => this.state.mouseDown && handleDragToZoom(e)}>
                                    <FontAwesomeIcon icon={faSearch} />
                                    <span>{Math.floor(zoom*100) + "%"}</span>
                                </span>
                            </div>
                            {
                                trackPosn >= 0 && (
                                    <button className="clear-button" onClick={handleClearState}>
                                        <FontAwesomeIcon icon={faTimes} />
                                        <span>Clear selected</span>
                                    </button>
                                )
                            }
                            { trackPosn === -1 && <div /> }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Timeline;