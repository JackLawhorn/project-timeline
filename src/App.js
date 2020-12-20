
import React from 'react';

import './App.css';
import './style/style.css';

import lines from './data/test-lines.json'

import SplashScreen from './components/SplashScreen';
import Timeline from './components/Timeline';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lines: lines,
            selectedEvent: { timeline: null, event: null, },
        }
        this.handleLoadFile = this.handleLoadFile.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.fullRender = this.fullRender.bind(this);
        this.renderLoad = this.renderLoad.bind(this);
    }

    componentDidMount() {

    }

    handleLoadFile(json) {
        this.setState({
            lines: JSON.parse(json),
        });
    }

    handleSelect(newSelected) {
        this.setState({
            selectedEvent: newSelected,
        });
    }

    render() {
        if(this.state.lines !== null) return this.fullRender();
        else return this.renderLoad();
    }

    fullRender() {
        const lines = this.state.lines,
              selectedEvent = this.state.selectedEvent;
        var selectedDisplayText = "";
        if(lines !== undefined && selectedEvent.event !== null)
            lines.forEach(function(line, i) {
                line.events.forEach(function(event, j) {
                    if(line.label===selectedEvent.timeline &&
                        event.label===selectedEvent.event)
                        selectedDisplayText = JSON.stringify(line);
                });
            });

        return(
            <div className="App">
                <Timeline lines={lines} selectedEvent={this.state.selectedEvent} handleSelect={this.handleSelect} />
                <div className="blur" />
                <div className="displaySelected">{selectedDisplayText}</div>
            </div>
        )
    }

    renderLoad() {
        return(
            <div className="App">
                <SplashScreen handleLoadFile={this.handleLoadFile} />
            </div>
        )
    }
}

export default App;
