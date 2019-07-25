(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{131:function(e,n){},133:function(e,n){},161:function(e,n,t){"use strict";t.r(n);var a=t(0),i=t.n(a),r=t(63),o=t.n(r),c=(t(74),t(8)),s=t(12),l=t(11),u=t(30),d=t(10),m=t(6),f=t(27);t(75),t(76);function g(e){var n=e.isExpanded,t=e.onClick;return i.a.createElement("button",{className:"ExpandButton",onClick:t},function(e){return e?"\u25b6\u25c0":"\u25c0\u25b6"}(n))}function p(e){var n=e.isTruncated,t=e.location;return n?t.address.city+", "+t.address.state:t.display_name}t(77);function h(){return i.a.createElement("div",{className:"SectionDivider"})}t(78);var v=t(22),M={},y=M;function E(){window.innerWidth>window.innerHeight?(M.major=window.innerWidth,M.minor=window.innerHeight):(M.major=window.innerHeight,M.minor=window.innerWidth)}E(),window.addEventListener("resize",E),window.addEventListener("orientationchange",E);var P=t(64),b=t.n(P),C=t(65),B=t.n(C),T=t(66),N=t.n(T),x=b.a,w=B.a,R=N.a;function S(e){return e.slice(0,1).toUpperCase()+e.slice(1).toLowerCase()}function j(e){return["January","February","March","April","May","June","July","August","September","October","November","December"][e]}function O(e){return e.getHours()+":"+e.getMinutes()}function k(e){var n=Math.floor(e/3600),t=Math.floor(e%3600/60),a=Math.floor(e%60);return L(n,2)+":"+L(t,2)+":"+L(a,2)}function L(e,n){var t=""+e;return t.length<n?"0".repeat(n-t.length)+t:t}function F(e,n){return new Promise(function(t,a){x().reverse(n,e).end(function(e,n){e?a(e):t(n)})})}function H(e,n){for(var t=n.getTime(),a=e.length,i=0;i<a;i++){if(e[i].timestamp.getTime()>=t)return i}return a-1}function _(e){return e.reduce(function(e,n){return e+n},0)}function D(e){if(isNaN(e)||e===1/0||e===-1/0)return"stationary";var n=e-Math.floor(e);return Math.floor(e)+":"+L(Math.floor(60*n),2)}function A(e){return e/1609.34}function U(e){return 0===e.records.length?e.start_time:e.records[0].timestamp}function I(e){return 0===e.records.length?e.end_time:e.records[e.records.length-1].timestamp}function V(e){var n=e.min,t=e.max,a=e.value;return Math.min(t,Math.max(n,a))}function W(e){var n=e.sport.sport,t=e.activity,a=t.sessions.map(K),i=a.map(function(e){return e.laps}).flat(),r=a.map(function(e){return e.records}).flat();r.forEach(function(e,n){e.index=n});var o=_(a.map(function(e){return e.total_distance})),s=_(a.map(function(e){return e.total_elapsed_time})),l=r[0].timestamp,u=r[r.length-1].timestamp,d=Object(c.a)({},t,{sport:n,sessions:a,laps:i,records:r,total_distance:o,total_elapsed_time:s,start_time:l,end_time:u});return function(e){"running"===e.sport&&e.records.forEach(function(e){e.cadence*=2})}(d),function(e){e.records.forEach(function(e){e.pace=60/(e.speed*z)})}(d),d}function K(e){var n=Object(c.a)({},e);return n.laps=n.laps.map(Y),n.records=n.laps.map(function(e){return e.records}).flat(),n.start_time=n.records[0].timestamp,n.end_time=n.records[n.records.length-1].timestamp,n}function Y(e){var n=Object(c.a)({},e);return n.records=n.records.slice(),n.start_time=n.records[0].timestamp,n.end_time=n.records[n.records.length-1].timestamp,n}var J,z=.621371;!function(e){e[e.HeartRate=0]="HeartRate",e[e.Cadence=1]="Cadence",e[e.Pace=2]="Pace"}(J||(J={}));var X,$=(X=J,Object.values(X).filter(function(e){return"number"===typeof e}));function q(e,n){switch(n){case J.HeartRate:return e.heart_rate;case J.Cadence:return e.cadence;case J.Pace:return e.pace}}function G(e){var n=e.laps.map(Q),t=n.map(function(e){return e.records}).flat();return Object(c.a)({},e,{laps:n,records:t})}function Q(e){var n=e.records.map(Z);return Object(c.a)({},e,{records:n})}function Z(e){var n=function(e){return new Date(e.getTime())}(e.timestamp);return Object(c.a)({},e,{timestamp:n})}function ee(e){var n=e.attribute,t=e.records,a=e.offsetIndex,r=e.viewedDuration,o=e.filter,c=e.shouldConvertRpmToSpm,s=e.verticalMin,l=e.verticalMax-s;return i.a.createElement("div",{className:"Timeline"},i.a.createElement("div",{className:"TimelineLabel"},function(e,n){switch(e){case J.HeartRate:return"Heart rate (bpm)";case J.Cadence:return"Cadence "+(n?"(spm)":"(rpm)");case J.Pace:return"Pace (min/mi)"}}(n,c),function(){var e=t[a];return e?i.a.createElement("span",{className:"ActiveRecordValue ActiveRecordValue--"+(o.isAttributeIllegal(n,e)?"illegal":o.isAnyAttributeIllegal(e)?"illegalOther":"legal")}," = "+(n===J.Pace?D(q(e,n)):q(e,n))):null}()),i.a.createElement(v.Stage,{width:window.innerWidth,height:re()},i.a.createElement(v.Layer,{width:window.innerWidth,height:re()},i.a.createElement(v.Rect,{fill:"#eeea",width:window.innerWidth,height:re()}),function(e,n){if(0===e.length)return[];var t=e[0].timestamp.getTime()+n,a=e.findIndex(function(e){return e.timestamp.getTime()>t});return-1===a?e.slice():e.slice(0,a)}(t.slice(a),r).map(function(e,c){var u=e.timestamp.getTime()-t[a].timestamp.getTime();return i.a.createElement(v.Circle,{key:e.index,fill:o.isAttributeIllegal(n,e)?ae:o.isAnyAttributeIllegal(e)?ie:0===c?ne:te,x:window.innerWidth*(u/r)+oe(),y:V({min:0,max:re(),value:re()-re()*((q(e,n)-s)/l)}),radius:oe()})}))))}var ne="#3ce",te="#08b",ae="red",ie="orange";function re(){return.2*y.minor}function oe(){return.005*y.major}var ce=t(35),se=t.n(ce),le=t(14),ue=t.n(le),de=t(68);function me(e,n){var t=function(e){var n=e.sessions.map(G),t=n.map(function(e){return e.laps}).flat(),a=n.map(function(e){return e.records}).flat();return Object(c.a)({},e,{sessions:n,laps:t,records:a})}(e),a=0,i=0;t.sessions.forEach(function(e){if(e.records.length>0){var t=Object(de.a)(e.records),r=t[0],o=t.slice(1),c=r.timestamp,s=r.distance;o.forEach(function(e){if(!n.isAnyAttributeIllegal(e)){var t=e.timestamp.getTime()-c.getTime(),r=e.distance-s;a+=t,i+=r}c=e.timestamp,s=e.distance})}});var r,o=function(e,n){var t=A(e);return n/60/t}(i,a*=.001),s=t.records.map(function(e){return e.heart_rate}),l=_(r=s)/r.length;return{totalDuration:a,totalDistance:i,averagePace:o,averageHeartRate:l}}var fe,ge=t(69);!function(e){e[e.Min=0]="Min",e[e.Max=1]="Max"}(fe||(fe={}));var pe=function(){function e(n){Object(s.a)(this,e),this.pendingHeartRateMin=void 0,this.pendingHeartRateMax=void 0,this.pendingCadenceMin=void 0,this.pendingCadenceMax=void 0,this.pendingPaceMin=void 0,this.pendingPaceMax=void 0,this.heartRate=void 0,this.cadence=void 0,this.pace=void 0,this.pendingHeartRateMin=""+n.heartRate[0],this.pendingHeartRateMax=""+n.heartRate[1],this.pendingCadenceMin=""+n.cadence[0],this.pendingCadenceMax=""+n.cadence[1],this.pendingPaceMin=""+n.pace[0],this.pendingPaceMax=""+n.pace[1],this.heartRate=n.heartRate,this.cadence=n.cadence,this.pace=n.pace}return Object(l.a)(e,[{key:"setPendingBound",value:function(n,t,a){var i=new e(this.config());return i[function(e,n){var t=function(e){switch(e){case J.HeartRate:return"pendingHeartRate";case J.Cadence:return"pendingCadence";case J.Pace:return"pendingPace"}}(e),a=function(e){switch(e){case fe.Min:return"Min";case fe.Max:return"Max"}}(n);return t+a}(n,t)]=a,i}},{key:"config",value:function(){return{heartRate:this.heartRate,cadence:this.cadence,pace:this.pace}}},{key:"syncPendingBoundsWithActualBounds",value:function(){return new e({heartRate:he(this.heartRate,this.pendingHeartRateMin,this.pendingHeartRateMax),cadence:he(this.cadence,this.pendingCadenceMin,this.pendingCadenceMax),pace:he(this.pace,this.pendingPaceMin,this.pendingPaceMax)})}},{key:"isAttributeIllegal",value:function(e,n){return!this.isAttributeLegal(e,n)}},{key:"isAttributeLegal",value:function(e,n){var t=this.getBounds(e),a=Object(ge.a)(t,2),i=a[0],r=a[1],o=q(n,e);return i<=o&&o<=r}},{key:"isAnyAttributeIllegal",value:function(e){var n=this;return $.some(function(t){return n.isAttributeIllegal(t,e)})}},{key:"getBounds",value:function(e){switch(e){case J.HeartRate:return this.heartRate;case J.Cadence:return this.cadence;case J.Pace:return this.pace}}}]),e}();function he(e,n,t){var a=ve(n),i=ve(t);return[isNaN(a)?e[0]:a,isNaN(i)?e[1]:i]}function ve(e){return/^-?\d*$/.test(e)?parseInt(e,10):NaN}var Me,ye=function(){function e(){Object(s.a)(this,e)}return Object(l.a)(e,[{key:"match",value:function(e){return this.isNone()?e.none():e.some(this.value)}},{key:"isNone",value:function(){return this.isNone_}},{key:"isSome",value:function(){return!this.isNone()}},{key:"map",value:function(n){var t=this;return this.match({none:function(){return t},some:function(t){return e.some(n(t))}})}},{key:"unwrapOr",value:function(e){return this.match({none:function(){return e},some:function(e){return e}})}}],[{key:"some",value:function(n){var t=Object.create(e.prototype);return t.isNone_=!1,t.value=n,t}},{key:"none",value:function(){return Ee}}]),e}(),Ee=function(){var e=Object.create(ye.prototype);return e.isNone_=!0,e}(),Pe=t(36),be=t(67);!function(e){e[e.Pending=0]="Pending",e[e.Fulfilled=1]="Fulfilled",e[e.Rejected=2]="Rejected"}(Me||(Me={}));var Ce=function(e){function n(e,t){var a;return Object(s.a)(this,n),(a=Object(u.a)(this,Object(d.a)(n).call(this,e))).status=void 0,a.value=void 0,a.error=void 0,a.updateListeners=void 0,a.status=Me.Pending,a.updateListeners=[],t&&(Object(Pe.a)(Object(d.a)(n.prototype),"then",Object(m.a)(a)).call(Object(m.a)(a),function(e){a.status=Me.Fulfilled,a.value=e,a.updateListeners.forEach(function(e){e()})}),Object(Pe.a)(Object(d.a)(n.prototype),"catch",Object(m.a)(a)).call(Object(m.a)(a),function(e){a.status=Me.Rejected,a.error=e,a.updateListeners.forEach(function(e){e()})})),a}return Object(f.a)(n,e),Object(l.a)(n,null,[{key:"fromPromise",value:function(e){return new n(function(n,t){e.then(n),e.catch(t)},!0)}}]),Object(l.a)(n,[{key:"match",value:function(e){switch("function"===typeof e.onUpdate&&this.updateListeners.push(e.onUpdate),this.status){case Me.Pending:return e.pending();case Me.Fulfilled:return e.fulfilled(this.value);case Me.Rejected:return e.rejected(this.error)}}}]),n}(Object(be.a)(Promise)),Be=function(e){function n(e){var t;return Object(s.a)(this,n),(t=Object(u.a)(this,Object(d.a)(n).call(this,e))).fileRef=void 0,t.minimapRef=void 0,t.mapRef=void 0,t.onChangePendingFilterHeartRateMin=void 0,t.onChangePendingFilterHeartRateMax=void 0,t.onChangePendingFilterCadenceMin=void 0,t.onChangePendingFilterCadenceMax=void 0,t.onChangePendingFilterPaceMin=void 0,t.onChangePendingFilterPaceMax=void 0,t.onChangePendingTimelineHeartRateMin=void 0,t.onChangePendingTimelineHeartRateMax=void 0,t.onChangePendingTimelineCadenceMin=void 0,t.onChangePendingTimelineCadenceMax=void 0,t.onChangePendingTimelinePaceMin=void 0,t.onChangePendingTimelinePaceMax=void 0,t.leafletState=void 0,t.state={activity:ye.none(),mouseDownTarget:ye.none(),filter:new pe({heartRate:[0,200],cadence:[0,200],pace:[0,15]}),timelineBounds:new pe({heartRate:[100,190],cadence:[0,225],pace:[0,30]})},t.fileRef=i.a.createRef(),t.minimapRef=i.a.createRef(),t.mapRef=i.a.createRef(),t.leafletState=ye.none(),window.addEventListener("resize",function(){return t.forceUpdate()}),window.addEventListener("orientationchange",function(){return t.forceUpdate()}),t.forceUpdate=t.forceUpdate.bind(Object(m.a)(t)),t.handleUpload=t.handleUpload.bind(Object(m.a)(t)),t.toggleIsStartLocationTruncated=t.toggleIsStartLocationTruncated.bind(Object(m.a)(t)),t.toggleIsEndLocationTruncated=t.toggleIsEndLocationTruncated.bind(Object(m.a)(t)),t.onMouseDown=t.onMouseDown.bind(Object(m.a)(t)),t.onMouseUp=t.onMouseUp.bind(Object(m.a)(t)),t.onMouseMove=t.onMouseMove.bind(Object(m.a)(t)),t.onTouchStart=t.onTouchStart.bind(Object(m.a)(t)),t.onTouchMove=t.onTouchMove.bind(Object(m.a)(t)),t.onTouchEnd=t.onTouchEnd.bind(Object(m.a)(t)),t.onSyncPendingFilterBounds=t.onSyncPendingFilterBounds.bind(Object(m.a)(t)),t.onSyncPendingTimelineBounds=t.onSyncPendingTimelineBounds.bind(Object(m.a)(t)),t.onChangePendingFilterHeartRateMin=function(e){return t.onChangePendingFilterBound(J.HeartRate,fe.Min,e)},t.onChangePendingFilterHeartRateMax=function(e){return t.onChangePendingFilterBound(J.HeartRate,fe.Max,e)},t.onChangePendingFilterCadenceMin=function(e){return t.onChangePendingFilterBound(J.Cadence,fe.Min,e)},t.onChangePendingFilterCadenceMax=function(e){return t.onChangePendingFilterBound(J.Cadence,fe.Max,e)},t.onChangePendingFilterPaceMin=function(e){return t.onChangePendingFilterBound(J.Pace,fe.Min,e)},t.onChangePendingFilterPaceMax=function(e){return t.onChangePendingFilterBound(J.Pace,fe.Max,e)},t.onChangePendingTimelineHeartRateMin=function(e){return t.onChangePendingTimelineBound(J.HeartRate,fe.Min,e)},t.onChangePendingTimelineHeartRateMax=function(e){return t.onChangePendingTimelineBound(J.HeartRate,fe.Max,e)},t.onChangePendingTimelineCadenceMin=function(e){return t.onChangePendingTimelineBound(J.Cadence,fe.Min,e)},t.onChangePendingTimelineCadenceMax=function(e){return t.onChangePendingTimelineBound(J.Cadence,fe.Max,e)},t.onChangePendingTimelinePaceMin=function(e){return t.onChangePendingTimelineBound(J.Pace,fe.Min,e)},t.onChangePendingTimelinePaceMax=function(e){return t.onChangePendingTimelineBound(J.Pace,fe.Max,e)},t}return Object(f.a)(n,e),Object(l.a)(n,[{key:"componentDidUpdate",value:function(){var e=this;this.state.activity.map(function(n){var t=n.activity.records,a=n.offsetIndex,i=t[a],r=t[0],o=t[t.length-1];e.leafletState=e.leafletState.match({none:function(){if(e.mapRef&&e.mapRef.current){var n=ue.a.polygon(function(e,n){for(var t=e.length/n,a=[],i=-1,r=0;r<e.length;r+=t){var o=Math.floor(r);i!==o&&(a.push(e[o]),i=o)}return a}(t,Ne).map(function(e){return[e.position_lat,e.position_long]})),a=ue.a.marker([i.position_lat,i.position_long],{title:"Current location"}),c=ue.a.marker([r.position_lat,r.position_long],{title:"Start"}),s=ue.a.marker([o.position_lat,o.position_long],{title:"End"}),l=ue.a.map(e.mapRef.current,{center:[r.position_lat,r.position_long],zoom:13,layers:[ue.a.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),n,a,c,s]});return ye.some({map:l,currentMarker:a,startMarker:c,endMarker:s})}return ye.none()},some:function(e){return e.currentMarker.setLatLng([i.position_lat,i.position_long]),ye.some(e)}})})}},{key:"render",value:function(){var e=this;return i.a.createElement("div",{className:"App",onMouseDown:this.onMouseDown,onMouseMove:this.onMouseMove,onMouseUp:this.onMouseUp,onTouchStart:this.onTouchStart,onTouchMove:this.onTouchMove,onTouchEnd:this.onTouchEnd},this.state.activity.match({none:function(){return i.a.createElement("label",{className:"UploadButton"},i.a.createElement("input",{type:"file",accept:".fit",onChange:e.handleUpload,ref:e.fileRef,style:{display:"none"}}),"Upload .fit file")},some:function(n){var t=n.activity,a=n.startLocation,r=n.isStartLocationTruncated,o=n.endLocation,c=n.isEndLocationTruncated,s=n.offsetTime,l=n.offsetIndex,u=n.viewedDuration,d=n.cumulatives,m=t.sport,f=t.records,v=t.total_elapsed_time,M=U(t),y=I(t),E="running"===m;return i.a.createElement("div",{className:"ActivityView"},i.a.createElement("div",{className:"Head"},i.a.createElement("div",{className:"SectionHeader"},j(M.getMonth())+" "+M.getDate()+" ",a.match({onUpdate:e.forceUpdate,pending:function(){return""},fulfilled:function(e){return e.address.city+" "},rejected:function(){return""}}),S(m)),i.a.createElement("div",{className:"MinimapBackground",ref:e.minimapRef},i.a.createElement("div",{className:"MinimapForeground",style:{width:100*(s.getTime()-M.getTime())/(y.getTime()-M.getTime())+"%"}}))),i.a.createElement("div",{className:"Body"},i.a.createElement("div",{className:"ActivityOverview"},i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Sport: "),i.a.createElement("span",{className:"Value"},S(m))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Date: "),i.a.createElement("span",{className:"Value"},["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][M.getDay()]," ",M.getDate()," ",j(M.getMonth())," ",M.getFullYear())),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Start location: "),i.a.createElement("span",{className:"Value"},a.match({pending:function(){return"loading"},fulfilled:function(n){return i.a.createElement(i.a.Fragment,null,i.a.createElement(g,{isExpanded:!r,onClick:e.toggleIsStartLocationTruncated}),i.a.createElement(p,{isTruncated:r,location:n}))},rejected:function(e){return console.log("Error loading start location",e),"Error loading location"},onUpdate:e.forceUpdate}))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"End location: "),i.a.createElement("span",{className:"Value"},o.match({pending:function(){return"loading"},fulfilled:function(n){return i.a.createElement(i.a.Fragment,null,i.a.createElement(g,{isExpanded:!c,onClick:e.toggleIsEndLocationTruncated}),i.a.createElement(p,{isTruncated:c,location:n}))},rejected:function(e){return console.log("Error loading start location",e),"Error loading location"},onUpdate:e.forceUpdate}))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Total distance: "),i.a.createElement("span",{className:"Value"},se()(A(t.total_distance),2))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Total duration: "),i.a.createElement("span",{className:"Value"},k(v))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Start time: "),i.a.createElement("span",{className:"Value"},O(M))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"End time: "),i.a.createElement("span",{className:"Value"},O(y)))),i.a.createElement(h,null),i.a.createElement("div",{className:"TimelineContainer"},i.a.createElement(ee,{attribute:J.HeartRate,records:f,offsetIndex:l,viewedDuration:u,filter:e.state.filter,shouldConvertRpmToSpm:E,verticalMin:e.state.timelineBounds.heartRate[0],verticalMax:e.state.timelineBounds.heartRate[1]}),i.a.createElement(ee,{attribute:J.Cadence,records:f,offsetIndex:l,viewedDuration:u,filter:e.state.filter,shouldConvertRpmToSpm:E,verticalMin:e.state.timelineBounds.cadence[0],verticalMax:e.state.timelineBounds.cadence[1]}),i.a.createElement(ee,{attribute:J.Pace,records:f,offsetIndex:l,viewedDuration:u,filter:e.state.filter,shouldConvertRpmToSpm:E,verticalMin:e.state.timelineBounds.pace[0],verticalMax:e.state.timelineBounds.pace[1]})),i.a.createElement(h,null),i.a.createElement("div",{className:"BoundsContainer"},i.a.createElement("div",{className:"SectionHeader"},"Filters: "),i.a.createElement("div",{className:"Bound"},i.a.createElement("div",{className:"BoundAttribute"},"Heart Rate"),i.a.createElement("label",{className:"BoundMinLabel"},"Min:"," ",i.a.createElement("input",{className:"BoundMin",type:"text",pattern:"\\d*",value:e.state.filter.pendingHeartRateMin,onChange:e.onChangePendingFilterHeartRateMin,onBlur:e.onSyncPendingFilterBounds})),i.a.createElement("label",{className:"BoundMaxLabel"},"Max:"," ",i.a.createElement("input",{className:"BoundMax",type:"text",pattern:"\\d*",value:e.state.filter.pendingHeartRateMax,onChange:e.onChangePendingFilterHeartRateMax,onBlur:e.onSyncPendingFilterBounds}))),i.a.createElement("div",{className:"Bound"},i.a.createElement("div",{className:"BoundAttribute"},"Cadence"),i.a.createElement("label",{className:"BoundMinLabel"},"Min:"," ",i.a.createElement("input",{className:"BoundMin",type:"text",pattern:"\\d*",value:e.state.filter.pendingCadenceMin,onChange:e.onChangePendingFilterCadenceMin,onBlur:e.onSyncPendingFilterBounds})),i.a.createElement("label",{className:"BoundMaxLabel"},"Max:"," ",i.a.createElement("input",{className:"BoundMax",type:"text",pattern:"\\d*",value:e.state.filter.pendingCadenceMax,onChange:e.onChangePendingFilterCadenceMax,onBlur:e.onSyncPendingFilterBounds}))),i.a.createElement("div",{className:"Bound"},i.a.createElement("div",{className:"BoundAttribute"},"Pace"),i.a.createElement("label",{className:"BoundMinLabel"},"Min:"," ",i.a.createElement("input",{className:"BoundMin",type:"text",pattern:"\\d*",value:e.state.filter.pendingPaceMin,onChange:e.onChangePendingFilterPaceMin,onBlur:e.onSyncPendingFilterBounds})),i.a.createElement("label",{className:"BoundMaxLabel"},"Max:"," ",i.a.createElement("input",{className:"BoundMax",type:"text",pattern:"\\d*",value:e.state.filter.pendingPaceMax,onChange:e.onChangePendingFilterPaceMax,onBlur:e.onSyncPendingFilterBounds})))),i.a.createElement(h,null),i.a.createElement("div",{className:"CumulativesContainer"},i.a.createElement("div",{className:"SectionHeader"},"Filtered stats: "),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Total duration: "),i.a.createElement("span",{className:"Value"},k(d.totalDuration))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Total distance (mi): "),i.a.createElement("span",{className:"Value"},se()(A(d.totalDistance),2))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Average pace (min/mi): "),i.a.createElement("span",{className:"Value"},D(d.averagePace))),i.a.createElement("div",{className:"Entry"},i.a.createElement("span",{className:"Key"},"Average heart rate (bpm): "),i.a.createElement("span",{className:"Value"},Math.floor(d.averageHeartRate)))),i.a.createElement(h,null),i.a.createElement("div",{className:"BoundsContainer"},i.a.createElement("div",{className:"SectionHeader"},"Y-axis ranges: "),i.a.createElement("div",{className:"Bound"},i.a.createElement("div",{className:"BoundAttribute"},"Heart Rate"),i.a.createElement("label",{className:"BoundMinLabel"},"Min:"," ",i.a.createElement("input",{className:"BoundMin",type:"text",pattern:"\\d*",value:e.state.timelineBounds.pendingHeartRateMin,onChange:e.onChangePendingTimelineHeartRateMin,onBlur:e.onSyncPendingTimelineBounds})),i.a.createElement("label",{className:"BoundMaxLabel"},"Max:"," ",i.a.createElement("input",{className:"BoundMax",type:"text",pattern:"\\d*",value:e.state.timelineBounds.pendingHeartRateMax,onChange:e.onChangePendingTimelineHeartRateMax,onBlur:e.onSyncPendingTimelineBounds}))),i.a.createElement("div",{className:"Bound"},i.a.createElement("div",{className:"BoundAttribute"},"Cadence"),i.a.createElement("label",{className:"BoundMinLabel"},"Min:"," ",i.a.createElement("input",{className:"BoundMin",type:"text",pattern:"\\d*",value:e.state.timelineBounds.pendingCadenceMin,onChange:e.onChangePendingTimelineCadenceMin,onBlur:e.onSyncPendingTimelineBounds})),i.a.createElement("label",{className:"BoundMaxLabel"},"Max:"," ",i.a.createElement("input",{className:"BoundMax",type:"text",pattern:"\\d*",value:e.state.timelineBounds.pendingCadenceMax,onChange:e.onChangePendingTimelineCadenceMax,onBlur:e.onSyncPendingTimelineBounds}))),i.a.createElement("div",{className:"Bound"},i.a.createElement("div",{className:"BoundAttribute"},"Pace"),i.a.createElement("label",{className:"BoundMinLabel"},"Min:"," ",i.a.createElement("input",{className:"BoundMin",type:"text",pattern:"\\d*",value:e.state.timelineBounds.pendingPaceMin,onChange:e.onChangePendingTimelinePaceMin,onBlur:e.onSyncPendingTimelineBounds})),i.a.createElement("label",{className:"BoundMaxLabel"},"Max:"," ",i.a.createElement("input",{className:"BoundMax",type:"text",pattern:"\\d*",value:e.state.timelineBounds.pendingPaceMax,onChange:e.onChangePendingTimelinePaceMax,onBlur:e.onSyncPendingTimelineBounds})))),i.a.createElement(h,null),i.a.createElement("div",{className:"LeafletMap",ref:e.mapRef})))}}))}},{key:"handleUpload",value:function(){var e=this,n=this.fileRef.current.files;if(null!==n&&"object"===typeof n&&n.length>0){var t=n[0],a=new FileReader;a.addEventListener("loadend",function(){if(a.error)throw a.error;var n=a.result;new R({force:!0,speedUnit:"km/h",lengthUnit:"m",temperatureUnit:"kelvin",elapsedRecordField:!0,mode:"cascade"}).parse(n,function(n,t){if(n)throw n;var a=t.activity.sessions[0],i=function(e){return e.sessions.map(function(e){return function(e){return e.laps.map(function(e){return e.records}).flat()}(e)}).flat()}(t.activity),r=i[i.length-1],o=W(t);e.setState({activity:ye.some({activity:o,startLocation:Ce.fromPromise(F(a.start_position_lat,a.start_position_long)),isStartLocationTruncated:!0,endLocation:Ce.fromPromise(F(r.position_lat,r.position_long)),isEndLocationTruncated:!0,offsetTime:U(o),offsetIndex:0,viewedDuration:Te,cumulatives:me(o,e.state.filter),timelineScroll:ye.none()})})})}),a.readAsArrayBuffer(t)}}},{key:"toggleIsStartLocationTruncated",value:function(){this.setState(function(e){return{activity:e.activity.map(function(e){return Object(c.a)({},e,{isStartLocationTruncated:!e.isStartLocationTruncated})})}})}},{key:"toggleIsEndLocationTruncated",value:function(){this.setState(function(e){return{activity:e.activity.map(function(e){return Object(c.a)({},e,{isEndLocationTruncated:!e.isEndLocationTruncated})})}})}},{key:"onMouseDown",value:function(e){this.onPointerDown(e.target,e.clientX,e.clientY)}},{key:"onTouchStart",value:function(e){var n=e.touches[0];this.onPointerDown(e.target,n.clientX,n.clientY)}},{key:"onPointerDown",value:function(e,n,t){this.setState(function(a){return{mouseDownTarget:ye.some(e),activity:a.activity.map(function(e){return Object(c.a)({},e,{timelineScroll:ye.some({initialPointerLocation:{x:n,y:t},initialOffsetTime:e.offsetTime})})})}})}},{key:"onMouseUp",value:function(){this.onPointerUp()}},{key:"onTouchEnd",value:function(){this.onPointerUp()}},{key:"onPointerUp",value:function(){this.setState(function(e){return{activity:e.activity.map(function(e){return Object(c.a)({},e,{timelineScroll:ye.none()})}),mouseDownTarget:ye.none()}})}},{key:"onMouseMove",value:function(e){this.onPointerMove(e.clientX,e.clientY)}},{key:"onTouchMove",value:function(e){var n=e.touches[0];this.onPointerMove(n.clientX,n.clientY)}},{key:"onPointerMove",value:function(e,n){if(this.minimapRef&&this.minimapRef.current)if(this.isCursorDragged()){var t=this.minimapRef.current.getBoundingClientRect(),a=V({min:0,max:1,value:(e-t.left)/t.width});this.setState(function(e){return{activity:e.activity.map(function(e){var n=function(e,n,t){var a=e.getTime(),i=n.getTime();return new Date(a+(i-a)*t)}(U(e.activity),I(e.activity),a);return Object(c.a)({},e,{offsetTime:n,offsetIndex:H(e.activity.records,n)})})}})}else this.isTimelineDragged()&&this.setState(function(n){return{activity:n.activity.map(function(n){return n.timelineScroll.match({none:function(){return n},some:function(t){var a=t.initialPointerLocation,i=t.initialOffsetTime,r=(e-a.x)/window.innerWidth,o=-n.viewedDuration*r,s=i.getTime()+o,l=U(n.activity),u=I(n.activity),d=V({min:l.getTime(),max:u.getTime(),value:s}),m=new Date(d),f=H(n.activity.records,m);return Object(c.a)({},n,{offsetTime:m,offsetIndex:f})}})})}})}},{key:"isCursorDragged",value:function(){var e=this.minimapRef;return this.state.mouseDownTarget.match({none:function(){return!1},some:function(n){return!!(e&&e.current&&w(e.current,n))}})}},{key:"isTimelineDragged",value:function(){return this.state.mouseDownTarget.match({none:function(){return!1},some:function(e){return"CANVAS"===e.tagName}})}},{key:"onChangePendingFilterBound",value:function(e,n,t){this.setState({filter:this.state.filter.setPendingBound(e,n,t.target.value)})}},{key:"onChangePendingTimelineBound",value:function(e,n,t){this.setState({timelineBounds:this.state.timelineBounds.setPendingBound(e,n,t.target.value)})}},{key:"onSyncPendingFilterBounds",value:function(){var e=this.state.filter.syncPendingBoundsWithActualBounds();this.setState({filter:e,activity:this.state.activity.map(function(n){return Object(c.a)({},n,{cumulatives:me(n.activity,e)})})})}},{key:"onSyncPendingTimelineBounds",value:function(){var e=this.state.timelineBounds.syncPendingBoundsWithActualBounds();this.setState({timelineBounds:e})}}]),n}(i.a.Component),Te=3e5,Ne=60;Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(i.a.createElement(Be,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},70:function(e,n,t){e.exports=t(161)},74:function(e,n,t){},75:function(e,n,t){},76:function(e,n,t){},77:function(e,n,t){},78:function(e,n,t){}},[[70,1,2]]]);
//# sourceMappingURL=main.21f8b8a1.chunk.js.map