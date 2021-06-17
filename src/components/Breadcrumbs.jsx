import React from 'react';

import { faChevronRight, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Breadcrumbs extends React.Component {
    constructor(props) {  
        super(props);

        this.state = {
            item: props.item,
        };

        this.handleSelect = props.handleSelect;
        this.handleSelectTimeline = props.handleSelectTimeline;
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
            handleSelectTimeline = this.handleSelectTimeline,
            goToRoot = () => this.handleSelect(null, null, "main");


        return (
            <div className="parent-label">
                <span className="link-button" onClick={goToRoot}>
                    <FontAwesomeIcon icon={faHashtag} />
                    PROJECT
                </span>
                <FontAwesomeIcon icon={faChevronRight} />

                {
                    item.type === "event" &&
                        <span className="link-button" timeline={item.timeline}
                            style={{color: item.color}}
                            onClick={handleSelectTimeline}>
                            {item.timeline}
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