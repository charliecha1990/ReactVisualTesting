/* global Plotly:true */

import React, { Component } from 'react';

import fetch from 'isomorphic-fetch';
import ReactJSONEditor from './components/ReactJSONEditor.react.js';
import Select from 'react-select';
import SplitPane from 'react-split-pane';

import createPlotlyComponent from 'react-plotly.js/factory'

import './App.css';
import './styles/Resizer.css';

/* JSON Editor styling */
import './styles/autocomplete.css';
import './styles/contextmenu.css';
import './styles/jsoneditor.css';
import './styles/menu.css';
import './styles/reset.css';
import './styles/searchbox.css';

import 'react-select/dist/react-select.css';

const Plot = createPlotlyComponent(Plotly);

class App extends Component {

    constructor(props) {
        super(props);

        this.handleJsonChange = this.handleJsonChange.bind(this);
        this.getPlots = this.getPlots.bind(this);
        this.handleNewPlot = this.handleNewPlot.bind(this);

        
        const plotJSON = {
            data: [{
                    x: ['BMW','Audi','Ford','Lexus'],
                    y: ['Manual', 'Auto', 'Automatic','Auto' ],
                    type: 'scatter',
                    marker: { color: 'rgb(17, 157, 255)', size: 14, symbol: 'x'},
                    name: '0',
                    mode: 'markers'
                },{
                    x: ['BMW','Audi','Ford','Lexus'],
                    y: ['Auto', 'Manual', 'Auto','Automatic' ],
                    type: 'scatter',
                    marker: { line: { color: 'rgb(219, 64, 82)', width: 1} , color: 'white', size: 14},
                    name: '(0,10)',
                    mode: 'markers'

                },{
                    x: ['BMW','Audi','Ford','Lexus'],
                    y: ['Automatic', 'Automatic', 'Manual','Manual' ],
                    type: 'scatter',
                    marker: {color: 'rgb(219, 64, 82)', size: 12},
                    name: '>=10 ',
                    mode: 'markers'
                }
            ],
            layout: {
                plotBackground: '#f3f6fa',
                margin: {t: 100, r: 20, l: 60, b: 30},
                xaxis: {
                    range: ["BMW", "Audi", "Lexus",'Ford']
                },
                yaxis: {
                    range: ['Auto', 'Manual','Automatic' ]
                },
                title: "XXX Inventory 0f 2020"
            }
        };

        this.state = {
            json: plotJSON,
            plotUrl: ''
        };
    }
    
    handleJsonChange = newJSON => {
        this.setState({json: newJSON});
    }

    handleNewPlot = option => {
        let url = '';
        if ('value' in option) {
            url = option.value;
        }
        else if ('target' in option) {
            url = option.target.value;
            if (url.includes('http')) {
                if (!url.includes('.json')) {
                    url = url + '.json'
                }
            }
        }

        if(url) {
            fetch(url)
            .then((response) => response.json())
            .then((newJSON) => {
                if ('layout' in newJSON) {    
                    if ('height' in newJSON.layout) {
                        newJSON.layout.height = null;
                    }
                    if ('width' in newJSON.layout) {
                        newJSON.layout.width = null;
                    }
                }
                this.setState({
                    json: newJSON,
                    plotUrl: url
                });
            });
        }
    }
    
    getPlots = (input) => {
        if (!input) {
			return Promise.resolve({ options: [] });
		}

        let urlToFetch = `https://api.plot.ly/v2/search?q=${input}`;
        
		return fetch(urlToFetch)
		    .then((response) => response.json())
		    .then((json) => {
			    return { options: json.files.map(function(o) {
                    return {
                        label: `${o.filename} by ${o.owner}, ${o.views} views`,
                        value: o.web_url.replace(/\/$/, "") + '.json'
                    };
                })};
		    });
    };

    getMocks = () => {
		return fetch('https://api.github.com/repositories/45646037/contents/test/image/mocks')
		    .then((response) => response.json())
		    .then((json) => {
			    return {
                    complete: true,
                    options: json.map(function(o) {
                        return {
                            label: o.name,
                            value: o.download_url
                        };
                    })
                };
		    });
    };
    
    render() {

        let searchPlaceholder = 'Search charts on plot.ly by topic -- e.g. "GDP"';

        const plotInputPlaceholder = 'Link to plot JSON';

        let footnoteStyle = {
            fontSize: '12px',
            textAlign: 'left',
            width: '300px',
            overflowWrap: 'break-word',
            margin: '10px'
        }
        
        return (
            <div className="App">
                <SplitPane split="vertical" minSize={100} defaultSize={400}>
                    <div>
                        <div className='controls-panel'>
                           <Select.Async
                                name="plotlyjs-mocks"
                                loadOptions={this.getMocks}
                                placeholder={'Search plotly.js mocks'}
                                onChange={this.handleNewPlot}
                                className={'no-select'}
                           />
                       </div>
                       <ReactJSONEditor
                           json={this.state.json}
                           onChange={this.handleJsonChange}
                           plotUrl={this.state.plotUrl}
                       />                  
                    </div>                         
                    <div>
                       <div className='controls-panel'>
                            <Select.Async
                                name="plot-search-bar"
                                loadOptions={this.getPlots}
                                placeholder={searchPlaceholder}
                                onChange={this.handleNewPlot}
                                ref="plotSearchBar"
                                cache={false}
                                className={'no-select'}            
                            />
                            <br/>
                            <input
                                placeholder={plotInputPlaceholder}
                                onBlur={this.handleNewPlot}
                                style={{padding:'10px', width:'95%', border:0}}
                                value={this.state.plotUrl}
                                className={'no-select'}
                            />
                        </div>
                        <Plot
                            data={this.state.json.data}
                            layout={this.state.json.layout}
                            config={{displayModeBar: true}}
                        />
                    </div>
                </SplitPane>
            </div>
        );
    }
}

export default App;
