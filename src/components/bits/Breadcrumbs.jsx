import React from 'react';

import { faChevronRight, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Breadcrumbs extends React.Component {
    constructor(props) {  
        super(props);

        this.state = {
            item: props.item,
        };

        this.selectHandlers = props.selectHandlers;
        this.handleSelectProject = this.selectHandlers.handleSelectProject;
        this.handleSelectTimeline = this.selectHandlers.handleSelectTimeline;
        this.handleSelectEvent = this.selectHandlers.handleSelectEvent;
    }
    
    componentDidMount() {
        
    }

    componentWillReceiveProps(props) {
        this.setState({
            item: props.item,
        })
    }

    render() {
        const item = this.state.item, 
            { handleSelectProject, handleSelectTimeline } = this;

        return (
            <div className="parent-label">
                <span className="link-button" tabIndex="0" onClick={handleSelectProject}>
                    <FontAwesomeIcon icon={faHashtag} />
                    PROJECT
                </span>
                <FontAwesomeIcon icon={faChevronRight} />

                {
                    item.type === "event" &&
                        <span className="link-button" tabIndex="0" label={item.parentLabel}
                            style={{color: item.color}}
                            onClick={handleSelectTimeline}>
                            {item.parentLabel}
                        </span>
                }
                {
                    item.type === "event" && <FontAwesomeIcon icon={faChevronRight} />
                }
            </div>
        )
    }
}

export default Breadcrumbs;