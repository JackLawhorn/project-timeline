import React from 'react';

import './App.css';
import './style/style.css';

import lines from './data/test-lines.json';

import Timeline from './components/Timeline';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedEvent: { timeline: null, event: null, },
        }
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {

    }

    handleSelect(newSelected) {
        this.setState({
            selectedEvent: newSelected,
        });
    }

    render() {
        const selectedEvent = this.state.selectedEvent;
        var selectedDisplayText = "";
        if(lines !== undefined && selectedEvent.event !== null)
            lines.forEach(function(line, i) {
                line.events.forEach(function(event, j) {
                    if(line.label===selectedEvent.timeline &&
                        event.label===selectedEvent.event)
                        selectedDisplayText = JSON.stringify(line);
                });
            });

        return (
            <div className="App">
                <Timeline lines={lines} selectedEvent={this.state.selectedEvent} handleSelect={this.handleSelect} />
                <div className="displaySelected">{selectedDisplayText}</div>
            </div>
        );
    }
}

export default App;
