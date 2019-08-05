import React from "react";
import "./App.css";

import ExpandButton from "./components/ExpandButton";
import Location from "./components/Location";
import SectionDivider from "./components/SectionDivider";
import Timeline from "./components/Timeline";

import { isOrIsAncestorOf, EasyFit } from "./lib";

import roundTo from "round-to";
import leaflet from "leaflet";

import { getCumulatives, Cumulatives } from "./cumulatives";
import { BoundType, Filter } from "./filter";
import { getActivity, Activity, Attribute } from "./getActivity";
import {
  getActivityRecords,
  capitalizeFirstLetter,
  dayOfWeekString,
  monthString,
  getTime,
  getDurationFromSecs,
  reverseGeocode,
  lerpDate,
  getOffsetIndex,
  metersToMiles,
  fractionalMinuteToPaceString,
  getFirstRecordTimestampOrActivityStartTime,
  getLastRecordTimestampOrActivityEndTime,
  clamp,
  pickAboutN,
  getNearestPositionedRecord,
  Address,
} from "./helpers";
import {
  currentMarkerIcon,
  startMarkerIcon,
  endMarkerIcon,
} from "./markerIcons";
import Option from "./Option";
import Qprom from "./Qprom";

export default class App extends React.Component<{}, AppState> {
  private fileRef: React.RefObject<HTMLInputElement>;
  private minimapRef: React.RefObject<HTMLDivElement>;
  private mapRef: React.RefObject<HTMLDivElement>;

  private onChangePendingFilterHeartRateMin: (event: React.ChangeEvent) => void;
  private onChangePendingFilterHeartRateMax: (event: React.ChangeEvent) => void;
  private onChangePendingFilterCadenceMin: (event: React.ChangeEvent) => void;
  private onChangePendingFilterCadenceMax: (event: React.ChangeEvent) => void;
  private onChangePendingFilterPaceMin: (event: React.ChangeEvent) => void;
  private onChangePendingFilterPaceMax: (event: React.ChangeEvent) => void;

  private onChangePendingTimelineHeartRateMin: (
    event: React.ChangeEvent
  ) => void;
  private onChangePendingTimelineHeartRateMax: (
    event: React.ChangeEvent
  ) => void;
  private onChangePendingTimelineCadenceMin: (event: React.ChangeEvent) => void;
  private onChangePendingTimelineCadenceMax: (event: React.ChangeEvent) => void;
  private onChangePendingTimelinePaceMin: (event: React.ChangeEvent) => void;
  private onChangePendingTimelinePaceMax: (event: React.ChangeEvent) => void;

  private leafletState: Option<LeafletState>;

