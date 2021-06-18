import React from 'react';

import { TimelineItemList, generateList } from '../bits/TimelineItemList';
import Breadcrumbs from '../bits/Breadcrumbs';

class MainOverlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            source: props.source,
            selectedTimeline: props.selectedObject.timeline,
            selectedEvent: props.selectedObject.event,

            hasMounted: false,
        };

        this.selectHandlers = props.selectHandlers;
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
            sort = (a, b) => (a.start ?? a.posn) > (b.start ?? b.posn);
        
        if(selectedTimeline === undefined)
            return generateList(this.state.source, () => true, () => false, sort);
        else if(selectedTimeline !== undefined && selectedEvent === undefined)
            return generateList(this.state.source, () => false, (event) => event.timelines.indexOf(selectedTimeline.label) >= 0, sort);
        return [];
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
              selectHandlers = this.selectHandlers;
        
        let allChildren = this.getAllChildren,
            selectedObject = source.get(selectedTimeline?.label, selectedEvent?.label);

        return (
            <div className="main-overlay">
                {
                    selectedObject.type !== "project" &&
                        <Breadcrumbs item={source.get(selectedTimeline?.label, selectedEvent?.label)}
                            selectHandlers={selectHandlers} /> 
                }
                <div className="notes-section">
                    <div className="selected-label">{ selectedObject.label }</div>
                    <div className="selected-notes">{ selectedObject.notes }</div>
                </div>
                <div className="hr" />
                {
                    selectedEvent === undefined &&
                        <TimelineItemList
                            list={allChildren}
                            label="children"
                            showDetails={false}
                            selectHandlers={selectHandlers} /> }
            </div>
        )
    }

}

export default MainOverlay;