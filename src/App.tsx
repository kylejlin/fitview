import React from "react";
import "./App.css";

import ExpandButton from "./components/ExpandButton";
import Location from "./components/Location";

import { EasyFit } from "./lib";

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
  getOffset,
  Address
} from "./helpers";

export default class App extends React.Component<{}, AppState> {
  private fileRef: React.RefObject<HTMLInputElement>;
  private timelineRef: React.RefObject<HTMLDivElement>;

  constructor(props: object) {
    super(props);

    this.state = { activity: Option.none(), isCursorDragged: false };

    this.fileRef = React.createRef();
    this.timelineRef = React.createRef();

    this.forceUpdate = this.forceUpdate.bind(this);

    this.handleUpload = this.handleUpload.bind(this);
    this.toggleIsStartLocationTruncated = this.toggleIsStartLocationTruncated.bind(
      this
    );
    this.toggleIsEndLocationTruncated = this.toggleIsEndLocationTruncated.bind(
      this
    );
    this.onFileViewClick = this.onFileViewClick.bind(this);
    this.onTimelineMouseDown = this.onTimelineMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTimelineContainerClick = this.onTimelineContainerClick.bind(this);
  }

  render() {
    return (
      <div
        className="App"
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

            timeCursor
          }) => {
            const {
              sport,
              total_elapsed_time,
              start_time: startTime,
              end_time: endTime
            } = activity;

            return (
              <div className="ActivityView" onClick={this.onFileViewClick}>
                {isOverviewTruncated ? (
                  <>
                    <div
                      className="TimelineContainer"
                      onClick={this.onTimelineContainerClick}
                    >
                      <div className="Entry">
                        <span className="Value">
                          {capitalizeFirstLetter(sport)}
                        </span>
                      </div>
                      <div
                        className="Timeline"
                        onMouseDown={this.onTimelineMouseDown}
                        ref={this.timelineRef}
                      >
                        <div
                          className="TimeCursor"
                          style={{
                            width:
                              (100 *
                                (timeCursor.getTime() - startTime.getTime())) /
                                (endTime.getTime() - startTime.getTime()) +
                              "%"
                          }}
                        />
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
          const buffer = reader.result;
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

                  timeCursor: activity.start_time,
                  offset: 0
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

  onTimelineMouseDown() {
    this.setState({
      isCursorDragged: true
    });
  }

  onMouseUp() {
    this.setState({
      isCursorDragged: false
    });
  }

  onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (
      this.state.isCursorDragged &&
      this.timelineRef &&
      this.timelineRef.current
    ) {
      const rect = this.timelineRef.current.getBoundingClientRect();
      const dx = event.clientX - rect.left;
      const rawCompletionFactor = dx / rect.width;
      const clampedCompletionFactor = Math.min(
        1,
        Math.max(0, rawCompletionFactor)
      );
      this.setState(
        state => ({
          activity: state.activity.map(state => {
            const timeCursor = lerpDate(
              state.activity.start_time,
              state.activity.end_time,
              clampedCompletionFactor
            );
            return {
              ...state,
              timeCursor,
              offset: getOffset(state.activity.records, timeCursor)
            };
          })
        }),
        () => console.log(this.state.activity.unwrapOr("None"))
      );
    }
  }

  onTimelineContainerClick(event: React.MouseEvent) {
    if (!(event.target as Element).classList.contains("Timeline")) {
      this.setState(state => ({
        ...state,
        activity: state.activity.map(state => ({
          ...state,
          isOverviewTruncated: false
        }))
      }));
    }
  }
}

interface AppState {
  activity: Option<ActivityViewState>;
  isCursorDragged: boolean;
}

interface ActivityViewState {
  activity: Activity;

  isOverviewTruncated: boolean;
  startLocation: Qprom<Address>;
  isStartLocationTruncated: boolean;
  endLocation: Qprom<Address>;
  isEndLocationTruncated: boolean;

  timeCursor: Date;
  offset: number;
}