  constructor(props: object) {
    super(props);

    this.state = {
      activity: Option.none(),
      mouseDownTarget: Option.none(),
      filter: new Filter({
        heartRate: [0, 200],
        cadence: [0, 200],
        pace: [0, 15],
      }),
      timelineBounds: new Filter({
        heartRate: [100, 190],
        cadence: [0, 225],
        pace: [0, 30],
      }),
    };

    this.fileRef = React.createRef();
    this.minimapRef = React.createRef();
    this.mapRef = React.createRef();

    this.leafletState = Option.none();

    window.addEventListener("resize", () => this.forceUpdate());
    window.addEventListener("orientationchange", () => this.forceUpdate());

    this.forceUpdate = this.forceUpdate.bind(this);

    this.handleUpload = this.handleUpload.bind(this);
    this.toggleIsStartLocationTruncated = this.toggleIsStartLocationTruncated.bind(
      this
    );
    this.toggleIsEndLocationTruncated = this.toggleIsEndLocationTruncated.bind(
      this
    );
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onSyncPendingFilterBounds = this.onSyncPendingFilterBounds.bind(this);
    this.onSyncPendingTimelineBounds = this.onSyncPendingTimelineBounds.bind(
      this
    );

    this.onChangePendingFilterHeartRateMin = (e) =>
      this.onChangePendingFilterBound(Attribute.HeartRate, BoundType.Min, e);
    this.onChangePendingFilterHeartRateMax = (e) =>
      this.onChangePendingFilterBound(Attribute.HeartRate, BoundType.Max, e);
    this.onChangePendingFilterCadenceMin = (e) =>
      this.onChangePendingFilterBound(Attribute.Cadence, BoundType.Min, e);
    this.onChangePendingFilterCadenceMax = (e) =>
      this.onChangePendingFilterBound(Attribute.Cadence, BoundType.Max, e);
    this.onChangePendingFilterPaceMin = (e) =>
      this.onChangePendingFilterBound(Attribute.Pace, BoundType.Min, e);
    this.onChangePendingFilterPaceMax = (e) =>
      this.onChangePendingFilterBound(Attribute.Pace, BoundType.Max, e);

    this.onChangePendingTimelineHeartRateMin = (e) =>
      this.onChangePendingTimelineBound(Attribute.HeartRate, BoundType.Min, e);
    this.onChangePendingTimelineHeartRateMax = (e) =>
      this.onChangePendingTimelineBound(Attribute.HeartRate, BoundType.Max, e);
    this.onChangePendingTimelineCadenceMin = (e) =>
      this.onChangePendingTimelineBound(Attribute.Cadence, BoundType.Min, e);
    this.onChangePendingTimelineCadenceMax = (e) =>
      this.onChangePendingTimelineBound(Attribute.Cadence, BoundType.Max, e);
    this.onChangePendingTimelinePaceMin = (e) =>
      this.onChangePendingTimelineBound(Attribute.Pace, BoundType.Min, e);
    this.onChangePendingTimelinePaceMax = (e) =>
      this.onChangePendingTimelineBound(Attribute.Pace, BoundType.Max, e);
  }

  componentDidUpdate() {
    this.state.activity.ifSome((activity) => {
      const { records } = activity.activity;
      const { offsetIndex } = activity;
      const currentlyMarkedRecord = getNearestPositionedRecord(
        records,
        offsetIndex
      );
      const startLocationRecord = getNearestPositionedRecord(records, 0);
      const endLocationRecord = getNearestPositionedRecord(
        records,
        records.length - 1
      );

      Option.all([
        currentlyMarkedRecord,
        startLocationRecord,
        endLocationRecord,
      ]).ifSome(
        ([currentlyMarkedRecord, startLocationRecord, endLocationRecord]) => {
          this.leafletState = this.leafletState.match({
            none: () => {
              if (this.mapRef && this.mapRef.current) {
                const polyline = leaflet.polygon(
                  pickAboutN(records, POLYLINE_POINTS)
                    .filter(
                      (record) =>
                        "number" === typeof record.position_lat &&
                        "number" === typeof record.position_long
                    )
                    .map((record) => [
                      record.position_lat,
                      record.position_long,
                    ])
                );
                const currentMarker = leaflet.marker(
                  [
                    currentlyMarkedRecord.position_lat,
                    currentlyMarkedRecord.position_long,
                  ],
                  { title: "Current location", icon: currentMarkerIcon }
                );
                const startMarker = leaflet.marker(
                  [
                    startLocationRecord.position_lat,
                    startLocationRecord.position_long,
                  ],
                  { title: "Start", icon: startMarkerIcon }
                );
                const endMarker = leaflet.marker(
                  [
                    endLocationRecord.position_lat,
                    endLocationRecord.position_long,
                  ],
                  { title: "End", icon: endMarkerIcon }
                );
                const map = leaflet.map(this.mapRef.current, {
                  center: [
                    startLocationRecord.position_lat,
                    startLocationRecord.position_long,
                  ],
                  zoom: 13,
                  layers: [
                    leaflet.tileLayer(
                      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    ),
                    polyline,
                    currentMarker,
                    startMarker,
                    endMarker,
                  ],
                });
                return Option.some({
                  map,
                  currentMarker,
                  startMarker,
                  endMarker,
                });
              } else {
                return Option.none();
              }
            },
            some: (leafletState) => {
              leafletState.currentMarker.setLatLng([
                currentlyMarkedRecord.position_lat,
                currentlyMarkedRecord.position_long,
              ]);
              return Option.some(leafletState);
            },
          });
        }
      );
    });
  }

