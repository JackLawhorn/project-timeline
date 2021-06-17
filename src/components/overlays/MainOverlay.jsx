import React from 'react';
import $ from 'jquery';

import { TimelineItemList, generateList, translateItem } from '../TimelineItemList';
import Breadcrumbs from '../Breadcrumbs';

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

    get getAllChildren() {
        const { selectedTimeline, selectedEvent, } = this.state,
            sort = (a, b) => a > b;

        console.log(selectedTimeline);
        
        if(selectedTimeline === null)
            return generateList(this.state.source, () => true, () => false, sort);
        else if(selectedTimeline !== null && selectedEvent === null)
            return generateList(this.state.source, () => false, (event) => event.timelines.indexOf(selectedTimeline.label) >= 0, sort);
    }

    handleGoToProjectRoot(e) {
        this.handleSelect(null);
    }

    handleSelectTimeline(e) {
        let timelineLabel = $(e.target).closest("[timeline]").attr("timeline");

        this.handleSelect(timelineLabel);
    }

    handleSelectEvent(e) {
        let eventLabel = "";
        if($(e.target).hasClass("event-select"))
            eventLabel = $(e.target).attr("value");
        else
            eventLabel = $(e.target).closest(".list-item").attr("value");

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
        const { selectedTimeline, selectedEvent } = this.state,
              handleSelect = this.handleSelect,
              handleSelectTimeline = this.handleSelectTimeline;
        
        let allChildren = this.getAllChildren,
            selectedObject = this.state.selectedEvent ?? this.state.selectedTimeline ?? this.state.source;
        if(selectedTimeline !== null) selectedObject.timeline = selectedTimeline.label;

        return (
            <div className="main-overlay">
                {
                    selectedObject.type !== "project" &&
                        <Breadcrumbs item={translateItem(selectedObject, selectedTimeline)}
                            handleSelect={handleSelect}
                            handleSelectTimeline={handleSelectTimeline} /> 
                }
                <div className="notes-section">
                    <div className="selected-label">{ selectedObject.label }</div>
                    <div className="selected-notes">{ selectedObject.notes }</div>
                </div>
                <div className="hr" />
                {
                    selectedEvent===null &&
                        <TimelineItemList
                            list={allChildren}
                            label="children"
                            handleSelect={handleSelect} /> }
            </div>
        )
    }

}

export default MainOverlay;