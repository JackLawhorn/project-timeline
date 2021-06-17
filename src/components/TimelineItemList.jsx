import React from 'react';
import $ from 'jquery';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, } from '@fortawesome/free-solid-svg-icons';

import Breadcrumbs from './Breadcrumbs';

class TimelineItemList extends React.Component {
    constructor(props) {  
        super(props);

        this.state = {
            list: props.list,
            label: props.label,
            showDetails: true,
        };

        this.handleSelect= props.handleSelect;
        this.handleSelectTimeline = this.handleSelectTimeline.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
        this.toggleDetails = this.toggleDetails.bind(this);
    }
    
    componentDidMount() {
        
    }

    componentWillReceiveProps(props) {
        this.setState({
            list: props.list,
        })
    }

    handleSelectTimeline(e) {
        let timelineLabel = "";
        timelineLabel = $(e.target).closest(".list-item").attr("timelinelabel");

        this.handleSelect(timelineLabel, null, "main");
    }

    handleSelectEvent(e) {
        let timelineLabel = "",
            eventLabel = "";
        timelineLabel = $(e.target).closest(".list-item").attr("timelinelabel");
        eventLabel = $(e.target).closest(".list-item").attr("eventlabel");

        this.handleSelect(timelineLabel, eventLabel, "main");
    }

    toggleDetails(e) {
        const checked = this.state.showDetails;
        this.setState({
            showDetails: !checked,
        });
    }

    render() {
        const showDetails = this.state.showDetails, 
            { handleSelect, handleSelectTimeline, handleSelectEvent, toggleDetails } = this;

        return (
            <div className="timeline-item-list">
                <header className="list-header">
                    <div className="list-item-count">{`${this.state.list.length} ${this.state.label}...`}</div>
                    <button className="list-detail-toggle" onClick={toggleDetails}>
                        <FontAwesomeIcon icon={showDetails?faEye:faEyeSlash} />
                        {` Show details?`}
                    </button>
                </header>
                <ul className="list-body">
                    {
                        this.state.list.map((item, i) =>
                            <li className="list-item" key={i} tabIndex="0"
                                timelinelabel={item.timeline} eventlabel={item.event}>
                                <div className="item-summary-cell"
                                    style={{borderLeftColor: item.type==="timeline"?item.color:"transparent"}}>
                                    <Breadcrumbs item={item}
                                        handleSelect={handleSelect}
                                        handleSelectTimeline={handleSelectTimeline} />
                                    <div className="item-label link-button"
                                        onClick={item.type==="timeline"?handleSelectTimeline:handleSelectEvent}>
                                        {item.label}
                                    </div>
                                    {
                                        showDetails && <div className="item-notes">{item.blurb}</div>
                                    }
                                </div>
                                <div>
                                    {
                                        item.type === "timeline" &&
                                            <div>
                                                {item.start} &#8211; {item.end}
                                            </div>
                                    }
                                </div>
                            </li>)
                    }
                </ul>
            </div>
        )
    }
}

function generateList(source = [], timelineFilter = ()=> true, eventFilter = () => true, sort = (a, b) => 0 ) {
    let results = [];

    Object.values(source.timelines).forEach(timeline => {
        if(timelineFilter(timeline))
            results.push(translateTimeline(timeline));
        Object.values(source.events).filter(
            event => event.timelines.indexOf(timeline.label) >= 0
        ).forEach(event => {
            if(eventFilter(event))
                results.push(translateEvent(event, timeline));
        });
    });
    

    results.sort(sort);

    return results;
}

function translateItem(item, timeline) {
    if(item.type === "timeline") return translateTimeline(item);
    else return translateEvent(item, timeline);
}

function translateTimeline(timeline) {
    return {
        type: "timeline",
        timeline: timeline.label,
        event: undefined,
        label: timeline.label,
        blurb: timeline.notes,
        start: timeline.start,
        end: timeline.end,
        obj: timeline,
        color: timeline.color,
    }
}

function translateEvent(event, timeline) {
    return {
        type: "event",
        timeline: timeline.label,
        event: event.label,
        label: event.label,
        blurb: event.notes,
        obj: event,
        color: timeline.color,
    }
}

export { TimelineItemList, generateList, translateItem };