  render() {
    return (
      <div
        className="App"
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
      >
        {this.state.activity.match({
          none: () => (
            <label className="UploadButton">
              <input
                type="file"
                accept=".fit"
                onChange={this.handleUpload}
                ref={this.fileRef}
                style={{ display: "none" }}
              />
              Upload .fit file
            </label>
          ),
          some: ({
            activity,

            startLocation,
            isStartLocationTruncated,
            endLocation,
            isEndLocationTruncated,

            offsetTime,
            offsetIndex,
            viewedDuration,

            cumulatives,
          }) => {
            const { sport, records, total_elapsed_time } = activity;
            const startTime = getFirstRecordTimestampOrActivityStartTime(
              activity
            );
            const endTime = getLastRecordTimestampOrActivityEndTime(activity);
            const shouldConvertRpmToSpm = sport === "running";

            return (
              <div className="ActivityView">
                <div className="Head">
                  <div className="SectionHeader">
                    {monthString(startTime.getMonth()) +
                      " " +
                      startTime.getDate() +
                      " "}
                    {startLocation.match({
                      onUpdate: this.forceUpdate,
                      pending: () => "",
                      fulfilled: (location) =>
                        location.match({
                          none: () => "Unlocated",
                          some: (location) =>
                            location.address.city ||
                            location.address.county ||
                            location.address.state ||
                            location.address.province ||
                            location.address.country,
                        }) + " ",
                      rejected: () => "",
                    })}
                    {capitalizeFirstLetter(sport)}
                  </div>

                  <div className="MinimapBackground" ref={this.minimapRef}>
                    <div
                      className="MinimapForeground"
                      style={{
                        width:
                          (100 * (offsetTime.getTime() - startTime.getTime())) /
                            (endTime.getTime() - startTime.getTime()) +
                          "%",
                      }}
                    />
                  </div>
                </div>

                <div className="Body">
                  <div className="ActivityOverview">
                    <div className="Entry">
                      <span className="Key">Sport: </span>
                      <span className="Value">
                        {capitalizeFirstLetter(sport)}
                      </span>
                    </div>
                    <div className="Entry">
                      <span className="Key">Date: </span>
                      <span className="Value">
                        {dayOfWeekString(startTime.getDay())}{" "}
                        {startTime.getDate()}{" "}
                        {monthString(startTime.getMonth())}{" "}
                        {startTime.getFullYear()}
                      </span>
                    </div>
                    <div className="Entry">
                      <span className="Key">Start location: </span>
                      <span className="Value">
                        {startLocation.match({
                          pending: () => "loading",
                          fulfilled: (startLocation) => (
                            <>
                              <ExpandButton
                                isExpanded={!isStartLocationTruncated}
                                onClick={this.toggleIsStartLocationTruncated}
                              />
                              <Location
                                isTruncated={isStartLocationTruncated}
                                location={startLocation}
                              />
                            </>
                          ),
                          rejected: (err) => {
                            console.log("Error loading start location", err);
                            return "Error loading location";
                          },
                          onUpdate: this.forceUpdate,
                        })}
                      </span>
                    </div>
                    <div className="Entry">
                      <span className="Key">End location: </span>
                      <span className="Value">
                        {endLocation.match({
                          pending: () => "loading",
                          fulfilled: (endLocation) => (
                            <>
                              <ExpandButton
                                isExpanded={!isEndLocationTruncated}
                                onClick={this.toggleIsEndLocationTruncated}
                              />
                              <Location
                                isTruncated={isEndLocationTruncated}
                                location={endLocation}
                              />
                            </>
                          ),
                          rejected: (err) => {
                            console.log("Error loading start location", err);
                            return "Error loading location";
                          },
                          onUpdate: this.forceUpdate,
                        })}
                      </span>
                    </div>
                    <div className="Entry">
                      <span className="Key">Total distance: </span>
                      <span className="Value">
                        {roundTo(metersToMiles(activity.total_distance), 2)}
                      </span>
                    </div>
                    <div className="Entry">
                      <span className="Key">Total duration: </span>
                      <span className="Value">
                        {getDurationFromSecs(total_elapsed_time)}
                      </span>
                    </div>
                    <div className="Entry">
                      <span className="Key">Start time: </span>
                      <span className="Value">{getTime(startTime)}</span>
                    </div>
                    <div className="Entry">
                      <span className="Key">End time: </span>
                      <span className="Value">{getTime(endTime)}</span>
                    </div>
                  </div>

                  <SectionDivider />

                  <div className="TimelineContainer">
                    <Timeline
                      attribute={Attribute.HeartRate}
                      records={records}
                      offsetIndex={offsetIndex}
                      viewedDuration={viewedDuration}
                      filter={this.state.filter}
                      shouldConvertRpmToSpm={shouldConvertRpmToSpm}
                      verticalMin={this.state.timelineBounds.heartRate[0]}
                      verticalMax={this.state.timelineBounds.heartRate[1]}
                    />
                    <Timeline
                      attribute={Attribute.Cadence}
                      records={records}
                      offsetIndex={offsetIndex}
                      viewedDuration={viewedDuration}
                      filter={this.state.filter}
                      shouldConvertRpmToSpm={shouldConvertRpmToSpm}
                      verticalMin={this.state.timelineBounds.cadence[0]}
                      verticalMax={this.state.timelineBounds.cadence[1]}
                    />
                    <Timeline
                      attribute={Attribute.Pace}
                      records={records}
                      offsetIndex={offsetIndex}
                      viewedDuration={viewedDuration}
                      filter={this.state.filter}
                      shouldConvertRpmToSpm={shouldConvertRpmToSpm}
                      verticalMin={this.state.timelineBounds.pace[0]}
                      verticalMax={this.state.timelineBounds.pace[1]}
                    />
                  </div>

                  <SectionDivider />

                  <div className="BoundsContainer">
                    <div className="SectionHeader">Filters: </div>

                    <div className="Bound">
                      <div className="BoundAttribute">Heart Rate</div>
                      <label className="BoundMinLabel">
                        Min:{" "}
                        <input
                          className="BoundMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingHeartRateMin}
                          onChange={this.onChangePendingFilterHeartRateMin}
                          onBlur={this.onSyncPendingFilterBounds}
                        />
                      </label>
                      <label className="BoundMaxLabel">
                        Max:{" "}
                        <input
                          className="BoundMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingHeartRateMax}
                          onChange={this.onChangePendingFilterHeartRateMax}
                          onBlur={this.onSyncPendingFilterBounds}
                        />
                      </label>
                    </div>

                    <div className="Bound">
                      <div className="BoundAttribute">Cadence</div>
                      <label className="BoundMinLabel">
                        Min:{" "}
                        <input
                          className="BoundMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingCadenceMin}
                          onChange={this.onChangePendingFilterCadenceMin}
                          onBlur={this.onSyncPendingFilterBounds}
                        />
                      </label>
                      <label className="BoundMaxLabel">
                        Max:{" "}
                        <input
                          className="BoundMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingCadenceMax}
                          onChange={this.onChangePendingFilterCadenceMax}
                          onBlur={this.onSyncPendingFilterBounds}
                        />
                      </label>
                    </div>

                    <div className="Bound">
                      <div className="BoundAttribute">Pace</div>
                      <label className="BoundMinLabel">
                        Min:{" "}
                        <input
                          className="BoundMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingPaceMin}
                          onChange={this.onChangePendingFilterPaceMin}
                          onBlur={this.onSyncPendingFilterBounds}
                        />
                      </label>
                      <label className="BoundMaxLabel">
                        Max:{" "}
                        <input
                          className="BoundMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingPaceMax}
                          onChange={this.onChangePendingFilterPaceMax}
                          onBlur={this.onSyncPendingFilterBounds}
                        />
                      </label>
                    </div>
                  </div>

                  <SectionDivider />

                  <div className="CumulativesContainer">
                    <div className="SectionHeader">Filtered stats: </div>

                    <div className="Entry">
                      <span className="Key">Total duration: </span>
                      <span className="Value">
                        {getDurationFromSecs(cumulatives.totalDuration)}
                      </span>
                    </div>

                    <div className="Entry">
                      <span className="Key">Total distance (mi): </span>
                      <span className="Value">
                        {roundTo(metersToMiles(cumulatives.totalDistance), 2)}
                      </span>
                    </div>

                    <div className="Entry">
                      <span className="Key">Average pace (min/mi): </span>
                      <span className="Value">
                        {fractionalMinuteToPaceString(cumulatives.averagePace)}
                      </span>
                    </div>

                    <div className="Entry">
                      <span className="Key">Average heart rate (bpm): </span>
                      <span className="Value">
                        {Math.floor(cumulatives.averageHeartRate)}
                      </span>
                    </div>
                  </div>

                  <SectionDivider />

                  <div className="BoundsContainer">
                    <div className="SectionHeader">Y-axis ranges: </div>

                    <div className="Bound">
                      <div className="BoundAttribute">Heart Rate</div>
                      <label className="BoundMinLabel">
                        Min:{" "}
                        <input
                          className="BoundMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.timelineBounds.pendingHeartRateMin}
                          onChange={this.onChangePendingTimelineHeartRateMin}
                          onBlur={this.onSyncPendingTimelineBounds}
                        />
                      </label>
                      <label className="BoundMaxLabel">
                        Max:{" "}
                        <input
                          className="BoundMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.timelineBounds.pendingHeartRateMax}
                          onChange={this.onChangePendingTimelineHeartRateMax}
                          onBlur={this.onSyncPendingTimelineBounds}
                        />
                      </label>
                    </div>

                    <div className="Bound">
                      <div className="BoundAttribute">Cadence</div>
                      <label className="BoundMinLabel">
                        Min:{" "}
                        <input
                          className="BoundMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.timelineBounds.pendingCadenceMin}
                          onChange={this.onChangePendingTimelineCadenceMin}
                          onBlur={this.onSyncPendingTimelineBounds}
                        />
                      </label>
                      <label className="BoundMaxLabel">
                        Max:{" "}
                        <input
                          className="BoundMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.timelineBounds.pendingCadenceMax}
                          onChange={this.onChangePendingTimelineCadenceMax}
                          onBlur={this.onSyncPendingTimelineBounds}
                        />
                      </label>
                    </div>

                    <div className="Bound">
                      <div className="BoundAttribute">Pace</div>
                      <label className="BoundMinLabel">
                        Min:{" "}
                        <input
                          className="BoundMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.timelineBounds.pendingPaceMin}
                          onChange={this.onChangePendingTimelinePaceMin}
                          onBlur={this.onSyncPendingTimelineBounds}
                        />
                      </label>
                      <label className="BoundMaxLabel">
                        Max:{" "}
                        <input
                          className="BoundMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.timelineBounds.pendingPaceMax}
                          onChange={this.onChangePendingTimelinePaceMax}
                          onBlur={this.onSyncPendingTimelineBounds}
                        />
                      </label>
                    </div>
                  </div>

                  <SectionDivider />

                  <div className="LeafletMap" ref={this.mapRef} />
                </div>
              </div>
            );
          },
        })}
      </div>
    );
  }

