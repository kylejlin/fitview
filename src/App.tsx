import React from "react";
import "./App.css";

import ExpandButton from "./components/ExpandButton";
import Location from "./components/Location";

import { isOrIsAncestorOf, EasyFit } from "./lib";

import { getActivity, Activity } from "./getActivity";
import Option from "./Option";
import Qprom from "./Qprom";
import {
  getActivityRecords,
  capitalizeFirstLetter,
  dayOfWeekString,
  monthString,
  getTime,
  getDurationFromMillis,
  reverseGeocode,
  lerpDate,
  getOffsetIndex,
  Address
} from "./helpers";

export default class App extends React.Component<{}, AppState> {
  private fileRef: React.RefObject<HTMLInputElement>;
  private minimapContainerRef: React.RefObject<HTMLDivElement>;
  private minimapRef: React.RefObject<HTMLDivElement>;

  constructor(props: object) {
    super(props);

    this.state = { activity: Option.none(), mouseDownTarget: Option.none() };

    this.fileRef = React.createRef();
    this.minimapContainerRef = React.createRef();
    this.minimapRef = React.createRef();

    this.forceUpdate = this.forceUpdate.bind(this);

    this.handleUpload = this.handleUpload.bind(this);
    this.toggleIsStartLocationTruncated = this.toggleIsStartLocationTruncated.bind(
      this
    );
    this.toggleIsEndLocationTruncated = this.toggleIsEndLocationTruncated.bind(
      this
    );
    this.onFileViewClick = this.onFileViewClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  render() {
    return (
      <div
        className="App"
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
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

            isOverviewTruncated,
            startLocation,
            isStartLocationTruncated,
            endLocation,
            isEndLocationTruncated,

            offsetTime,
            offsetIndex,
            width
          }) => {
            const {
              sport,
              records,
              total_elapsed_time,
              start_time: startTime,
              end_time: endTime
            } = activity;

            return (
              <div className="ActivityView" onClick={this.onFileViewClick}>
                {isOverviewTruncated ? (
                  <>
                    <div className="TimelineContainer">
                      <div
                        className="MinimapContainer"
                        ref={this.minimapContainerRef}
                      >
                        <div className="Entry">
                          <span className="Value">
                            {monthString(startTime.getMonth()) +
                              " " +
                              startTime.getDate() +
                              " "}
                            {startLocation.match({
                              onUpdate: this.forceUpdate,
                              pending: () => "",
                              fulfilled: location =>
                                location.address.city + " ",
                              rejected: () => ""
                            })}
                            {capitalizeFirstLetter(sport)}
                          </span>
                        </div>
                        <div
                          className="MinimapBackground"
                          ref={this.minimapRef}
                        >
                          <div
                            className="MinimapForeground"
                            style={{
                              width:
                                (100 *
                                  (offsetTime.getTime() -
                                    startTime.getTime())) /
                                  (endTime.getTime() - startTime.getTime()) +
                                "%"
                            }}
                          />
                        </div>
                      </div>

                      <div className="TimelineLabel">Heart Rate</div>
                      <div className="Timeline">
                        {records
                          .slice(offsetIndex, offsetIndex + width)
                          .map((record, i) => (
                            <div
                              className="Record"
                              key={record.index}
                              style={{
                                left: 100 * (i / width) + "%",
                                bottom: 100 * (record.heart_rate / 200) + "%"
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ActivityOverview">
                    <div className="Entry">
                      Sport:{" "}
                      <span className="Value">
                        {capitalizeFirstLetter(sport)}
                      </span>
                    </div>
                    <div className="Entry">
                      Date:{" "}
                      <span className="Value">
                        {dayOfWeekString(startTime.getDay())}{" "}
                        {startTime.getDate()}{" "}
                        {monthString(startTime.getMonth())}{" "}
                        {startTime.getFullYear()}
                      </span>
                    </div>
                    <div className="Entry">
                      Start location:{" "}
                      <span className="Value">
                        {startLocation.match({
                          pending: () => "loading",
                          fulfilled: startLocation => (
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
                          rejected: err => {
                            console.log("Error loading start location", err);
                            return "Error loading location";
                          },
                          onUpdate: this.forceUpdate
                        })}
                      </span>
                    </div>
                    <div className="Entry">
                      End location:{" "}
                      <span className="Value">
                        {endLocation.match({
                          pending: () => "loading",
                          fulfilled: endLocation => (
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
                          rejected: err => {
                            console.log("Error loading start location", err);
                            return "Error loading location";
                          },
                          onUpdate: this.forceUpdate
                        })}
                      </span>
                    </div>
                    <div className="Entry">
                      Total duration:{" "}
                      <span className="Value">
                        {getDurationFromMillis(total_elapsed_time)}
                      </span>{" "}
                      Start time:{" "}
                      <span className="Value">{getTime(startTime)}</span> End
                      time: <span className="Value">{getTime(endTime)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          }
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
            mode: "cascade"
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

                  isOverviewTruncated: false,
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

                  offsetTime: activity.start_time,
                  offsetIndex: 0,
                  width: STARTING_WIDTH
                })
              });
            }
          });
        }
      });
      reader.readAsArrayBuffer(file);
    }
  }

