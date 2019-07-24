import React from "react";
import "./App.css";

import ExpandButton from "./components/ExpandButton";
import Location from "./components/Location";
import SectionDivider from "./components/SectionDivider";
import Timeline from "./components/Timeline";

import { isOrIsAncestorOf, EasyFit } from "./lib";

import roundTo from "round-to";

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
  Address,
} from "./helpers";
import Option from "./Option";
import Qprom from "./Qprom";

export default class App extends React.Component<{}, AppState> {
  private fileRef: React.RefObject<HTMLInputElement>;
  private minimapRef: React.RefObject<HTMLDivElement>;

  private onChangePendingHeartRateMin: (event: React.ChangeEvent) => void;
  private onChangePendingHeartRateMax: (event: React.ChangeEvent) => void;
  private onChangePendingCadenceMin: (event: React.ChangeEvent) => void;
  private onChangePendingCadenceMax: (event: React.ChangeEvent) => void;
  private onChangePendingSpeedMin: (event: React.ChangeEvent) => void;
  private onChangePendingSpeedMax: (event: React.ChangeEvent) => void;

  constructor(props: object) {
    super(props);

    this.state = {
      activity: Option.none(),
      mouseDownTarget: Option.none(),
      filter: new Filter({
        heartRate: [0, 200],
        cadence: [0, 200],
        speed: [0, 40],
      }),
    };

    this.fileRef = React.createRef();
    this.minimapRef = React.createRef();

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
    this.onSyncPendingBounds = this.onSyncPendingBounds.bind(this);

    this.onChangePendingHeartRateMin = (e) =>
      this.onChangePendingBound(Attribute.HeartRate, BoundType.Min, e);
    this.onChangePendingHeartRateMax = (e) =>
      this.onChangePendingBound(Attribute.HeartRate, BoundType.Max, e);
    this.onChangePendingCadenceMin = (e) =>
      this.onChangePendingBound(Attribute.Cadence, BoundType.Min, e);
    this.onChangePendingCadenceMax = (e) =>
      this.onChangePendingBound(Attribute.Cadence, BoundType.Max, e);
    this.onChangePendingSpeedMin = (e) =>
      this.onChangePendingBound(Attribute.Pace, BoundType.Min, e);
    this.onChangePendingSpeedMax = (e) =>
      this.onChangePendingBound(Attribute.Pace, BoundType.Max, e);
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
                accept="fit"
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
                      fulfilled: (location) => location.address.city + " ",
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
                    />
                    <Timeline
                      attribute={Attribute.Cadence}
                      records={records}
                      offsetIndex={offsetIndex}
                      viewedDuration={viewedDuration}
                      filter={this.state.filter}
                      shouldConvertRpmToSpm={shouldConvertRpmToSpm}
                    />
                    <Timeline
                      attribute={Attribute.Pace}
                      records={records}
                      offsetIndex={offsetIndex}
                      viewedDuration={viewedDuration}
                      filter={this.state.filter}
                      shouldConvertRpmToSpm={shouldConvertRpmToSpm}
                    />
                  </div>

                  <SectionDivider />

                  <div className="FilterContainer">
                    <div className="SectionHeader">Filters: </div>

                    <div className="Filter">
                      <div className="FilterAttribute">Heart Rate</div>
                      <label className="FilterMinLabel">
                        Min:{" "}
                        <input
                          className="FilterMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingHeartRateMin}
                          onChange={this.onChangePendingHeartRateMin}
                          onBlur={this.onSyncPendingBounds}
                        />
                      </label>
                      <label className="FilterMaxLabel">
                        Max:{" "}
                        <input
                          className="FilterMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingHeartRateMax}
                          onChange={this.onChangePendingHeartRateMax}
                          onBlur={this.onSyncPendingBounds}
                        />
                      </label>
                    </div>

                    <div className="Filter">
                      <div className="FilterAttribute">Cadence</div>
                      <label className="FilterMinLabel">
                        Min:{" "}
                        <input
                          className="FilterMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingCadenceMin}
                          onChange={this.onChangePendingCadenceMin}
                          onBlur={this.onSyncPendingBounds}
                        />
                      </label>
                      <label className="FilterMaxLabel">
                        Max:{" "}
                        <input
                          className="FilterMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingCadenceMax}
                          onChange={this.onChangePendingCadenceMax}
                          onBlur={this.onSyncPendingBounds}
                        />
                      </label>
                    </div>

                    <div className="Filter">
                      <div className="FilterAttribute">Speed</div>
                      <label className="FilterMinLabel">
                        Min:{" "}
                        <input
                          className="FilterMin"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingSpeedMin}
                          onChange={this.onChangePendingSpeedMin}
                          onBlur={this.onSyncPendingBounds}
                        />
                      </label>
                      <label className="FilterMaxLabel">
                        Max:{" "}
                        <input
                          className="FilterMax"
                          type="text"
                          pattern="\d*"
                          value={this.state.filter.pendingSpeedMax}
                          onChange={this.onChangePendingSpeedMax}
                          onBlur={this.onSyncPendingBounds}
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
              const firstSession = data.activity.sessions[0];
              const records = getActivityRecords(data.activity);
              const endRecord = records[records.length - 1];

              const activity = getActivity(data);

              this.setState({
                activity: Option.some({
                  activity,

                  startLocation: Qprom.fromPromise(
                    reverseGeocode(
                      firstSession.start_position_lat,
                      firstSession.start_position_long
                    )
                  ),
                  isStartLocationTruncated: true,
                  endLocation: Qprom.fromPromise(
                    reverseGeocode(
                      endRecord.position_lat,
                      endRecord.position_long
                    )
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
        const clampedCompletionFactor = Math.min(
          1,
          Math.max(0, rawCompletionFactor)
        );
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
                const clampedMillis = Math.max(
                  startTime.getTime(),
                  Math.min(endTime.getTime(), newTimeMillis)
                );
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

  onChangePendingBound(
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

  onSyncPendingBounds() {
    const filter = this.state.filter.syncPendingBoundsWithActualBounds();
    this.setState({
      filter,
      activity: this.state.activity.map((state) => ({
        ...state,
        cumulatives: getCumulatives(state.activity, filter),
      })),
    });
  }
}

interface AppState {
  activity: Option<ActivityViewState>;
  mouseDownTarget: Option<Element>;
  filter: Filter;
}

interface ActivityViewState {
  activity: Activity;

  startLocation: Qprom<Address>;
  isStartLocationTruncated: boolean;
  endLocation: Qprom<Address>;
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

const STARTING_VIEWED_DURATION = 300e3;
