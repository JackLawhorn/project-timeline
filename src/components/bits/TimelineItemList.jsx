import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, } from '@fortawesome/free-solid-svg-icons';

import Breadcrumbs from './Breadcrumbs';

class TimelineItemList extends React.Component {
    constructor(props) {  
        super(props);

        this.state = {
            list: props.list,
            label: props.label,
            showDetails: props.showDetails,
        };

        this.selectHandlers = props.selectHandlers;
        this.handleSelectProject = this.selectHandlers.handleSelectProject;
        this.handleSelectTimeline = this.selectHandlers.handleSelectTimeline;
        this.handleSelectEvent = this.selectHandlers.handleSelectEvent;

        this.toggleDetails = this.toggleDetails.bind(this);
    }
    
    componentDidMount() {
        
    }

    componentWillReceiveProps(props) {
        this.setState({
            list: props.list,
        })
    }

    toggleDetails(e) {
        const checked = this.state.showDetails;
        this.setState({
            showDetails: !checked,
        });
    }

    render() {
        const showDetails = this.state.showDetails, 
            { selectHandlers, handleSelectTimeline, handleSelectEvent, toggleDetails } = this;

        return (
            <div className="timeline-item-list">
                <header className="list-header">
                    <div className="list-item-count">{`${this.state.list.length} ${this.state.label}...`}</div>
                    <button className="scale-icon list-detail-toggle" onClick={toggleDetails}>
                        <FontAwesomeIcon icon={showDetails?faEye:faEyeSlash} />
                        {` Show details?`}
                    </button>
                </header>
                <ul className="list-body">
                    {
                        this.state.list.map((item, i) =>
                            <li className="list-item" key={i} type={item.type}
                            style={{color: item.type==="timeline"?item.color:"white"}} >
                                <div className="item-summary-cell">
                                    <Breadcrumbs item={item} selectHandlers={selectHandlers} />
                                    <div className="item-label link-button" tabIndex="0"
                                        type={item.type} parent={item.parentLabel} label={item.label}
                                        onClick={item.type==="timeline"?handleSelectTimeline:handleSelectEvent}>
                                        {item.label}
                                    </div>
                                    {
                                        showDetails && <div className="item-notes">{item.notes}</div>
                                    }
                                </div>
                                <div>
                                    { item.type === "event" && <div>{item.posn}</div> }
                                    { item.type === "timeline" && <div>{item.start} &#8211; {item.end}</div> }
                                </div>
                            </li>)
                    }
                </ul>
            </div>
        )
    }
}

function generateList(source = {}, timelineFilter = ()=> true, eventFilter = () => true, sort = (a, b) => 0 ) {
    let results = [];

    source.forEachTimeline(timeline => {
        if(timelineFilter(timeline)) results.push(timeline);
        source.getChildEvents(timeline.label).forEach(event => {
            if(eventFilter(event)) results.push(event);
        });
    });
    

    results.sort(sort);

    return results;
}

export { TimelineItemList, generateList };