  toggleIsStartLocationTruncated() {
    this.setState(state => ({
      activity: state.activity.map(activity => ({
        ...activity,
        isStartLocationTruncated: !activity.isStartLocationTruncated
      }))
    }));
  }

  toggleIsEndLocationTruncated() {
    this.setState(state => ({
      activity: state.activity.map(activity => ({
        ...activity,
        isEndLocationTruncated: !activity.isEndLocationTruncated
      }))
    }));
  }

  onFileViewClick(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).classList.contains("ActivityView")) {
      this.setState(state => ({
        activity: state.activity.map(activity => ({
          ...activity,
          isOverviewTruncated: true
        }))
      }));
    }
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    this.setState({
      mouseDownTarget: Option.some(event.target as Element)
    });
  }

  onMouseUp(event: React.MouseEvent<HTMLDivElement>) {
    const { minimapContainerRef, minimapRef } = this;
    const target = event.target as Element | null;
    this.setState(state => {
      const isTargetDescendantOfTimelineContainer = !!(
        minimapContainerRef &&
        minimapContainerRef.current &&
        target &&
        isOrIsAncestorOf(minimapContainerRef.current, target)
      );
      const wasMinimapBeingDragged = !!state.mouseDownTarget.match({
        none: () => false,
        some: target =>
          minimapRef &&
          minimapRef.current &&
          isOrIsAncestorOf(minimapRef.current, target)
      });
      const shouldExpandOverview =
        isTargetDescendantOfTimelineContainer && !wasMinimapBeingDragged;
      return {
        ...state,
        mouseDownTarget: Option.none(),
        activity: state.activity.map(state => ({
          ...state,
          isOverviewTruncated: !shouldExpandOverview
        }))
      };
    });
  }

  onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (this.isCursorDragged() && this.minimapRef && this.minimapRef.current) {
      const rect = this.minimapRef.current.getBoundingClientRect();
      const dx = event.clientX - rect.left;
      const rawCompletionFactor = dx / rect.width;
      const clampedCompletionFactor = Math.min(
        1,
        Math.max(0, rawCompletionFactor)
      );
      this.setState(state => ({
        activity: state.activity.map(state => {
          const offsetTime = lerpDate(
            state.activity.start_time,
            state.activity.end_time,
            clampedCompletionFactor
          );
          return {
            ...state,
            offsetTime,
            offsetIndex: getOffsetIndex(state.activity.records, offsetTime)
          };
        })
      }));
    }
  }

  isCursorDragged(): boolean {
    const { minimapRef } = this;
    return this.state.mouseDownTarget.match({
      none: () => false,
      some: target =>
        !!(
          minimapRef &&
          minimapRef.current &&
          isOrIsAncestorOf(minimapRef.current, target)
        )
    });
  }
}

interface AppState {
  activity: Option<ActivityViewState>;
  mouseDownTarget: Option<Element>;
}

interface ActivityViewState {
  activity: Activity;

  isOverviewTruncated: boolean;
  startLocation: Qprom<Address>;
  isStartLocationTruncated: boolean;
  endLocation: Qprom<Address>;
  isEndLocationTruncated: boolean;

  offsetTime: Date;
  offsetIndex: number;
  width: number;
}

const STARTING_WIDTH = 87;
