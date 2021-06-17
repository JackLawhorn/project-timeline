import React from 'react';
import $ from 'jquery';

import { TimelineItemList, generateList } from '../TimelineItemList';

class SearchOverlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            source: props.source,
            searchString: "",
            typeFilters: ["timeline", "event"],

            hasMounted: false,
        };

        this.handleSelect = props.handleSelect;

        this.handleSelectTimeline = this.handleSelectTimeline.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
    }

    componentDidMount() {
        this.setState({
            hasMounted: true,
        });
    }

    componentWillReceiveProps(props) {
        this.setState({
            source: props.source,
        });
    }

    get getAllItems() {
        const searchString = this.state.searchString.toLowerCase(),
            timelineFilter = timeline =>
                timeline.label.toLowerCase().indexOf(searchString) >= 0 ||
                timeline.notes.toLowerCase().indexOf(searchString) >= 0,
            eventFilter = event =>
                event.timelines.join("").toLowerCase().indexOf(searchString) >= 0 ||
                event.label.toLowerCase().indexOf(searchString) >= 0 ||
                event.notes.toLowerCase().indexOf(searchString) >= 0,
            sort = (a, b) => {
                if(a.obj.label > b.obj.label || (b.type==="timeline" && a.type==="event"))
                    return 1;
                if(b.obj.label > a.obj.label || (a.type==="timeline" && b.type==="event"))
                    return -1;
                return 0;
            };
        
        
        let results = generateList(this.state.source, timelineFilter, eventFilter, sort);

        return results;
    }

    handleSelectTimeline(e) {
        let timelineLabel = "";
        timelineLabel = $(e.target).closest(".search-results-item").attr("timelinelabel");

        this.handleSelect(timelineLabel, null, "main");
    }

    handleSelectEvent(e) {
        let timelineLabel = "",
            eventLabel = "";
        timelineLabel = $(e.target).closest(".search-results-item").attr("timelinelabel");
        eventLabel = $(e.target).closest(".search-results-item").attr("eventlabel");

        this.handleSelect(timelineLabel, eventLabel, "main");
    }

    handleSearch(e) {
        this.setState({searchString: e.target.value});
    }

    handleFilter(e) {
        const val = e.target.value;
        
        let types = ["timeline", "event"];
        if(val === "Timelines only") types = ["timeline"];
        if(val === "Events only") types = ["event"];

        this.setState({typeFilters: types});

        this.forceUpdate();
    }

    render() {
        if(this.state.hasMounted) return this.fullRender();
        else return this.renderLoad();
    }

    renderLoad() {
        return <div></div>
    }

    fullRender() {
        const { searchString, typeFilters } = this.state,
            { handleSelect, handleSearch, handleFilter } = this,
            
            allItems = this.getAllItems.filter(item => {
                return typeFilters.indexOf(item.type) >= 0
            });
        
        return (
            <div className="search-overlay">
                <datalist id="results">
                    {
                        allItems.map((item, i) => <option key={i} value={item.label} />)
                    }
                </datalist>
                <div className="search-controls">
                    <input className="search-field"
                        name="search-field" list="results"
                        value={searchString} placeholder="Search..."
                        onChange={handleSearch} />
                    <select className="search-filter" onChange={handleFilter}>
                        <option value="Timelines & Events">Timelines & Events</option>
                        <option value="Timelines only">Timelines only</option>
                        <option value="Events only">Events only</option>
                    </select>
                </div>
                <TimelineItemList list={allItems} handleSelect={handleSelect} label="results" />
            </div>
        )
    }
}

export default SearchOverlay;