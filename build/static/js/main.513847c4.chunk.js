(this["webpackJsonpproject-timeline"]=this["webpackJsonpproject-timeline"]||[]).push([[0],{15:function(e){e.exports=JSON.parse('[{"label":"Timeline A","start":0,"end":50,"color":"crimson","events":[{"label":"Event A"}]},{"label":"Timeline B","start":25,"end":75,"color":"cornflowerblue","events":[{"label":"Event B"}]},{"label":"Timeline C","start":50,"end":100,"color":"gold","events":[{"label":"Event C"}]},{"label":"Timeline D","start":12.5,"end":37.5,"color":"forestgreen","events":[{"label":"Event D"}]},{"label":"Timeline E","start":37.5,"end":62.5,"color":"MediumVioletRed ","events":[{"label":"Event E"}]},{"label":"Timeline F","start":62.5,"end":87.5,"color":"orangered","events":[{"label":"Event F"}]}]')},22:function(e,t,n){},23:function(e,t,n){},24:function(e,t,n){},30:function(e,t,n){"use strict";n.r(t);var l=n(0),a=n(4),i=n.n(a),s=n(14),o=n.n(s),c=(n(22),n(5)),r=n(6),d=n(2),h=n(8),u=n(7),b=(n(23),n(24),n(15)),v=n(3),j=n.n(v),m=function(e){Object(h.a)(n,e);var t=Object(u.a)(n);function n(e){var l;return Object(c.a)(this,n),(l=t.call(this,e)).state={files:""},l.handleLoadFile=e.handleLoadFile,l.loadFile=l.loadFile.bind(Object(d.a)(l)),l.newFile=l.newFile.bind(Object(d.a)(l)),l.handleChange=l.handleChange.bind(Object(d.a)(l)),l}return Object(r.a)(n,[{key:"componentDidMount",value:function(){}},{key:"loadFile",value:function(e){j()("#file-input").click()}},{key:"newFile",value:function(){this.setState({files:"[]"},(function(){this.handleLoadFile(this.state.files)}))}},{key:"handleChange",value:function(e){var t=this,n=(this.state.history,new FileReader);n.readAsText(e.target.files[0],"UTF-8"),n.onload=function(e){t.setState({files:e.target.result},(function(){this.handleLoadFile(this.state.files)}))}}},{key:"render",value:function(){return Object(l.jsxs)("div",{className:"splash-screen",children:[Object(l.jsx)("h1",{children:"Timeline"}),Object(l.jsx)("p",{children:"Timeline is a notes app for time-based projects."}),Object(l.jsxs)("div",{className:"new-file-prompt",children:[Object(l.jsx)("h1",{children:"Create new file"}),Object(l.jsx)("button",{onClick:this.newFile,children:"Start"})]}),Object(l.jsxs)("div",{className:"load-file-prompt",children:[Object(l.jsx)("h1",{children:"Load from file"}),Object(l.jsx)("input",{type:"file",id:"file-input",onChange:this.handleChange}),Object(l.jsx)("button",{onClick:this.loadFile,children:"Choose file"})]})]})}}]),n}(i.a.Component),f=n(9),O=n(13),p=n(16),x=function(e){Object(h.a)(n,e);var t=Object(u.a)(n);function n(e){var l;return Object(c.a)(this,n),(l=t.call(this,e)).state={lines:e.lines,selectedEvent:e.selectedEvent,earliestDate:0,latestDate:0,allDates:[],disabledArray:Array(e.lines.length).fill(!1),trackPosn:-1,trackedArray:Array(e.lines.length).fill(!0),hasMounted:!1,zoom:1,scrollPosn:0,resizeTicker:0,mouseDown:!1},l.handleSelect=e.handleSelect,l.totalLength=l.totalLength.bind(Object(d.a)(l)),l.trackerCoord=l.trackerCoord.bind(Object(d.a)(l)),l.updateTimeline=l.updateTimeline.bind(Object(d.a)(l)),l.handleToggleLine=l.handleToggleLine.bind(Object(d.a)(l)),l.handleTrack=l.handleTrack.bind(Object(d.a)(l)),l.handleSelectEvent=l.handleSelectEvent.bind(Object(d.a)(l)),l.handleClearSelected=l.handleClearSelected.bind(Object(d.a)(l)),l.handleZoomIn=l.handleZoomIn.bind(Object(d.a)(l)),l.handleZoomOut=l.handleZoomOut.bind(Object(d.a)(l)),l.handleScroll=l.handleScroll.bind(Object(d.a)(l)),l.renderLoad=l.renderLoad.bind(Object(d.a)(l)),l.fullRender=l.fullRender.bind(Object(d.a)(l)),l}return Object(r.a)(n,[{key:"componentDidMount",value:function(){var e=this.state.lines.concat([]);this.state.lines.forEach((function(e,t){e.events.forEach((function(t,n){t.posn=Math.round(Math.random()*(e.end-e.start)+e.start)}))}));var t=this;window.addEventListener("resize",(function(){var e=t.state.resizeTicker+0;t.setState({resizeTicker:e+1})})),this.setState({lines:e,hasMounted:!0}),this.updateTimeline()}},{key:"totalLength",value:function(){return(this.state.latestDate-this.state.earliestDate)/this.state.zoom}},{key:"trackerCoord",value:function(){if(void 0!==j()("ul.timeline > li > .line-container").position()){var e=j()("ul.timeline > li > .line-container").position().left;return j()("ul.timeline > li > .line-container").width()*(this.state.trackPosn-Math.max(this.state.earliestDate,this.state.scrollPosn))/this.totalLength()+e}return 0}},{key:"updateTimeline",value:function(){var e=void 0,t=void 0,n=[];this.state.lines.forEach((function(l){void 0===e?(e=l.start,t=l.end):(l.start<e&&(e=l.start),l.end>t&&(t=l.end)),n.indexOf(l.start)<0&&n.push(l.start),n.indexOf(l.end)<0&&n.push(l.end)})),this.setState({earliestDate:e,latestDate:t,allDates:n})}},{key:"handleToggleLine",value:function(e){var t=this.state.disabledArray.concat([]);this.state.lines.forEach((function(n,l){n.label===e.target.parentElement.getAttribute("label")&&(t[l]=!t[l])})),this.setState({disabledArray:t})}},{key:"handleTrack",value:function(e){if(1===e.buttons||"click"===e.type)if(j()(e.target).hasClass("line-event"))this.handleSelectEvent(e);else{var t=this.totalLength(),n=this.state.earliestDate,l=this.state.zoom,a=this.state.scrollPosn,i=e.clientX,s=j()("ul.timeline > li > .line-container").position().left,o=j()("ul.timeline > li > .line-container").width(),c=this.state.trackPosn+0,r=Array(this.state.lines.length).fill(!0);i-s-15>=0&&(c=t/l*(i-s-15)/(o/l)+Math.max(n,a),this.state.lines.forEach((function(e,t){(e.start>c||e.end<c)&&(r[t]=!1)})),this.setState({trackPosn:c,trackedArray:r,selectedEvent:{timeline:null,event:null}},(function(){this.handleSelect(this.state.selectedEvent)})))}}},{key:"handleSelectEvent",value:function(e){e.preventDefault(),e.stopPropagation();var t=j()(e.target).closest(".timeline-item").attr("label"),n=j()(e.target).attr("label"),l=j()(e.target).attr("posn"),a=Array(this.state.lines.length).fill(!0);this.state.lines.forEach((function(e,t){(e.start>l||e.end<l)&&(a[t]=!1)})),this.setState({selectedEvent:{timeline:t,event:n},trackPosn:l,trackedArray:a},(function(){this.handleSelect(this.state.selectedEvent)}))}},{key:"handleClearSelected",value:function(){this.setState({selectedEvent:{timeline:null,event:null},trackPosn:-1,trackedArray:Array(this.state.lines.length).fill(!0)},(function(){this.handleSelect(this.state.selectedEvent)}))}},{key:"handleZoomIn",value:function(){var e=this.totalLength()*this.state.zoom,t=this.state.zoom+0,n=this.state.scrollPosn+0,l=Math.min(2,t+.1);this.setState({zoom:l,scrollPosn:Math.max(0,Math.min(e-e/l,n*l/t))})}},{key:"handleZoomOut",value:function(){var e=this.totalLength()*this.state.zoom,t=this.state.zoom+0,n=this.state.scrollPosn+0,l=Math.max(1,t-.1);this.setState({zoom:l,scrollPosn:Math.max(0,Math.min(e-e/l,n*l/t))})}},{key:"handleScroll",value:function(e){if(e.altKey||e.shiftKey)if(e.altKey)e.deltaY>0?this.handleZoomOut(e):this.handleZoomIn(e);else if(e.shiftKey){var t=this.state.scrollPosn,n=this.state.zoom,l=this.state.earliestDate,a=this.state.latestDate,i=(e.deltaY<0?-1:1)*n*this.totalLength()/20;this.setState({scrollPosn:Math.min(a-this.totalLength(),Math.max(l,t+i))})}}},{key:"render",value:function(){return this.state.hasMounted?this.fullRender():this.renderLoad()}},{key:"renderLoad",value:function(){return Object(l.jsx)("div",{className:"timeline-container",children:Object(l.jsx)("div",{className:"load-spinner"})})}},{key:"fullRender",value:function(){var e=this,t=this.state.selectedEvent,n=this.state.earliestDate+this.state.scrollPosn,a=this.totalLength(),i=this.state.allDates,s=this.state.disabledArray,o=this.trackerCoord(),c=this.state.trackPosn,r=this.state.trackedArray,d=this.state.zoom,h=this.state.scrollPosn,u=this.handleToggleLine,b=this.handleTrack,v=this.handleClearSelected,m=this.handleZoomIn,x=this.handleZoomOut,k=this.handleScroll,g=void 0!==j()("ul.timeline > li > .line-container").position()?j()("ul.timeline > li > .line-container").position().left:0;return i.sort((function(e,t){return e-t})),Object(l.jsxs)("div",{className:"timeline-container",onWheel:k,onMouseDown:function(t){return e.setState({mouseDown:t.target})},onMouseUp:function(t){e.setState({mouseDown:null})},children:[Object(l.jsxs)("ul",{className:"timeline",onMouseDown:b,onMouseMove:b,dragging:null!==this.state.mouseDown?"dragging":void 0,children:[c>=h&&Object(l.jsx)("div",{className:"timeline-tracker",posn:c,style:{left:o+"px"}}),Object(l.jsxs)("li",{className:"timeline-item ruler-container",children:[Object(l.jsx)("div",{}),Object(l.jsx)("div",{}),Object(l.jsx)("div",{className:"ruler",children:i.map((function(e,t){return Object(l.jsx)("div",{className:"rule",posn:e,posnvisible:e>=h?"posnvisible":void 0,style:{left:100*(e-n)/a+"%"}},t)}))})]}),this.state.lines.map((function(e,i){return Object(l.jsxs)("li",{className:"timeline-item",label:e.label,style:{color:e.color},children:[Object(l.jsx)("div",{className:"line-label",title:e.label,children:e.label}),Object(l.jsx)("input",{type:"checkbox",className:"line-toggle",label:e.label,style:{backgroundColor:e.color},checked:s[i]?void 0:"checked",onChange:u}),Object(l.jsxs)("div",{className:"line-container",tracked:r[i]?"tracked":void 0,children:[Object(l.jsx)("div",{className:"line",startvisible:e.start>=h?"startvisible":void 0,endvisible:e.end>=h?"endvisible":void 0,style:{backgroundColor:e.color,left:Math.max(0,100*(e.start-n)/a)+"%",width:Math.max(0,100*(e.end-Math.max(e.start,h))/a)+"%"}}),e.events.map((function(i,s){return Object(l.jsx)("div",{className:"line-event",posn:i.posn,label:i.label,posnvisible:i.posn>=h?"posnvisible":void 0,isselected:e.label===t.timeline&&i.label===t.event?"isselected":void 0,style:{left:100*(i.posn-n)/a+"%",backgroundColor:e.color}},s)}))]})]},i)}))]}),Object(l.jsxs)("div",{className:"timeline-bottom",children:[Object(l.jsx)("div",{className:"timeline-scrollbar",children:Object(l.jsx)("div",{className:"scrollbar-thumb",style:{left:100*h/(a*d)+"%",width:"calc("+100/d+"% - "+g+"px)",marginLeft:g}})}),Object(l.jsxs)("div",{className:"timeline-controls",children:[Object(l.jsxs)("button",{className:"save-button",children:[Object(l.jsx)(f.a,{icon:O.a}),Object(l.jsx)("span",{children:"Save file"})]}),Object(l.jsxs)("span",{children:[Object(l.jsx)("button",{className:"zoom-in",onMouseDown:m,children:"+"}),Object(l.jsxs)("span",{zoom:Math.round(100*this.state.zoom),children:[Object(l.jsx)(f.a,{icon:O.b}),Object(l.jsx)("span",{children:Math.floor(100*d)+"%"})]}),Object(l.jsx)("button",{className:"zoom-out",onMouseDown:x,children:"\u2212"})]}),c>=0&&Object(l.jsxs)("button",{className:"clear-button",onClick:v,children:[Object(l.jsx)(f.a,{icon:p.a}),Object(l.jsx)("span",{children:"Clear selected"})]}),-1===c&&Object(l.jsx)("div",{})]})]})]})}}]),n}(i.a.Component),k=function(e){Object(h.a)(n,e);var t=Object(u.a)(n);function n(e){var l;return Object(c.a)(this,n),(l=t.call(this,e)).state={lines:b,selectedEvent:{timeline:null,event:null}},l.handleLoadFile=l.handleLoadFile.bind(Object(d.a)(l)),l.handleSelect=l.handleSelect.bind(Object(d.a)(l)),l.fullRender=l.fullRender.bind(Object(d.a)(l)),l.renderLoad=l.renderLoad.bind(Object(d.a)(l)),l}return Object(r.a)(n,[{key:"componentDidMount",value:function(){}},{key:"handleLoadFile",value:function(e){this.setState({lines:JSON.parse(e)})}},{key:"handleSelect",value:function(e){this.setState({selectedEvent:e})}},{key:"render",value:function(){return null!==this.state.lines?this.fullRender():this.renderLoad()}},{key:"fullRender",value:function(){var e=this.state.lines,t=this.state.selectedEvent,n="";return void 0!==e&&null!==t.event&&e.forEach((function(e,l){e.events.forEach((function(l,a){e.label===t.timeline&&l.label===t.event&&(n=JSON.stringify(e))}))})),Object(l.jsxs)("div",{className:"App",children:[Object(l.jsx)(x,{lines:e,selectedEvent:this.state.selectedEvent,handleSelect:this.handleSelect}),Object(l.jsx)("div",{className:"blur"}),Object(l.jsx)("div",{className:"displaySelected",children:n})]})}},{key:"renderLoad",value:function(){return Object(l.jsx)("div",{className:"App",children:Object(l.jsx)(m,{handleLoadFile:this.handleLoadFile})})}}]),n}(i.a.Component),g=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,31)).then((function(t){var n=t.getCLS,l=t.getFID,a=t.getFCP,i=t.getLCP,s=t.getTTFB;n(e),l(e),a(e),i(e),s(e)}))};o.a.render(Object(l.jsx)(i.a.StrictMode,{children:Object(l.jsx)(k,{})}),document.getElementById("root")),g()}},[[30,1,2]]]);
//# sourceMappingURL=main.513847c4.chunk.js.map