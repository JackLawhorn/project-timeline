import React from 'react';

import { TimelineItemList, generateList } from '../bits/TimelineItemList';

class SearchOverlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            source: props.source,
            searchString: "",
            typeFilters: ["timeline", "event"],

            hasMounted: false,
        };

        this.selectHandlers = props.selectHandlers;

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
                if(a.label > b.label || (b.type==="timeline" && a.type==="event"))
                    return 1;
                if(b.label > a.label || (a.type==="timeline" && b.type==="event"))
                    return -1;
                return 0;
            };
        
        
        let results = generateList(this.state.source, timelineFilter, eventFilter, sort);

        return results;
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
            { selectHandlers, handleSearch, handleFilter } = this,
            
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
                <TimelineItemList
                    list={allItems}
                    label="results"
                    showDetails={true}
                    selectHandlers={selectHandlers} />
            </div>
        )
    }
}

export default SearchOverlay;