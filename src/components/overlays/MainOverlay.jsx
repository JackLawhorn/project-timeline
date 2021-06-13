import React from 'react';
import $ from 'jquery';

import { faArrowRight, faBookOpen, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class MainOverlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            source: props.source,
            selectedTimeline: props.selectedObject.timeline,
            selectedEvent: props.selectedObject.event,

            hasMounted: false,
        };

        this.handleSelect = props.handleSelect;
        
        this.handleGoToProjectRoot = this.handleGoToProjectRoot.bind(this);
        this.handleSelectTimeline = this.handleSelectTimeline.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
    }

    componentDidMount() {
        this.setState({
            hasMounted: true,
        });
    }

    componentWillReceiveProps(props) {
        this.setState({
            source: props.source,
            selectedTimeline: props.selectedObject.timeline,
            selectedEvent: props.selectedObject.event,
        });
    }

    handleGoToProjectRoot(e) {
        this.handleSelect(null);
    }

    handleSelectTimeline(e) {
        let timelineLabel = "";
        if($(e.target).hasClass("timeline-select"))
            timelineLabel = $(e.target).attr("value");
        else
            timelineLabel = $(e.target).closest(".file-view-timeline-item").attr("value");

        this.handleSelect(timelineLabel);
    }

    handleSelectEvent(e) {
        let eventLabel = "";
        if($(e.target).hasClass("event-select"))
            eventLabel = $(e.target).attr("value");
        else
            eventLabel = $(e.target).closest(".file-view-event-item").attr("value");

        this.handleSelect(this.state.selectedTimeline.label, eventLabel);
    }

    render() {
        if(this.state.hasMounted) return this.fullRender();
        else return this.renderLoad();
    }

    renderLoad() {
        return <div></div>
    }

    fullRender() {
        const { source, selectedTimeline, selectedEvent } = this.state,
              handleGoToProjectRoot = this.handleGoToProjectRoot,
              handleSelectTimeline = this.handleSelectTimeline,
              handleSelectEvent = this.handleSelectEvent;
        
        let fileViewList = [],
            selectedObject = selectedEvent ?? selectedTimeline ?? null;
        if(selectedTimeline !== null) fileViewList = selectedTimeline.events;
        else fileViewList = source;

        return (
            <div className="main-overlay">
                <div className="selected-breadcrumbs">
                    <div className="clear-select" onClick={handleGoToProjectRoot}>Project</div>
                    {
                        selectedTimeline !== null &&
                            <FontAwesomeIcon icon={faChevronRight} />
                    }
                    {
                        (selectedTimeline !== null && selectedEvent === null) &&
                            <select className="timeline-select" value={selectedTimeline.label}
                                    onChange={handleSelectTimeline}>
                                {
                                    source.map((line, i) => {
                                        return (<option value={line.label} key={i}>{line.label}</option>)
                                    })
                                }
                            </select>
                    }
                    {
                        (selectedTimeline !== null && selectedEvent !== null) &&
                            <div className="timeline-select" value={selectedTimeline.label}
                                onClick={handleSelectTimeline}>
                                {selectedTimeline.label}
                            </div>
                    }
                    {
                        selectedTimeline !== null && selectedEvent !== null &&
                            <FontAwesomeIcon icon={faChevronRight} />
                    }
                    {
                        selectedTimeline !== null && selectedEvent !== null &&
                            <select className="event-select" value={selectedEvent.label}
                                    onChange={handleSelectEvent}>
                                {
                                    selectedTimeline.events.map((event, i) => {
                                        return (<option value={event.label} key={i}>{event.label}</option>)
                                    })
                                }
                            </select>
                    }
                </div>
                {
                    selectedObject !== null && 
                        <div className="notes-section">
                            <div className="selected-label">{ selectedObject.label }</div>
                            <div className="selected-notes">{ selectedObject.notes }</div>
                        </div>
                }
                {
                    selectedEvent===null &&
                        <div>
                            {/* { selectedTimeline!==null && <hr /> } */}
                            {
                                selectedTimeline!==null && (
                                    <div className="file-view-label">
                                        <b>{ selectedObject.label }</b>'s contents...
                                    </div>)
                            }
                            <table className="file-view">
                                <tbody>
                                    <tr className="file-view-header">
                                        <th className="item-label">Name</th>
                                        <th className="item-type">Type</th>
                                        <th className="item-posn">Position</th>
                                    </tr>
                                    {
                                        fileViewList.map((item, i) =>
                                            <tr className={selectedTimeline === null ? "file-view-timeline-item" : "file-view-event-item"}
                                                value={item.label} key={i}
                                                onClick={selectedTimeline === null ? handleSelectTimeline : handleSelectEvent}>
                                                <td className="item-label"
                                                    style={{ borderColor: item.color || "transparent", }}>
                                                    {item.label}
                                                </td>
                                                <td className="item-posn">{ selectedTimeline === null ? "Timeline" : "Event" }</td>
                                                <td className="item-posn">
                                                    {
                                                        selectedTimeline === null ?
                                                            item.start + " – " + item.end :
                                                            item.posn
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    }
            </div>
        )
    }

}

export default MainOverlay;