  handleUpload() {
    const { files } = this.fileRef.current!;
    if (files !== null && "object" === typeof files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
        if (reader.error) {
          throw reader.error;
        } else {
          const buffer = reader.result as ArrayBuffer;
          new EasyFit({
            force: true,
            speedUnit: "km/h",
            lengthUnit: "m",
            temperatureUnit: "kelvin",
            elapsedRecordField: true,
            mode: "cascade",
          }).parse(buffer, (error: any, data: any) => {
            if (error) {
              throw error;
            } else {
              const records = getActivityRecords(data.activity);
              const firstPositionedRecord = getNearestPositionedRecord(
                records,
                0
              );
              const lastPositionedRecord = getNearestPositionedRecord(
                records,
                records.length - 1
              );

              const activity = getActivity(data);

              this.setState({
                activity: Option.some({
                  activity,

                  startLocation: Qprom.fromPromise(
                    firstPositionedRecord.match({
                      none: () => Promise.resolve(Option.none()),
                      some: (record) =>
                        reverseGeocode(
                          record.position_lat,
                          record.position_long
                        ).then((address) => Option.some(address)),
                    })
                  ),
                  isStartLocationTruncated: true,
                  endLocation: Qprom.fromPromise(
                    lastPositionedRecord.match({
                      none: () => Promise.resolve(Option.none()),
                      some: (record) =>
                        reverseGeocode(
                          record.position_lat,
                          record.position_long
                        ).then((address) => Option.some(address)),
                    })
                  ),
                  isEndLocationTruncated: true,

                  offsetTime: getFirstRecordTimestampOrActivityStartTime(
                    activity
                  ),
                  offsetIndex: 0,
                  viewedDuration: STARTING_VIEWED_DURATION,

                  cumulatives: getCumulatives(activity, this.state.filter),

                  timelineScroll: Option.none(),
                }),
              });
            }
          });
        }
      });
      reader.readAsArrayBuffer(file);
    }
  }

  toggleIsStartLocationTruncated() {
    this.setState((state) => ({
      activity: state.activity.map((activity) => ({
        ...activity,
        isStartLocationTruncated: !activity.isStartLocationTruncated,
      })),
    }));
  }

  toggleIsEndLocationTruncated() {
    this.setState((state) => ({
      activity: state.activity.map((activity) => ({
        ...activity,
        isEndLocationTruncated: !activity.isEndLocationTruncated,
      })),
    }));
  }

  onMouseDown(event: React.MouseEvent) {
    this.onPointerDown(event.target as Element, event.clientX, event.clientY);
  }

  onTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    this.onPointerDown(event.target as Element, touch.clientX, touch.clientY);
  }

  onPointerDown(target: Element, x: number, y: number) {
    this.setState((state) => ({
      mouseDownTarget: Option.some(target),
      activity: state.activity.map((state) => ({
        ...state,
        timelineScroll: Option.some({
          initialPointerLocation: { x, y },
          initialOffsetTime: state.offsetTime,
        }),
      })),
    }));
  }

  onMouseUp() {
    this.onPointerUp();
  }

  onTouchEnd() {
    this.onPointerUp();
  }

  onPointerUp() {
    this.setState((state) => ({
      activity: state.activity.map((state) => ({
        ...state,
        timelineScroll: Option.none(),
      })),
      mouseDownTarget: Option.none(),
    }));
  }

  onMouseMove(event: React.MouseEvent) {
    this.onPointerMove(event.clientX, event.clientY);
  }

  onTouchMove(event: React.TouchEvent) {
    const touch = event.touches[0];
    this.onPointerMove(touch.clientX, touch.clientY);
  }

  onPointerMove(x: number, y: number) {
    if (this.minimapRef && this.minimapRef.current) {
      if (this.isCursorDragged()) {
        const rect = this.minimapRef.current.getBoundingClientRect();
        const dx = x - rect.left;
        const rawCompletionFactor = dx / rect.width;
        const clampedCompletionFactor = clamp({
          min: 0,
          max: 1,
          value: rawCompletionFactor,
        });
        this.setState((state) => ({
          activity: state.activity.map((state) => {
            const startTime = getFirstRecordTimestampOrActivityStartTime(
              state.activity
            );
            const endTime = getLastRecordTimestampOrActivityEndTime(
              state.activity
            );
            const offsetTime = lerpDate(
              startTime,
              endTime,
              clampedCompletionFactor
            );
            return {
              ...state,
              offsetTime,
              offsetIndex: getOffsetIndex(state.activity.records, offsetTime),
            };
          }),
        }));
      } else if (this.isTimelineDragged()) {
        this.setState((state) => ({
          activity: state.activity.map((activityState) => {
            return activityState.timelineScroll.match({
              none: () => activityState,
              some: ({ initialPointerLocation, initialOffsetTime }) => {
                const dx = x - initialPointerLocation.x;
                const widthFactor = dx / window.innerWidth;
                const deltaTime = -activityState.viewedDuration * widthFactor;
                const newTimeMillis = initialOffsetTime.getTime() + deltaTime;
                const startTime = getFirstRecordTimestampOrActivityStartTime(
                  activityState.activity
                );
                const endTime = getLastRecordTimestampOrActivityEndTime(
                  activityState.activity
                );
                const clampedMillis = clamp({
                  min: startTime.getTime(),
                  max: endTime.getTime(),
                  value: newTimeMillis,
                });
                const newTime = new Date(clampedMillis);
                const newIndex = getOffsetIndex(
                  activityState.activity.records,
                  newTime
                );
                return {
                  ...activityState,
                  offsetTime: newTime,
                  offsetIndex: newIndex,
                };
              },
            });
          }),
        }));
      }
    }
  }

  isCursorDragged(): boolean {
    const { minimapRef } = this;
    return this.state.mouseDownTarget.match({
      none: () => false,
      some: (target) =>
        !!(
          minimapRef &&
          minimapRef.current &&
          isOrIsAncestorOf(minimapRef.current, target)
        ),
    });
  }

  isTimelineDragged(): boolean {
    return this.state.mouseDownTarget.match({
      none: () => false,
      some: (target) => target.tagName === "CANVAS",
    });
  }

  onChangePendingFilterBound(
    attribute: Attribute,
    boundType: BoundType,
    event: React.ChangeEvent
  ) {
    this.setState({
      filter: this.state.filter.setPendingBound(
        attribute,
        boundType,
        (event.target as HTMLInputElement).value
      ),
    });
  }

  onChangePendingTimelineBound(
    attribute: Attribute,
    boundType: BoundType,
    event: React.ChangeEvent
  ) {
    this.setState({
      timelineBounds: this.state.timelineBounds.setPendingBound(
        attribute,
        boundType,
        (event.target as HTMLInputElement).value
      ),
    });
  }

  onSyncPendingFilterBounds() {
    const filter = this.state.filter.syncPendingBoundsWithActualBounds();
    this.setState({
      filter,
      activity: this.state.activity.map((state) => ({
        ...state,
        cumulatives: getCumulatives(state.activity, filter),
      })),
    });
  }

  onSyncPendingTimelineBounds() {
    const timelineBounds = this.state.timelineBounds.syncPendingBoundsWithActualBounds();
    this.setState({ timelineBounds });
  }
}

interface AppState {
  activity: Option<ActivityViewState>;
  mouseDownTarget: Option<Element>;
  filter: Filter;
  timelineBounds: Filter;
}

interface ActivityViewState {
  activity: Activity;

  startLocation: Qprom<Option<Address>>;
  isStartLocationTruncated: boolean;
  endLocation: Qprom<Option<Address>>;
  isEndLocationTruncated: boolean;

  offsetTime: Date;
  offsetIndex: number;
  viewedDuration: number;

  cumulatives: Cumulatives;

  timelineScroll: Option<{
    initialPointerLocation: { x: number; y: number };
    initialOffsetTime: Date;
  }>;
}

interface LeafletState {
  map: leaflet.Map;
  currentMarker: leaflet.Marker;
  startMarker: leaflet.Marker;
  endMarker: leaflet.Marker;
}

const STARTING_VIEWED_DURATION = 300e3;
const POLYLINE_POINTS = 60;
