import React from 'react';
import $ from 'jquery';

class SplashScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            files: "",
        }
        this.handleLoadFile = props.handleLoadFile;
        this.loadFile = this.loadFile.bind(this);
        this.newFile = this.newFile.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
    
    }

    loadFile(e) {
        $("#file-input").click();
    }

    newFile() {
        this.setState({
            files: "[]",
        }, function() { this.handleLoadFile(this.state.files); });
    }

    handleChange(e) {
        var history = this.state.history;

        const fileReader = new FileReader();        
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            this.setState({
                files: e.target.result,
            }, function() {

                this.handleLoadFile(this.state.files);
            });
        };
    }
  
    render() {
        return (
            <div className="splash-screen">
                <h1>Timeline</h1>
                <p>Timeline is a notes app for time-based projects.</p>

                <div className="new-file-prompt">
                    <h1>Create new file</h1>
                    <button onClick={this.newFile}>Start</button>
                </div>
                <div className="load-file-prompt">
                    <h1>Load from file</h1>
                    <input type="file" id="file-input" onChange={this.handleChange} />
                    <button onClick={this.loadFile}>Choose file</button>
                </div>
            </div>
        )
    }
}

export default SplashScreen;