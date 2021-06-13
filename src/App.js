
import React from 'react';

import './App.css';
import './style/style.css';

import source from './data/test-lines.json'
import Timeline from './components/Timeline';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            source: source,
        };
        this.handleLoadFile = this.handleLoadFile.bind(this);
    }

    componentDidMount() {

    }

    handleLoadFile(json) {
        this.setState({
            lines: JSON.parse(json),
        });
    }

    render() {
        const lines = this.state.lines;

        if(lines !== null)
            return (
                <div className="App">
                    <Timeline source={source} />
                </div>
            );
        else return(
            <div className="App" />
        );
    }
}

export default App;
